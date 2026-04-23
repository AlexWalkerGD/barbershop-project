"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"

interface UpdateMonthlyGoalParams {
  barbershopId: string
  goalType: "revenue" | "clients"
  goalValue: number
}

export const updateMonthlyGoal = async ({
  barbershopId,
  goalType,
  goalValue,
}: UpdateMonthlyGoalParams) => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  if (goalValue <= 0) {
    throw new Error("A meta deve ser maior que zero")
  }

  const existingBarbershop = await db.barbershop.findFirst({
    where: {
      id: barbershopId,
      ownerId: session.user.id,
    },
    select: {
      id: true,
    },
  })

  if (!existingBarbershop) {
    throw new Error("Barbearia não encontrada")
  }

  const updatedGoal = await db.barbershop.update({
    where: {
      id: barbershopId,
    },
    data: {
      monthlyGoalType: goalType === "clients" ? "CLIENTS" : "REVENUE",
      monthlyGoalValue: goalValue,
    },
    select: {
      monthlyGoalType: true,
      monthlyGoalValue: true,
    },
  })

  revalidatePath("/dashboard")

  return updatedGoal
}
