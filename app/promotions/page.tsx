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
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      services: {
        orderBy: {
          name: "asc",
        },
      },
    },
  })

  const promotions: Promotion[] =
    barbershop?.promotions.map((promotion) => ({
      id: promotion.id,
      name: promotion.name,
      description: promotion.description ?? "Promocao sem descrição.",
      discountValue: promotion.discountValue.toString(),
      endsAt: promotion.endsAt.toISOString().slice(0, 10),
      serviceId: promotion.serviceId,
      appliesTo: promotion.service?.name ?? "Todos os serviços",
      active: promotion.active,
    })) ?? []

  const services =
    barbershop?.services.map((service) => ({
      id: service.id,
      name: service.name,
    })) ?? []

  return <PromotionsClient initialPromotions={promotions} services={services} />
}

export default PromotionsPage
