import { Barbershop } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

interface BarbershopItemProps {
  barbershop: Barbershop
}

const InfoBarber = ({ barbershop }: BarbershopItemProps) => {
  return (
    <Card className="min-w-[460px] rounded-2xl">
      <CardContent className="flex flex-row items-center gap-5 p-3">
        {/* IMAGEM */}
        <div className="relative h-[100px] w-[128px]">
          <Image
            alt={barbershop.name}
            fill
            className="rounded-2xl object-cover"
            src={barbershop.imageUrl}
          />
        </div>

        {/* TEXTO */}
        <div className="flex w-full flex-row items-center justify-between px-1">
          <div>
            <h3 className="truncate font-semibold">{barbershop.name}</h3>
            <p className="truncate text-sm text-gray-400">
              {barbershop.address}
            </p>
          </div>
          <div className="flex flex-col">
            <Button className="mt-3 w-full" asChild>
              <Link href={`/barbershops/${barbershop.id}`}>Ver horários</Link>
            </Button>
            <Button variant="secondary" className="mt-3 w-full" asChild>
              <Link href={`/barbershops/${barbershop.id}`}>+ Colaborador</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InfoBarber
