"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"

interface CreateBookingParams {
  serviceId: string
  employeeId: string
  date: Date
}

export const createBooking = async ({
  serviceId,
  employeeId,
  date,
}: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  await db.booking.create({
    data: {
      serviceId,
      employeeId,
      date,
      userId: user.user.id,
    },
  })
}
