"use server"

import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteBarbershop = async (barbershopsId: string) => {
  await db.barbershopService.deleteMany({
    where: { barbershopId: barbershopsId },
  })

  await db.barbershop.delete({
    where: {
      id: barbershopsId,
    },
  })
  revalidatePath("/dashboard")
}
