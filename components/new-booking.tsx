import React, { useState } from "react"
import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"

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

const NewBooking = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarSheetIsOpen, setCalendarSheetIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCalendarSheetIsOpen(false)
  }

  const handleBookingClick = () => {
    setCalendarSheetIsOpen(!calendarSheetIsOpen)
  }
  const formattedDate = format(selectedDate, "EEEE, dd MMM", { locale: ptBR })
  const capitalized =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <Dialog>
      <div className="flex w-full max-w-full flex-col gap-2 overflow-x-auto p-2 [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 px-6 pt-4">
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

          <DialogDescription>Selecione a data</DialogDescription>

          <div className="relative inline-block">
            <Button
              className="bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
              size="sm"
              onClick={handleBookingClick}
            >
              {capitalized}
            </Button>

            {calendarSheetIsOpen && (
              <div className="absolute rounded-xl p-1 ring-2 ring-secondary">
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

          <div className="relative inline-block">
            <Button
              className="bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
              size="sm"
            >
              Funcionários
            </Button>
          </div>
          <div className="relative inline-block">
            <Button
              className="bg-transparent px-28 ring-1 ring-secondary hover:bg-transparent"
              size="sm"
            >
              Serviço
            </Button>
          </div>
          <Button>Adicionar</Button>
        </div>
      </div>
    </Dialog>
  )
}

export default NewBooking
