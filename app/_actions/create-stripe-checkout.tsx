"use server"

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import Stripe from "stripe"
import { actionClient } from "@/lib/next-safe-action"

export const createStripeCheckout = actionClient.action(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found")
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  })
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    client_reference_id: session.user.id,
    metadata: {
      userId: session.user.id,
    },
    subscription_data: {
      metadata: {
        userId: session.user.id,
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  })
  return {
    url: checkoutSession.url,
  }
})
