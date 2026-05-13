"use server"

import { authOptions } from "@/lib/auth"
import { actionClient } from "@/lib/next-safe-action"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import Stripe from "stripe"

export const createStripePortal = actionClient.action(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  })

  if (!user?.subscription) {
    throw new Error("Assinatura não encontrada")
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  })

  let stripeCustomerId = user.stripeCustomerId

  if (!stripeCustomerId) {
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId,
    )

    stripeCustomerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id

    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/signature`,
  })

  return {
    url: portalSession.url,
  }
})
