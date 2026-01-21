"use server"

import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface CreateEmployeeInput {
  name: string
  email: string
  barbershopId: string
  image: string
}

export async function createEmployee(data: CreateEmployeeInput) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "BARBER",
      image: data.image,
    },
  })
}
