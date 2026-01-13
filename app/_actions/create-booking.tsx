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
  let finalUserId = user?.id

  if (user?.id === "crie") {
    const newId = randomUUID()
    const tempUser = await db.user.create({
      data: {
        name: user.name!,
        email: user.email!,
        id: newId,
      },
    })
    finalUserId = tempUser.id
  }

  if (!finalUserId) {
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Usuário não autenticado")
    }
    finalUserId = session.user.id
  }
  console.log("ID Criado", finalUserId)
  await db.booking.create({
    data: {
      serviceId,
      employeeId,
      date,
      userId: finalUserId,
    },
  })
}
