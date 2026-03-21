import { syncSubscriptionFromCheckoutSession } from "@/lib/stripe-subscription-sync"
import { redirect } from "next/navigation"

interface PaymentSuccessPageProps {
  searchParams?: {
    session_id?: string
  }
}

export default async function PaymentSuccess({
  searchParams,
}: PaymentSuccessPageProps) {
  const sessionId = searchParams?.session_id

  if (sessionId) {
    try {
      await syncSubscriptionFromCheckoutSession(sessionId)
    } catch (error) {
      console.error("Failed to sync subscription from success page:", error)
    }
  }

  redirect("/")
}
