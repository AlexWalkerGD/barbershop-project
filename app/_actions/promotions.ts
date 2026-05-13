"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

interface CreatePromotionParams {
  name: string
  description?: string
  discountValue: string
  endsAt: string
  serviceId?: string | null
}

interface UpdatePromotionParams extends CreatePromotionParams {
  promotionId: string
  active: boolean
}

const getCurrentUserBarbershop = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuario não autenticado")
  }

  const barbershop = await db.barbershop.findFirst({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
    },
  })

  if (!barbershop) {
    throw new Error("Barbearia não encontrada")
  }

  return barbershop
}

const parseDiscountValue = (discountValue: string) => {
  const normalizedValue = discountValue.replace(",", ".").trim()
  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("O desconto deve ser maior que zero")
  }

  if (parsedValue > 100) {
    throw new Error("O desconto percentual não pode passar de 100")
  }

  return parsedValue
}

const parseEndsAt = (endsAt: string) => {
  const parsedDate = new Date(`${endsAt}T23:59:59.999`)

  if (!endsAt || Number.isNaN(parsedDate.getTime())) {
    throw new Error("A data de termino é obrigatória")
  }

  if (parsedDate < new Date()) {
    throw new Error("A data de termino não pode estar no passado")
  }

  return parsedDate
}

export const createPromotion = async ({
  name,
  description,
  discountValue,
  endsAt,
  serviceId,
}: CreatePromotionParams) => {
  const barbershop = await getCurrentUserBarbershop()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("O nome da promoção é obrigatório")
  }

  if (serviceId) {
    const service = await db.barbershopService.findFirst({
      where: {
        id: serviceId,
        barbershopId: barbershop.id,
      },
      select: {
        id: true,
      },
    })

    if (!service) {
      throw new Error("Serviço não encontrado para esta barbearia")
    }
  }

  const promotion = await db.promotion.create({
    data: {
      name: trimmedName,
      description: description?.trim() || null,
      discountType: "PERCENTAGE",
      discountValue: parseDiscountValue(discountValue),
      endsAt: parseEndsAt(endsAt),
      serviceId: serviceId || null,
      barbershopId: barbershop.id,
    },
  })

  revalidatePath("/promotions")

  return { id: promotion.id }
}

export const updatePromotion = async ({
  promotionId,
  name,
  description,
  discountValue,
  endsAt,
  serviceId,
  active,
}: UpdatePromotionParams) => {
  const barbershop = await getCurrentUserBarbershop()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("O nome da promoção é obrigatório")
  }

  if (serviceId) {
    const service = await db.barbershopService.findFirst({
      where: {
        id: serviceId,
        barbershopId: barbershop.id,
      },
      select: {
        id: true,
      },
    })

    if (!service) {
      throw new Error("Serviço não encontrado para esta barbearia")
    }
  }

  const promotion = await db.promotion.update({
    where: {
      id: promotionId,
      barbershopId: barbershop.id,
    },
    data: {
      name: trimmedName,
      description: description?.trim() || null,
      discountType: "PERCENTAGE",
      discountValue: parseDiscountValue(discountValue),
      endsAt: parseEndsAt(endsAt),
      serviceId: serviceId || null,
      active,
    },
  })

  revalidatePath("/promotions")

  return { id: promotion.id }
}

export const togglePromotionActive = async (promotionId: string) => {
  const barbershop = await getCurrentUserBarbershop()

  const currentPromotion = await db.promotion.findFirst({
    where: {
      id: promotionId,
      barbershopId: barbershop.id,
    },
    select: {
      active: true,
    },
  })

  if (!currentPromotion) {
    throw new Error("Promoção não encontrada")
  }

  const promotion = await db.promotion.update({
    where: {
      id: promotionId,
    },
    data: {
      active: !currentPromotion.active,
    },
  })

  revalidatePath("/promotions")

  return { id: promotion.id, active: promotion.active }
}

export const deletePromotion = async (promotionId: string) => {
  const barbershop = await getCurrentUserBarbershop()

  await db.promotion.delete({
    where: {
      id: promotionId,
      barbershopId: barbershop.id,
    },
  })

  revalidatePath("/promotions")
}
