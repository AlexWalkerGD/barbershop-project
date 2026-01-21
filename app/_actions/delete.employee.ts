"use server"

import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteEmployee = async (userId: string, employeeId: string) => {
  await db.booking.deleteMany({
    where: {
      employeeId: employeeId,
    },
  })

  await db.barbershopEmployee.delete({
    where: {
      id: employeeId,
    },
  })

  await db.user.delete({
    where: {
      id: userId,
    },
  })
  revalidatePath("/dashboard")
}
