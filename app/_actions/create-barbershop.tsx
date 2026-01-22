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

export const createBarbershop = async (params: CreateBookingParams) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("Usuário não autenticado ao criar barbearia")
      throw new Error("Usuário não autenticado")
    }

    const ownerId = session.user.id

    const newBarbershop = await db.barbershop.create({
      data: { ...params, ownerId },
    })

    try {
      await db.barbershopEmployee.create({
        data: {
          barbershopId: newBarbershop.id,
          userId: ownerId,
        },
      })
    } catch (error) {
      console.error("Erro ao criar employee da barbearia:", error)
    }

    return newBarbershop
  } catch (err) {
    console.error("Erro ao criar barbearia:", err)
    throw new Error("Erro ao criar barbearia")
  }
}
