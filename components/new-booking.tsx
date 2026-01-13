/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from "react"
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import { Barbershop } from "@prisma/client"
import { createBooking } from "@/app/_actions/create-booking"
import { toast } from "sonner"
import { set } from "date-fns"

interface Employee {
  id: string
  name: string
}
interface Services {
  id: string
  name: string
}

interface BarbershopWithEmployeesServices extends Barbershop {
  employees: Employee[]
  services: Services[]
}

interface NewBookingProps {
  barbershop: BarbershopWithEmployeesServices
  employee: Employee
  services: Services
  onSuccess: () => void
}

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

const NewBooking = ({
  employee,
  barbershop,
  services,
  onSuccess,
}: NewBookingProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
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

  return (
    <Dialog>
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

          <h2 className="text-sm text-[#94A3B8]">Selecione a data</h2>

          <div className="relative inline-block rounded-xl p-2 ring-2 ring-secondary">
            <Calendar
              mode="single"
              locale={ptBR}
              required
              selected={selectedDay}
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

          <div className="flex w-full max-w-full flex-nowrap gap-2 overflow-x-auto border-x-2 p-2 [&::-webkit-scrollbar]:hidden">
            {TIME_LIST.length > 0 ? (
              TIME_LIST.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="shrink-0 rounded-full"
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

          <h2 className="text-sm text-[#94A3B8]">Escolha um funcionário</h2>

          <div className="relative inline-block">
            <Button
              className="bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
              size="sm"
              onClick={() => setEmployeeSelectOpen(!employeeSelectOpen)}
            >
              {selectedEmployee?.name ?? employee.name}
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

          <h2 className="text-sm text-[#94A3B8]">Escolha um serviço</h2>

          <div className="relative inline-block">
            <Button
              className="flex bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
              size="sm"
              onClick={() => setServiceSelectOpen(!serviceSelectOpen)}
            >
              {selectedService?.name ?? services.name}
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
          <Button className="mt-4" onClick={handleCreateBooking}>
            Adicionar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default NewBooking
