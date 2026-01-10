import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { db } from "@/lib/prisma"

interface BarbershopPagesProps {
  params: {
    id: string
  }
}

const AvatarCard = async ({ params }: BarbershopPagesProps) => {
  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
      owner: true,
      employees: {
        include: { user: true },
      },
    },
  })
  return (
    <div>
      <Avatar>
        <AvatarImage
          src={barbershop?.owner?.image ?? ""}
          alt={barbershop?.owner?.name ?? "Funcionário"}
        />
        <AvatarFallback>{barbershop?.owner?.name ?? "?"}</AvatarFallback>
      </Avatar>
    </div>
  )
}

export default AvatarCard
