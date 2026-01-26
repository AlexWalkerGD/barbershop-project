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
      <Card className="rounded-2xl">
        <CardContent className="flex flex-row gap-3 py-2">
          {/* IMAGEM */}
          <div className="relative flex h-[100px] flex-[3.2]">
            <Image
              alt={barbershop.name}
              fill
              className="rounded-2xl object-cover"
              src={barbershop.imageUrl}
            />
          </div>

          {/* TEXTO */}
          <div className="flex flex-[4.8] flex-col py-4">
            <h3 className="line-clamp-2 font-semibold">{barbershop.name}</h3>
            <p className="line-clamp-2 text-sm text-gray-400">
              {barbershop.address}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-[2] flex-col">
            <Button className="mt-3" asChild>
              <Link href={`/schedules/${barbershop.id}`}>Agenda</Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="mt-3">
                  <FaGear />
                </Button>
              </SheetTrigger>
              <SidebarConfig
                barbershop={barbershop}
                onSuccess={() => handleDeleteBarbershop(barbershop.id)}
              />
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InfoBarbershop
