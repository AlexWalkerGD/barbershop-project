import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

const emailFromAddress =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"

export const getEmailFrom = (barbershopName: string) => {
  if (emailFromAddress.includes("<")) {
    return emailFromAddress
  }

  return `${barbershopName} <${emailFromAddress}>`
}
