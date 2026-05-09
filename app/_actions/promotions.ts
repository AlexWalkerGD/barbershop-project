"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

type PromotionDiscountType = "percentage" | "amount"

interface CreatePromotionParams {
  name: string
  description?: string
  discountType: PromotionDiscountType
  discountValue: string
  appliesTo?: string
}

interface UpdatePromotionParams extends CreatePromotionParams {
  promotionId: string
  active: boolean
}

const getCurrentUserBarbershop = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuario nao autenticado")
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
    throw new Error("Barbearia nao encontrada")
  }

  return barbershop
}

const parseDiscountValue = (
  discountValue: string,
  discountType: PromotionDiscountType,
) => {
  const normalizedValue = discountValue.replace(",", ".").trim()
  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error("O desconto deve ser maior que zero")
  }

  if (discountType === "percentage" && parsedValue > 100) {
    throw new Error("O desconto percentual nao pode passar de 100")
  }

  return parsedValue
}

const getDiscountType = (discountType: PromotionDiscountType) => {
  return discountType === "percentage" ? "PERCENTAGE" : "AMOUNT"
}

export const createPromotion = async ({
  name,
  description,
  discountType,
  discountValue,
  appliesTo,
}: CreatePromotionParams) => {
  const barbershop = await getCurrentUserBarbershop()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("O nome da promocao e obrigatorio")
  }

  const promotion = await db.promotion.create({
    data: {
      name: trimmedName,
      description: description?.trim() || null,
      discountType: getDiscountType(discountType),
      discountValue: parseDiscountValue(discountValue, discountType),
      appliesTo: appliesTo?.trim() || "Todos os servicos",
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
  discountType,
  discountValue,
  appliesTo,
  active,
}: UpdatePromotionParams) => {
  const barbershop = await getCurrentUserBarbershop()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("O nome da promocao e obrigatorio")
  }

  const promotion = await db.promotion.update({
    where: {
      id: promotionId,
      barbershopId: barbershop.id,
    },
    data: {
      name: trimmedName,
      description: description?.trim() || null,
      discountType: getDiscountType(discountType),
      discountValue: parseDiscountValue(discountValue, discountType),
      appliesTo: appliesTo?.trim() || "Todos os servicos",
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
    throw new Error("Promocao nao encontrada")
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
