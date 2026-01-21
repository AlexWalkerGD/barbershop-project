/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react"
import { DialogHeader, DialogDescription, DialogTitle } from "./ui/dialog"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import { Barbershop, Booking } from "@prisma/client"
import { createBooking } from "@/app/_actions/create-booking"
import { toast } from "sonner"
import { isPast, isToday, set } from "date-fns"
import { getBookings } from "@/app/_actions/get_bookings"

const TIME_INCREMENT = 30

interface Employee {
  id: string
  name: string
}
interface Services {
  id: string
  name: string
}
interface Availability {
  day: string
  enabled: boolean
  startHour: string
  endHour: string
}

interface BarbershopWithEmployeesServices extends Barbershop {
  employees: Employee[]
  services: Services[]
}

interface NewBookingProps {
  barbershop: BarbershopWithEmployeesServices
  availability: Availability[]
  employee: Employee
  services: Services
  onSuccess: () => void
}

const NewBooking = ({
  barbershop,
  availability,
  onSuccess,
}: NewBookingProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )

  const WEEK_DAY_INDEX: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

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

    const bookedTimes = bookings.map((b) => b.date.getTime())

    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      const dateWithTime = set(selectedDay, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      })

      const timeStr = `${String(hour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`

      const isBooked = bookedTimes.includes(dateWithTime.getTime())

      if (!(isPast(dateWithTime) && isToday(selectedDay)) && !isBooked) {
        slots.push(timeStr)
      }

      minute += TIME_INCREMENT
      if (minute >= 60) {
        minute = 0
        hour++
      }
    }
    console.log(slots)
    return slots
  }, [selectedDay, availability, bookings])

  const enabledWeekDays = useMemo(
    () =>
      availability.filter((d) => d.enabled).map((d) => WEEK_DAY_INDEX[d.day]),
    [availability],
  )

  const disabledDays = useMemo(
    () => (date: Date) => {
      return isPast(date) || !enabledWeekDays.includes(date.getDay())
    },
    [enabledWeekDays],
  )

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return set(selectedDay, {
      hours: Number(selectedTime.split(":")[0]),
      minutes: Number(selectedTime.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleDateSelect = (date: Date) => {
    setSelectedDay(date)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      if (!name) return toast.error("Nome obrigatório")
      if (!email) return toast.error("Email obrigatório")
      if (!selectedEmployee) return toast.error("Selecione um funcionário")
      if (!selectedService) return toast.error("Selecione um serviço")

      await createBooking({
        serviceId: selectedService.id,
        date: selectedDate,
        employeeId: selectedEmployee.id,
        user: { id: "crie", name: name, email: email },
      })
      toast.success("Reserva criada com sucesso!", {})
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    }
  }

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        employeeId: selectedEmployee?.id,
      })
      setBookings(bookings)
    }
    fetch()
  }, [selectedDay, selectedEmployee])

  return (
    <div className="flex w-full max-w-full flex-col gap-2 overflow-x-auto p-2 [&::-webkit-scrollbar]:hidden">
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col items-center gap-2 px-6 pt-4">
        <DialogDescription>Descreva o cliente</DialogDescription>
        <Input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <h2 className="text-sm text-[#94A3B8]">Escolha um funcionário</h2>

        <div className="relative inline-block">
          <Button
            className="bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
            size="sm"
            onClick={() => setEmployeeSelectOpen(!employeeSelectOpen)}
          >
            {selectedEmployee?.name ?? "Selecione"}
          </Button>

          {employeeSelectOpen && (
            <div className="absolute top-full z-50 mt-1 w-[150px] border border-secondary bg-secondary shadow-lg">
              {barbershop?.employees.map((opt) => (
                <div
                  key={opt.id}
                  className="cursor-pointer bg-background px-4 py-2 text-sm transition hover:bg-primary"
                  onClick={() => {
                    setSelectedEmployee(opt)
                    setEmployeeSelectOpen(false)
                  }}
                >
                  {opt.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-sm text-[#94A3B8]">Selecione a data</h2>

        <div className="relative inline-block rounded-xl p-2 ring-2 ring-secondary">
          <Calendar
            mode="single"
            locale={ptBR}
            required
            selected={selectedDay}
            onSelect={handleDateSelect}
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
        {selectedEmployee && selectedDay && (
          <div className="flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto border-x-2 p-2 [&::-webkit-scrollbar]:hidden">
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
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

        <h2 className="text-sm text-[#94A3B8]">Escolha um serviço</h2>

        <div className="relative inline-block">
          <Button
            className="flex bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
            size="sm"
            onClick={() => setServiceSelectOpen(!serviceSelectOpen)}
          >
            {selectedService?.name ?? "Selecione"}
          </Button>
          {serviceSelectOpen && (
            <div className="absolute top-full z-50 mt-1 w-[150px] border border-secondary bg-secondary shadow-lg">
              {barbershop?.services.map((opt) => (
                <div
                  key={opt.id}
                  className="cursor-pointer bg-background px-4 py-2 text-sm transition hover:bg-primary"
                  onClick={() => {
                    setServiceSelectOpen(false)
                    setSelectedService(opt)
                  }}
                >
                  {opt.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          className="mt-4"
          onClick={handleCreateBooking}
          disabled={!selectedEmployee || !selectedDay || !selectedTime}
        >
          Adicionar
        </Button>
      </div>
    </div>
  )
}

export default NewBooking
