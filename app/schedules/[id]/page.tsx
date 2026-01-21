/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { format, isPast } from "date-fns"
import Header from "@/components/header"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { DialogContent, Dialog } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import NewBooking from "@/components/new-booking"
import { generateTimeSlots } from "@/lib/generate-time-slots"

interface Booking {
  id: string
  date: string
  userName: string
  serviceName: string
}

interface Employee {
  id: string
  name: string
  bookings: Booking[]
}

interface Services {
  id: string
  name: string
}

interface Barbershop {
  id: string
  name: string
  employees: Employee[]
  services: Services[]
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

export default function Schedules({ params }: { params: { id: string } }) {
  const [barbershop, setBarbershop] = useState<any>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarSheetIsOpen, setCalendarSheetIsOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [newBooking, setNewBooking] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
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

  const weekDay = selectedDate
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase()

  const dayAvailability = availability.find(
    (d) => d.day === weekDay && d.enabled,
  )

  const slots = dayAvailability
    ? generateTimeSlots({
        day: selectedDate,
        startHour: dayAvailability.startHour,
        endHour: dayAvailability.endHour,
      })
    : []

  useEffect(() => {
    if (!dayAvailability) {
      console.log("Nenhuma disponibilidade para", weekDay)
      return
    }

    console.log("Slots do dia", weekDay)
    slots.forEach((slot) => console.log(format(slot, "HH:mm")))
  }, [slots, weekDay, dayAvailability])

  useEffect(() => {
    if (!selectedEmployee?.id) return

    fetch(`/api/availability?employeeId=${selectedEmployee.id}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch((err) => console.error(err))
  }, [selectedEmployee])

  useEffect(() => {
    if (!params.id || !selectedDate) return

    const isoDate = selectedDate.toISOString()
    fetch(`/api/barbershop/${params.id}?date=${isoDate}`)
      .then((res) => res.json())
      .then((data: Barbershop) => {
        setBarbershop(data)
        if (!selectedEmployee && data.employees.length > 0) {
          setSelectedEmployee(data.employees[0])
        }
      })
      .catch((err) => console.error("Erro ao buscar barbershop:", err))
  }, [params.id, selectedDate, refreshKey])

  if (!barbershop || !selectedEmployee) return <div>Carregando...</div>

  const bookingsToday = selectedEmployee.bookings.filter(
    (b: any) =>
      format(new Date(b.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd"),
  )

  const handleBookingClick = () => {
    setCalendarSheetIsOpen(!calendarSheetIsOpen)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCalendarSheetIsOpen(false)
  }

  const handleSuccess = () => {
    setNewBooking(false)
    setRefreshKey((prev) => prev + 1)
  }

  const formattedDate = format(selectedDate, "EEEE, dd MMM", { locale: ptBR })
  const capitalized =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div>
      <div>
        <div>
          <Header />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold">Dashboard</h1>
                <h4 className="font-semibold">Olá, Alex Walker</h4>
              </div>
              <Dialog
                open={newBooking}
                onOpenChange={(open) => setNewBooking(open)}
              >
                <DialogTrigger asChild>
                  <Button className="mt-3 p-[10px] pb-4 text-4xl font-extralight">
                    +
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  {barbershop && (
                    <NewBooking
                      barbershop={barbershop}
                      availability={availability}
                      employee={selectedEmployee}
                      services={barbershop.services[0]}
                      onSuccess={handleSuccess}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <div key={refreshKey}>
              <h2 className="mt-10 text-xs font-bold uppercase text-gray-400">
                {barbershop?.name}
              </h2>
              <div className="flex flex-row justify-between gap-4">
                <div
                  className={
                    "my-7 flex cursor-pointer flex-col items-center rounded-2xl px-6 ring-2 ring-secondary"
                  }
                >
                  <div className="relative inline-block">
                    <Button
                      className="bg-transparent hover:bg-transparent"
                      size="sm"
                      onClick={handleBookingClick}
                    >
                      {capitalized}
                    </Button>

                    {calendarSheetIsOpen && (
                      <div className="absolute left-[-25px] z-50 mt-1 border border-secondary">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          required
                          selected={selectedDate}
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
                    )}
                  </div>
                </div>
                <div className="relative my-7 flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 font-medium ring-2 ring-secondary">
                  <button
                    className="bg-transparent text-center text-[15px] hover:bg-transparent"
                    onClick={() => setOpen(!open)}
                  >
                    {selected?.name ? `De: ${selected?.name}` : <div>De:</div>}
                  </button>

                  {open && (
                    <div className="absolute top-full z-50 mt-1 w-[150px] border border-secondary bg-secondary shadow-lg">
                      {barbershop.employees.map((opt) => (
                        <div
                          key={opt.id}
                          className="cursor-pointer bg-background px-4 py-2 text-sm transition hover:bg-primary"
                          onClick={() => {
                            setSelected(opt)
                            setSelectedEmployee(opt)
                            setOpen(false)
                          }}
                        >
                          {opt.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div></div>
              </div>
              <div
                className={
                  "flex cursor-pointer flex-row gap-5 rounded-2xl bg-card pl-6 ring-2 ring-secondary"
                }
              >
                <div className="flex flex-col">
                  {slots.map((slot) => {
                    return (
                      <div
                        key={slot.toISOString()}
                        className="h-[70px] pt-2 font-semibold text-gray-400"
                      >
                        <div>{format(slot, "HH:mm")}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex w-full flex-col">
                  {slots.map((slot) => {
                    const booking = bookingsToday.find(
                      (b: any) =>
                        format(new Date(b.date), "HH:mm") ===
                        format(slot, "HH:mm"),
                    )

                    return (
                      <div
                        key={slot.toISOString()}
                        className="rounded-br-xl rounded-tr-xl ring-2 ring-secondary"
                      >
                        <div
                          className={`flex h-[70px] flex-col justify-center p-2 pl-2 text-xs ${
                            booking
                              ? "w-44 bg-primary ring-2 ring-secondary"
                              : "cursor-pointer"
                          }`}
                        >
                          {booking ? (
                            <>
                              <div className="text-[14px]">
                                {booking.userName}
                              </div>
                              <div className="text-[12px] text-white">
                                {booking.serviceName}
                              </div>
                            </>
                          ) : (
                            <div className="text-[12px] text-white"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
