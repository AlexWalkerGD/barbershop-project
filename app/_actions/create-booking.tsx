"use server"

import { db } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { randomUUID } from "crypto"

interface User {
  id?: string
  name?: string
  email?: string
}

interface CreateBookingParams {
  serviceId: string
  employeeId: string
  date: Date
  user?: User
}

export const createBooking = async ({
  serviceId,
  employeeId,
  date,
  user,
}: CreateBookingParams) => {
  try {
    let finalUserId = user?.id

    if (user?.id === "crie") {
      try {
        const newId = randomUUID()
        const tempUser = await db.user.create({
          data: {
            name: user.name!,
            email: user.email!,
            id: newId,
          },
        })
        finalUserId = tempUser.id
      } catch (err) {
        console.error("Erro ao criar usuário temporário:", err)
        throw new Error("Não foi possível criar usuário temporário")
      }
    }

    if (!finalUserId) {
      const session = await getServerSession(authOptions)
      if (!session) {
        console.error("Usuário não autenticado ao criar booking")
        throw new Error("Usuário não autenticado")
      }
      finalUserId = session.user.id
    }

    console.log("ID do usuário para booking:", finalUserId)

    try {
      await db.booking.create({
        data: {
          serviceId,
          employeeId,
          date,
          userId: finalUserId,
        },
      })
    } catch (err) {
      console.error("Erro ao criar booking:", err)
      throw new Error("Não foi possível criar o booking")
    }
  } catch (err) {
    console.error("Erro na função createBooking:", err)
    throw err
  }
}
