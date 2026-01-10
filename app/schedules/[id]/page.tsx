/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import Header from "@/components/header"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

const TIME_LIST = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
]

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

interface Barbershop {
  id: string
  name: string
  employees: Employee[]
}

export default function Schedules({ params }: { params: { id: string } }) {
  const [barbershop, setBarbershop] = useState<any>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarSheetIsOpen, setCalendarSheetIsOpen] = useState(false)

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
  }, [params.id, selectedDate])

  if (!barbershop || !selectedEmployee) return <div>Carregando...</div>

  // Filtra apenas bookings do funcionário selecionado e do dia selecionado
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
            </div>
            <h2 className="mt-10 text-xs font-bold uppercase text-gray-400">
              {barbershop?.name}
            </h2>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row gap-4">
                <div
                  className={
                    "my-7 flex cursor-pointer flex-col items-center rounded-2xl px-6 ring-2 ring-secondary"
                  }
                >
                  <div className="relative inline-block">
                    <Button
                      className="bg-transparent"
                      size="sm"
                      onClick={handleBookingClick}
                    >
                      {capitalized}
                    </Button>

                    {calendarSheetIsOpen && (
                      <div className="absolute z-50 mt-2 border border-secondary">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          required
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={{ before: new Date() }}
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
              </div>
              <div className="flex flex-row gap-4">
                <select
                  value={selectedEmployee?.id}
                  onChange={(e) => {
                    const employee = barbershop.employees.find(
                      (emp: any) => emp.id === e.target.value,
                    )
                    if (employee) setSelectedEmployee(employee)
                  }}
                  className="my-7 flex cursor-pointer rounded-2xl bg-transparent px-5 py-2 text-sm font-semibold ring-2 ring-secondary"
                >
                  <option value="">{selectedEmployee.id[0]}</option>
                  {barbershop.employees.map((emp: any) => (
                    <option
                      className={`bg-secondary hover:border-gray-900`}
                      key={emp.id}
                      value={emp.id}
                    >
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className={
                "flex cursor-pointer flex-row gap-5 rounded-2xl bg-card pl-6 ring-2 ring-secondary"
              }
            >
              <div className="flex flex-col">
                {TIME_LIST.map((time) => {
                  return (
                    <div
                      key={time}
                      className="h-[70px] pt-2 font-semibold text-gray-400"
                    >
                      <div>{time}</div>
                    </div>
                  )
                })}
              </div>
              <div className="flex w-full flex-col">
                {TIME_LIST.map((time) => {
                  const booking = bookingsToday.find(
                    (b: any) => format(new Date(b.date), "HH:mm") === time,
                  )

                  return (
                    <div
                      key={time}
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
  )
}
