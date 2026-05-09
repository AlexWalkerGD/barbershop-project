import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

import PromotionsClient, { Promotion } from "./promotions-client"

const PromotionsPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  if (session.user.role === "USER") {
    redirect("/signature")
  }

  const barbershop = await db.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
    include: {
      promotions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  const promotions: Promotion[] =
    barbershop?.promotions.map((promotion) => ({
      id: promotion.id,
      name: promotion.name,
      description: promotion.description ?? "Promoção sem descrição.",
      discountType:
        promotion.discountType === "PERCENTAGE" ? "percentage" : "amount",
      discountValue: promotion.discountValue.toString(),
      appliesTo: promotion.appliesTo ?? "Todos os serviços",
      active: promotion.active,
    })) ?? []

  return <PromotionsClient initialPromotions={promotions} />
}

export default PromotionsPage
