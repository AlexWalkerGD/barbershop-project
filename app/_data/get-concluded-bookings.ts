/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export const getConcludedBookings = async () => {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error("Erro ao obter sessão:", error)
  }
  if (!session?.user) return []

  return db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        lt: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
  })
}
