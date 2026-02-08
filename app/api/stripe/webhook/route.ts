/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/prisma"
import { mapStripeStatus } from "@/lib/stripe-utils"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

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
            status: "ACTIVE",
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(),
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: "ACTIVE",
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(),
          },
        })

        await db.user.update({
          where: { id: userId },
          data: { role: "ADMIN" },
        })

        console.log("Subscription created/updated for user:", userId)
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription

        const result = await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: mapStripeStatus(sub.status),
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : undefined,
          },
        })
        if (result.count === 0) {
          console.warn("No subscription found to update:", sub.id)
        }

        console.log("Subscription updated:", sub.id)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription

        const result = await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: "CANCELED",
          },
        })
        if (result.count === 0) {
          console.warn("No subscription found to cancel:", sub.id)
        }

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
