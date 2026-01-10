import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { BarbershopItemProps } from "@/lib/barbershop"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import AddNewEmployee from "./add-new-employee"

const InfoBarbershop = ({ barbershop, onSuccess }: BarbershopItemProps) => {
  const [addNewEmployee, setAddNewEmployee] = useState(false)

  const handleSuccess = async () => {
    setAddNewEmployee(false)
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
              <Dialog>
                <DialogTrigger asChild className="w-full">
                  <Button className="mt-3 w-full" variant="destructive">
                    X
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Você quer excluir sua barbearia?</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja exluir? Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Não
                      </Button>
                    </DialogClose>
                    <DialogClose className="w-full">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => onSuccess()}
                      >
                        Sim, Excluir.
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button className="mt-3 w-full" asChild>
                <Link href={`/schedules/${barbershop.id}`}>Ver horários</Link>
              </Button>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setAddNewEmployee(true)
                }}
              >
                + Colaborador
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={addNewEmployee}
        onOpenChange={(open) => setAddNewEmployee(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewEmployee
            barbershopId={barbershop.id}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InfoBarbershop
