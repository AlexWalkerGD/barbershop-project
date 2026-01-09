"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"

interface CreateBookingParams {
  name: string
  description: string
  address: string
  phones: string
  imageUrl: string
}

export const createBarbeshop = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  await db.barbershop.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...params, ownerId: (user.user as any).id },
  })
}
