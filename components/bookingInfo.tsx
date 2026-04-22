import React, { useState } from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { format } from "date-fns/format"
import { ptBR } from "date-fns/locale"
import { formatDurationLabel } from "@/lib/booking-utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { deleteBooking } from "@/app/_actions/delete-booking"
import { toast } from "sonner"

interface Booking {
  id: string
  date: string
  userName: string
  serviceName: string
  durationInMinutes: number
}

interface BookingInfo {
  booking: Booking
}

const BookingInfo = ({ booking }: BookingInfo) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const handleSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen)
  }
  const handleCancelBooking = async () => {
    try {
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Reserva cancelada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva. Tente novamente.")
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger>
        <div className="text-left">
          <div className="text-[14px]">{booking.userName}</div>
          <div className="text-[12px] text-primary-foreground">
            {booking.serviceName}
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="w-[85%]">
        <SheetHeader>
          <SheetTitle className="text-left">
            Informações do Agendamento
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <div className="mb-3 mt-6">
            <div className="relative mt-6 flex h-[180px] w-full items-end">
              <Image
                alt={booking.userName}
                src="/map.png"
                fill
                className="rounded-xl object-cover"
              />

              <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
                <CardContent className="flex items-center gap-3 px-5 py-3">
                  <div>
                    <h3 className="font-bold">{booking.userName}</h3>
                    <p className="text-xs">{}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              <Card>
                <CardContent className="space-y-3 p-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm text-muted-foreground">Data</h2>
                    <p className="text-sm">
                      {format(booking.date, "d 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <h2 className="text-sm text-muted-foreground">Horário</h2>
                    <p className="text-sm">{format(booking.date, "HH:mm")}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <h2 className="text-sm text-muted-foreground">Duração</h2>
                    <p className="text-sm">
                      {formatDurationLabel(booking.durationInMinutes ?? 30)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <div className="flex items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </SheetClose>

            <Dialog>
              <DialogTrigger asChild className="w-full">
                <Button variant="destructive" className="w-full">
                  Cancelar Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <DialogHeader>
                  <DialogTitle>Você quer cancelar sua reserva?</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja fazer o cancelamento? Essa ação é
                    irreversível.
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
                      onClick={handleCancelBooking}
                    >
                      Sim, Cancelar.
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingInfo
