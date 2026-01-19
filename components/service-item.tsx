"use client"

import { Barbershop, BarbershopService, Booking, User } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { ptBR } from "date-fns/locale"
import { Calendar } from "./ui/calendar"
import { useEffect, useMemo, useState } from "react"
import { isPast, isToday, set } from "date-fns"
import { createBooking } from "@/app/_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Dialog } from "@radix-ui/react-dialog"
import SignInDialog from "./sign-in-dialog"
import { DialogContent } from "./ui/dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, "name">
  employee: User
}

const TIME_INCREMENT = 30 // minutos

const WEEK_DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const ServiceItem = ({ employee, service, barbershop }: ServiceItemProps) => {
  const router = useRouter()
  const { data } = useSession()

  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [availability, setAvailability] = useState<
    { day: string; enabled: boolean; startHour: string; endHour: string }[]
  >([])

  const enabledWeekDays = useMemo(
    () =>
      availability.filter((d) => d.enabled).map((d) => WEEK_DAY_INDEX[d.day]),
    [availability],
  )

  const disabledDays = useMemo(
    () => (date: Date) =>
      isPast(date) || !enabledWeekDays.includes(date.getDay()),
    [enabledWeekDays],
  )

  useEffect(() => {
    if (!employee?.id) return
    fetch(`/api/availability?employeeId=${employee.id}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch((err) => console.error(err))
  }, [employee])

  useEffect(() => {
    if (!selectedDay || !employee?.id) return
    const fetchBookings = async () => {
      const res = await fetch(
        `/api/bookings?employeeId=${employee.id}&date=${selectedDay.toISOString()}`,
      )
      const data = await res.json()
      setDayBookings(data)
    }
    fetchBookings()
  }, [selectedDay, employee])

  const availableTimes = useMemo(() => {
    if (!selectedDay || !availability.length) return []

    const weekDay = selectedDay
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase()
    const dayAvailability = availability.find(
      (d) => d.day === weekDay && d.enabled,
    )
    if (!dayAvailability) return []

    const slots: string[] = []
    let [hour, minute] = dayAvailability.startHour.split(":").map(Number)
    const [endHour, endMinute] = dayAvailability.endHour.split(":").map(Number)

    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      const dateWithTime = set(selectedDay, { hours: hour, minutes: minute })
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

      if (!(isPast(dateWithTime) && isToday(selectedDay))) {
        if (
          !dayBookings.some(
            (b) => b.date.getHours() === hour && b.date.getMinutes() === minute,
          )
        ) {
          slots.push(timeStr)
        }
      }

      minute += TIME_INCREMENT
      if (minute >= 60) {
        minute = 0
        hour++
      }
    }

    return slots
  }, [selectedDay, availability, dayBookings])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    const [hours, minutes] = selectedTime.split(":").map(Number)
    return set(selectedDay, { hours, minutes })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (!employee) {
      toast.error("Selecione um funcionário")
      return
    }
    if (data?.user) {
      setBookingSheetIsOpen(true)
      return
    }
    setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleCreateBooking = async () => {
    if (!selectedDate) return
    try {
      await createBooking({
        serviceId: service.id,
        date: selectedDate,
        employeeId: employee.id,
        user: undefined,
      })
      handleBookingSheetOpenChange()
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    }
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGEM */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
            />
          </div>

          {/* DIREITA */}
          <div className="space-y-2">
            <h3 className="font-semibold"> {service.name} </h3>
            <p className="text-sm text-gray-400"> {service.description} </p>
            {/* PREÇO E BOTÃO */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "EUR",
                }).format(Number(service.price))}
              </p>
              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="px-0">
                  <SheetHeader>
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  <div className="border-b border-solid py-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={setSelectedDay}
                      disabled={disabledDays}
                      styles={{
                        head_cell: {
                          width: "100%",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {selectedDay && (
                    <div className="flex gap-2 overflow-x-auto p-5 [&::-webkit-scrollbar]:hidden">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="rounded-full"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs">
                          Não há horários disponíveis para este dia.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}
                  <SheetFooter className="px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime}
                    >
                      Confirmar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
