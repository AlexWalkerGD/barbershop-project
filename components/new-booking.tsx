/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react"
import { ptBR } from "date-fns/locale"
import { Barbershop } from "@prisma/client"
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
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

import { DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"

interface Employee {
  id: string
  name: string
}

interface Services {
  id: string
  name: string
  durationInMinutes: number
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

const WEEK_DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

const NewBooking = ({
  barbershop,
  availability,
  employee,
  services,
  onSuccess,
}: NewBookingProps) => {
  const [name, setName] = useState("")
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<any>(employee)
  const [selectedService, setSelectedService] = useState<any>(services)
  const [employeeAvailability, setEmployeeAvailability] =
    useState<Availability[]>(availability)
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [bookings, setBookings] = useState<
    { date: Date; service: { durationInMinutes: number } }[]
  >([])
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [dayOffs, setDayOffs] = useState<DayOffBlock[]>([])
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const enabledWeekDays = useMemo(
    () =>
      employeeAvailability
        .filter((d) => d.enabled)
        .map((d) => WEEK_DAY_INDEX[d.day]),
    [employeeAvailability],
  )

  const allDayOffDateSet = useMemo(
    () =>
      new Set(
        dayOffs
          .filter((dayOff) => dayOff.allDay !== false)
          .map((dayOff) => dayOff.date),
      ),
    [dayOffs],
  )

  const disabledDays = useMemo(
    () => (date: Date) =>
      isBefore(startOfDay(date), startOfToday()) ||
      !enabledWeekDays.includes(date.getDay()) ||
      allDayOffDateSet.has(getBusinessDateKey(date)),
    [enabledWeekDays, allDayOffDateSet],
  )

  const availableTimes = useMemo(() => {
    if (!selectedDay || !employeeAvailability.length || !selectedService)
      return []
    if (allDayOffDateSet.has(getBusinessDateKey(selectedDay))) return []

    const weekDay = selectedDay
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase()

    const dayAvailability = employeeAvailability.find(
      (d) => d.day === weekDay && d.enabled,
    )

    if (!dayAvailability) return []

    return generateAvailableTimeStrings({
      day: selectedDay,
      startHour: dayAvailability.startHour,
      endHour: dayAvailability.endHour,
      durationInMinutes: selectedService.durationInMinutes ?? 30,
      bookings,
      dayOffs,
    })
  }, [
    selectedDay,
    employeeAvailability,
    bookings,
    selectedService,
    allDayOffDateSet,
    dayOffs,
  ])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return

    return buildDateFromTime(selectedDay, selectedTime)
  }, [selectedDay, selectedTime])

  const handleCreateBooking = async () => {
    if (isCreatingBooking) return

    try {
      if (!selectedDate) return
      if (!name) return toast.error("Nome obrigatório")
      if (!selectedEmployee) return toast.error("Selecione um funcionário")
      if (!selectedService) return toast.error("Selecione um serviço")

      setIsCreatingBooking(true)

      await createBooking({
        serviceId: selectedService.id,
        date: selectedDate,
        employeeId: selectedEmployee.id,
        user: { id: "crie", name, email: " " },
      })

      toast.success("Reserva criada com sucesso!")
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva!")
    } finally {
      setIsCreatingBooking(false)
    }
  }

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDay || !selectedEmployee?.id) return

      const response = await getBookings({
        date: selectedDay,
        employeeId: selectedEmployee.id,
      })

      setBookings(response)
    }

    fetchBookings()
  }, [selectedDay, selectedEmployee])

  useEffect(() => {
    if (!selectedEmployee?.id) {
      setDayOffs([])
      setEmployeeAvailability([])
      return
    }

    fetch(`/api/availability?employeeId=${selectedEmployee.id}`)
      .then((res) => res.json())
      .then((response) => setEmployeeAvailability(response))
      .catch((err) => console.error(err))

    fetch(`/api/day-offs?employeeId=${selectedEmployee.id}`)
      .then((res) => res.json())
      .then((response) => setDayOffs(response))
      .catch((err) => console.error(err))
  }, [selectedEmployee])

  useEffect(() => {
    setSelectedEmployee(employee)
  }, [employee])

  useEffect(() => {
    setSelectedService(services)
  }, [services])

  useEffect(() => {
    setSelectedTime(undefined)
  }, [selectedService, selectedEmployee, selectedDay])

  return (
    <div className="flex max-h-[100dvh] w-full max-w-full flex-col gap-2 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden">
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col items-center gap-2 px-6 pt-3">
        <Input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="relative inline-block">
          <Button
            className="bg-transparent px-10 text-[#94A3B8] ring-1 ring-secondary hover:bg-transparent"
            size="sm"
            onClick={() => setEmployeeSelectOpen(!employeeSelectOpen)}
          >
            {selectedEmployee?.name ?? "Escolha um funcionário"}
          </Button>

          {employeeSelectOpen && (
            <div className="absolute top-full z-50 mt-1 w-[150px] border border-secondary bg-secondary shadow-lg">
              {barbershop?.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="cursor-pointer bg-background px-4 py-2 text-sm transition hover:bg-primary"
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setEmployeeSelectOpen(false)
                  }}
                >
                  {employee.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative inline-block rounded-xl p-1 ring-1 ring-secondary">
          <Calendar
            mode="single"
            locale={ptBR}
            required
            selected={selectedDay}
            onSelect={(date) => date && setSelectedDay(date)}
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

        <div className="relative inline-block">
          <Button
            className="flex bg-transparent px-10 text-[#94A3B8] ring-1 ring-secondary hover:bg-transparent"
            size="sm"
            onClick={() => setServiceSelectOpen(!serviceSelectOpen)}
          >
            {selectedService?.name ?? "Escolha um serviço"}
          </Button>

          {serviceSelectOpen && (
            <div className="absolute top-full z-50 mt-1 w-[220px] border border-secondary bg-secondary shadow-lg">
              {barbershop?.services.map((service) => (
                <div
                  key={service.id}
                  className="cursor-pointer bg-background px-4 py-2 text-sm transition hover:bg-primary"
                  onClick={() => {
                    setServiceSelectOpen(false)
                    setSelectedService(service)
                  }}
                >
                  {service.name} -{" "}
                  {formatDurationLabel(service.durationInMinutes ?? 30)}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedService && (
          <p className="text-xs text-muted-foreground">
            Duração selecionada:{" "}
            {formatDurationLabel(selectedService.durationInMinutes ?? 30)}
          </p>
        )}

        {selectedEmployee && selectedDay && selectedService && (
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

        <Button
          className="mt-2"
          onClick={handleCreateBooking}
          disabled={
            !selectedEmployee ||
            !selectedDay ||
            !selectedTime ||
            !selectedService ||
            isCreatingBooking
          }
        >
          {isCreatingBooking ? "Adicionando..." : "Adicionar"}
        </Button>
      </div>
    </div>
  )
}

export default NewBooking
