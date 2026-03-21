/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/prisma"
import { mapStripeStatus } from "@/lib/stripe-utils"
import { getEffectiveUserRole } from "@/lib/subscription-access"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

function getCurrentPeriodEndDate(
  subscription: Stripe.Subscription,
): Date | undefined {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000) : undefined
}

async function syncUserRoleFromSubscription(params: {
  stripeSubscriptionId: string
  status: "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "CANCELED" | "UNPAID"
  currentPeriodEnd: Date
}) {
  const subscriptionRecord = await db.subscription.findUnique({
    where: { stripeSubscriptionId: params.stripeSubscriptionId },
    include: {
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  })

  if (!subscriptionRecord) {
    console.warn(
      "No subscription found to sync role:",
      params.stripeSubscriptionId,
    )
    return false
  }

  const nextRole = getEffectiveUserRole(subscriptionRecord.user.role, {
    status: params.status,
    currentPeriodEnd: params.currentPeriodEnd,
  })

  await db.user.update({
    where: { id: subscriptionRecord.user.id },
    data: { role: nextRole },
  })

  return true
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("Missing stripe-signature header")
    return new NextResponse("Missing stripe-signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id

        if (!subscriptionId) {
          console.error("No subscription in session")
          break
        }

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId,
        )) as Stripe.Subscription
        const nextStatus = mapStripeStatus(subscription.status)
        const nextCurrentPeriodEnd =
          getCurrentPeriodEndDate(subscription) ?? new Date()

        const firstItem = subscription.items.data[0]
        const priceId =
          typeof firstItem?.price === "string"
            ? firstItem.price
            : firstItem?.price?.id
        if (!priceId) {
          console.error("Subscription missing price/item data")
          break
        }

        const userId =
          session.metadata?.userId ||
          session.client_reference_id ||
          subscription.metadata?.userId
        if (!userId) {
          console.error("User ID not found in session or subscription metadata")
          break
        }

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: nextStatus,
            currentPeriodEnd: nextCurrentPeriodEnd,
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: nextStatus,
            currentPeriodEnd: nextCurrentPeriodEnd,
          },
        })

        await db.user.update({
          where: { id: userId },
          data: {
            role: getEffectiveUserRole("USER", {
              status: nextStatus,
              currentPeriodEnd: nextCurrentPeriodEnd,
            }),
          },
        })
        console.log("Subscription created/updated for user:", userId)
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const nextStatus = mapStripeStatus(sub.status)
        const nextCurrentPeriodEnd = getCurrentPeriodEndDate(sub) ?? new Date()

        const result = await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: nextStatus,
            currentPeriodEnd: nextCurrentPeriodEnd,
          },
        })
        if (result.count === 0) {
          console.warn("No subscription found to update:", sub.id)
          break
        }

        await syncUserRoleFromSubscription({
          stripeSubscriptionId: sub.id,
          status: nextStatus,
          currentPeriodEnd: nextCurrentPeriodEnd,
        })

        console.log("Subscription updated:", sub.id)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const nextCurrentPeriodEnd = getCurrentPeriodEndDate(sub) ?? new Date()

        const result = await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: "CANCELED",
            currentPeriodEnd: nextCurrentPeriodEnd,
          },
        })
        if (result.count === 0) {
          console.warn("No subscription found to cancel:", sub.id)
          break
        }

        await syncUserRoleFromSubscription({
          stripeSubscriptionId: sub.id,
          status: "CANCELED",
          currentPeriodEnd: nextCurrentPeriodEnd,
        })

        console.log("Subscription canceled:", sub.id)
        break
      }

      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return new NextResponse("Webhook handler error", { status: 500 })
  }
}
