type SubscriptionLike = {
  status: "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "CANCELED" | "UNPAID"
  currentPeriodEnd: Date
}

type RoleLike = "ADMIN" | "BARBER" | "USER"

export function hasActiveSubscription(subscription?: SubscriptionLike | null) {
  if (!subscription) {
    return false
  }

  return (
    subscription.status === "ACTIVE" &&
    subscription.currentPeriodEnd.getTime() > Date.now()
  )
}

export function getEffectiveUserRole(
  currentRole: RoleLike,
  subscription?: SubscriptionLike | null,
): RoleLike {
  if (hasActiveSubscription(subscription)) {
    return "ADMIN"
  }

  if (currentRole === "BARBER") {
    return "BARBER"
  }

  return "USER"
}
