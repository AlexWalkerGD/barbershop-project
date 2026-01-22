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
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      console.error("Usuário não autorizado para criar employee")
      throw new Error("Unauthorized")
    }

    try {
      const newUser = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: "BARBER",
          image: data.image,
        },
      })

      try {
        await db.barbershopEmployee.create({
          data: {
            barbershopId: data.barbershopId,
            userId: newUser.id,
          },
        })
      } catch (err) {
        console.error("Erro ao vincular employee à barbearia:", err)
      }

      return newUser
    } catch (err) {
      console.error("Erro ao criar usuário:", err)
      throw new Error("Não foi possível criar o usuário")
    }
  } catch (err) {
    console.error("Erro na função createEmployee:", err)
    throw err
  }
}
