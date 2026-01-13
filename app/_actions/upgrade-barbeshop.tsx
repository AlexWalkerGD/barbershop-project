"use server"

import { db } from "@/lib/prisma"

interface UpdateBarbershop {
  id: string
  name: string
  description: string
  address: string
  phones: string[]
  imageUrl: string
}

export const updatedBarbershop = async (params: UpdateBarbershop) => {
  const { id, ...data } = params

  await db.barbershop.update({
    where: { id },
    data,
  })
}
