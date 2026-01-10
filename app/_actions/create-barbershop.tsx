"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"

interface CreateBookingParams {
  name: string
  description: string
  address: string
  phones: string[]
  imageUrl: string
}

export const createBarbeshop = async (params: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Usuário não autenticado")
  }
  const ownerId = session.user.id
  const newBarbershop = await db.barbershop.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...params, ownerId },
  })

  await db.barbershopEmployee.create({
    data: {
      barbershopId: newBarbershop.id,
      userId: ownerId,
    },
  })
  return newBarbershop
}
