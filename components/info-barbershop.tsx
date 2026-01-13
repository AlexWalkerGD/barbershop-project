import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { BarbershopItemProps } from "@/lib/barbershop"
import { FaGear } from "react-icons/fa6"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarConfig from "./sidebar-config"
import { toast } from "sonner"
import { deleteBarbershop } from "@/app/_actions/delete-barbershop"

const InfoBarbershop = ({ barbershop, onSuccess }: BarbershopItemProps) => {
  const handleDeleteBarbershop = async (barbershopsId: string) => {
    try {
      await deleteBarbershop(barbershopsId)
      toast.success("Barbearia excluída com sucesso")
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir barbearia. Tente novamente.")
    }
  }

  return (
    <div>
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
              <p className="line-clamp-2 text-sm text-gray-400">
                {barbershop.address}
              </p>
              <div className="flex flex-row gap-2">
                <div className="h-8 w-8"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <Button className="mt-3 w-full" asChild>
                <Link href={`/schedules/${barbershop.id}`}>Ver horários</Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="mt-3 w-full">
                    <FaGear />
                    Configurar
                  </Button>
                </SheetTrigger>
                <SidebarConfig
                  barbershop={barbershop}
                  onSuccess={() => handleDeleteBarbershop(barbershop.id)}
                />
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfoBarbershop
