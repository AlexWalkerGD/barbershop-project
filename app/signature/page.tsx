import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import SignatureClient, { SignatureSubscription } from "./signature-client"

const Signature = async () => {
  const session = await getServerSession(authOptions)

  const subscription = session?.user?.id
    ? await db.subscription.findUnique({
        where: { userId: session.user.id },
        select: {
          status: true,
          currentPeriodEnd: true,
        },
      })
    : null

  const subscriptionPayload: SignatureSubscription | null = subscription
    ? {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      }
    : null

  return <SignatureClient subscription={subscriptionPayload} />
}

export default Signature
