import Stripe from "stripe"
import { db } from "@/lib/prisma"
import { getEffectiveUserRole } from "@/lib/subscription-access"
import { mapStripeStatus } from "@/lib/stripe-utils"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
})

export function getCurrentPeriodEndDate(
  subscription: Stripe.Subscription,
): Date | undefined {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000) : undefined
}

export async function syncUserRoleFromStoredSubscription(params: {
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

export async function syncSubscriptionFromCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    throw new Error("No subscription found for checkout session")
  }

  const subscription = (await stripe.subscriptions.retrieve(
    subscriptionId,
  )) as Stripe.Subscription

  const userId =
    session.metadata?.userId ||
    session.client_reference_id ||
    subscription.metadata?.userId

  if (!userId) {
    throw new Error("User ID not found in checkout session metadata")
  }

  const firstItem = subscription.items.data[0]
  const priceId =
    typeof firstItem?.price === "string"
      ? firstItem.price
      : firstItem?.price?.id

  if (!priceId) {
    throw new Error("Subscription missing price/item data")
  }

  const nextStatus = mapStripeStatus(subscription.status)
  const nextCurrentPeriodEnd =
    getCurrentPeriodEndDate(subscription) ?? new Date()

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

  return {
    userId,
    subscriptionId: subscription.id,
    status: nextStatus,
  }
}
