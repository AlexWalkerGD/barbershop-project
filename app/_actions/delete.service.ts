"use server"

import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteService = async (serviceId: string) => {
  await db.barbershopService.delete({
    where: {
      id: serviceId,
    },
  })
  revalidatePath("/dashboard")
}
