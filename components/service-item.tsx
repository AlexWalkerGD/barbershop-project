"use client"

import { useEffect, useMemo, useState } from "react"

import { Barbershop, BarbershopService, User } from "@prisma/client"
import { ptBR } from "date-fns/locale"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isBefore, startOfDay, startOfToday } from "date-fns"
import { createBooking } from "@/app/_actions/create-booking"
import { getBookings } from "@/app/_actions/get_bookings"
import {
  DayOffBlock,
  buildDateFromTime,
  formatDurationLabel,
  generateAvailableTimeStrings,
} from "@/lib/booking-utils"
import { getBusinessDateKey } from "@/lib/timezone-utils"

import BookingSummary from "./booking-summary"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Card, CardContent } from "./ui/card"
import { DialogContent } from "./ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import SignInDialog from "./sign-in-dialog"
import { Dialog } from "@radix-ui/react-dialog"

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, "name">
  employee: User
  activePromotion?: {
    id: string
    name: string
    discountValue: string
  } | null
}

interface AvailabilityItem {
  day: string
  enabled: boolean
  startHour: string
  endHour: string
}

const WEEK_DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const formatCurrency = (value: number) =>
  Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "EUR",
  }).format(value)

const ServiceItem = ({
  employee,
  service,
  barbershop,
  activePromotion,
}: ServiceItemProps) => {
  const router = useRouter()
  const { data } = useSession()

  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayBookings, setDayBookings] = useState<
    { date: Date; service: { durationInMinutes: number } }[]
  >([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [dayOffs, setDayOffs] = useState<DayOffBlock[]>([])
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const allDayOffDateSet = useMemo(
    () =>
      new Set(
        dayOffs
          .filter((dayOff) => dayOff.allDay !== false)
          .map((dayOff) => dayOff.date),
      ),
    [dayOffs],
  )

  const enabledWeekDays = useMemo(
    () =>
      availability.filter((d) => d.enabled).map((d) => WEEK_DAY_INDEX[d.day]),
    [availability],
  )

  const disabledDays = useMemo(
    () => (date: Date) =>
      isBefore(startOfDay(date), startOfToday()) ||
      !enabledWeekDays.includes(date.getDay()) ||
      allDayOffDateSet.has(getBusinessDateKey(date)),
    [enabledWeekDays, allDayOffDateSet],
  )

  useEffect(() => {
    if (!employee?.id) return

    fetch(`/api/availability?employeeId=${employee.id}`)
      .then((res) => res.json())
      .then((response) => setAvailability(response))
      .catch((err) => console.error(err))

    fetch(`/api/day-offs?employeeId=${employee.id}`)
      .then((res) => res.json())
      .then((response) => setDayOffs(response))
      .catch((err) => console.error(err))
  }, [employee])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDay) return

      const bookings = await getBookings({
        date: selectedDay,
        employeeId: employee.id,
      })

      setDayBookings(bookings)
    }

    fetchBookings()
  }, [selectedDay, employee])

  const availableTimes = useMemo(() => {
    if (!selectedDay || !availability.length) return []
    if (allDayOffDateSet.has(getBusinessDateKey(selectedDay))) return []

    const weekDay = selectedDay
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase()

    const dayAvailability = availability.find(
      (item) => item.day === weekDay && item.enabled,
    )

    if (!dayAvailability) return []

    return generateAvailableTimeStrings({
      day: selectedDay,
      startHour: dayAvailability.startHour,
      endHour: dayAvailability.endHour,
      durationInMinutes: service.durationInMinutes ?? 30,
      bookings: dayBookings,
      dayOffs,
    })
  }, [
    selectedDay,
    availability,
    dayBookings,
    service.durationInMinutes,
    allDayOffDateSet,
    dayOffs,
  ])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return

    return buildDateFromTime(selectedDay, selectedTime)
  }, [selectedDay, selectedTime])

  const discountPercentage = activePromotion
    ? Number(activePromotion.discountValue)
    : 0
  const originalPrice = Number(service.price)
  const promotionalPrice =
    discountPercentage > 0
      ? originalPrice * (1 - discountPercentage / 100)
      : originalPrice

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
    if (!selectedDate || isCreatingBooking) return

    try {
      setIsCreatingBooking(true)

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
    } finally {
      setIsCreatingBooking(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {service.imageUrl && (
            <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
              <Image
                alt={service.name}
                src={service.imageUrl}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold">{service.name}</h3>
            <p className="text-sm text-muted-foreground">
              {service.description}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Duração: {formatDurationLabel(service.durationInMinutes ?? 30)}
            </p>

            <div className="flex items-center justify-between">
              <div>
                {activePromotion ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(promotionalPrice)}
                      </p>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        -{discountPercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(originalPrice)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(originalPrice)}
                  </p>
                )}
              </div>

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

                <SheetContent
                  side="right"
                  className="flex w-full flex-col p-5 sm:max-w-[420px]"
                >
                  <SheetHeader className="text-center">
                    <SheetTitle className="text-center">
                      Fazer Reserva
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    <div className="flex justify-center border-b py-5">
                      <div className="w-[250px]">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={selectedDay}
                          onSelect={setSelectedDay}
                          disabled={disabledDays}
                          styles={{
                            head_cell: { width: "100%" },
                            cell: { width: "100%" },
                            button: { width: "100%" },
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
                    </div>

                    <div className="border-b px-5 py-4">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Duração:{" "}
                        {formatDurationLabel(service.durationInMinutes ?? 30)}
                      </p>
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
                          activePromotion={activePromotion}
                        />
                      </div>
                    )}
                  </div>

                  <SheetFooter className="px-5 pb-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={
                        !selectedDay || !selectedTime || isCreatingBooking
                      }
                      className="w-full"
                    >
                      {isCreatingBooking ? "Confirmando..." : "Confirmar"}
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
