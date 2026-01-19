"use server"

import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteEmployee = async (employeeId: string) => {
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
  revalidatePath("/dashboard")
}
