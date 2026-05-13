import React, { useEffect, useRef, useState } from "react"
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { ptBR } from "date-fns/locale"
import { Calendar } from "./ui/calendar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"

type DayOff = {
  fromDate: string
  toDate: string
  mode: "all-day" | "period"
  startHour: string
  endHour: string
}

type EmployeeOption = {
  id: string
}

type DayOffProps = {
  employees?: EmployeeOption[]
}

const TIME_LIST = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
)

const DAY_IN_MS = 24 * 60 * 60 * 1000

const dateToInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const inputValueToDate = (date: string) =>
  date ? new Date(`${date}T12:00:00`) : undefined

const getDatesInRange = (fromDate: string, toDate: string) => {
  const from = inputValueToDate(fromDate)
  const to = inputValueToDate(toDate)

  if (!from || !to) return []

  const dates: string[] = []

  for (
    let current = from;
    current <= to;
    current = new Date(current.getTime() + DAY_IN_MS)
  ) {
    dates.push(dateToInputValue(current))
  }

  return dates
}

const DayOff = ({ employees = [] }: DayOffProps) => {
  const [dayOffFromDate, setDayOffFromDate] = useState("")
  const [dayOffToDate, setDayOffToDate] = useState("")
  const [dayOffMode, setDayOffMode] = useState<"all-day" | "period">("all-day")
  const [dayOffStartHour, setDayOffStartHour] = useState("")
  const [dayOffEndHour, setDayOffEndHour] = useState("")
  const [blockedDates, setBlockedDates] = useState<DayOff[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [openCalendar, setOpenCalendar] = useState<"from" | "to" | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpenCalendar(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const resetDayOffForm = () => {
    setDayOffFromDate("")
    setDayOffToDate("")
    setDayOffMode("all-day")
    setDayOffStartHour("")
    setDayOffEndHour("")
  }

  const loadBlockedDates = async () => {
    const firstEmployeeId = employees[0]?.id

    if (!firstEmployeeId) return

    try {
      const response = await fetch(
        `/api/day-offs?employeeId=${firstEmployeeId}`,
      )

      if (!response.ok) {
        throw new Error("Erro ao buscar indisponibilidades.")
      }

      const data = (await response.json()) as {
        date: string
        allDay: boolean
        startHour: string | null
        endHour: string | null
        reason: string | null
      }[]

      setBlockedDates(
        data.map((item) => ({
          fromDate: item.date,
          toDate: item.date,
          mode: item.allDay ? "all-day" : "period",
          startHour: item.startHour ?? "",
          endHour: item.endHour ?? "",
        })),
      )
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar indisponibilidades.")
    }
  }

  useEffect(() => {
    loadBlockedDates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.map((employee) => employee.id).join(",")])

  const handleAddBlockedDate = async () => {
    if (!dayOffFromDate || !dayOffToDate) {
      toast.error("Preencha a data inicial e a final.")
      return
    }

    if (!employees.length) {
      toast.error("Cadastre um colaborador antes de adicionar folga.")
      return
    }

    if (dayOffFromDate > dayOffToDate) {
      toast.error("A data inicial não pode ser maior que a final.")
      return
    }

    if (dayOffMode === "period" && (!dayOffStartHour || !dayOffEndHour)) {
      toast.error("Selecione o horário inicial e final do período.")
      return
    }

    if (dayOffMode === "period" && dayOffStartHour >= dayOffEndHour) {
      toast.error("O horário inicial deve ser menor que o final.")
      return
    }

    const alreadyExists = blockedDates.some(
      (item) =>
        item.fromDate === dayOffFromDate &&
        item.toDate === dayOffToDate &&
        item.mode === dayOffMode &&
        item.startHour === (dayOffMode === "all-day" ? "" : dayOffStartHour) &&
        item.endHour === (dayOffMode === "all-day" ? "" : dayOffEndHour),
    )

    if (alreadyExists) {
      toast.error("Esse bloqueio já está na lista.")
      return
    }

    const datesInRange = getDatesInRange(dayOffFromDate, dayOffToDate)
    const employeeIds = employees.map((employee) => employee.id)

    setIsSaving(true)

    try {
      await Promise.all(
        datesInRange.map(async (date) => {
          const response = await fetch("/api/day-offs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeIds,
              date,
              allDay: dayOffMode === "all-day",
              startHour: dayOffMode === "all-day" ? null : dayOffStartHour,
              endHour: dayOffMode === "all-day" ? null : dayOffEndHour,
              reason:
                dayOffMode === "period"
                  ? `${dayOffStartHour} até ${dayOffEndHour}`
                  : null,
            }),
          })

          if (!response.ok) {
            throw new Error("Erro ao salvar indisponibilidade.")
          }
        }),
      )
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar indisponibilidade.")
      setIsSaving(false)
      return
    }

    setBlockedDates((prev) =>
      [
        ...prev,
        {
          fromDate: dayOffFromDate,
          toDate: dayOffToDate,
          mode: dayOffMode,
          startHour: dayOffMode === "all-day" ? "" : dayOffStartHour,
          endHour: dayOffMode === "all-day" ? "" : dayOffEndHour,
        },
      ].sort((a, b) => a.fromDate.localeCompare(b.fromDate)),
    )

    toast.success("Indisponibilidade salva com sucesso.")
    resetDayOffForm()
    setIsSaving(false)
  }

  const handleRemoveBlockedDate = async (index: number) => {
    const item = blockedDates[index]
    const employeeIds = employees.map((employee) => employee.id)

    if (item && employeeIds.length) {
      try {
        await Promise.all(
          getDatesInRange(item.fromDate, item.toDate).map(async (date) => {
            const response = await fetch("/api/day-offs", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                employeeIds,
                date,
                allDay: item.mode === "all-day",
                startHour: item.mode === "all-day" ? null : item.startHour,
                endHour: item.mode === "all-day" ? null : item.endHour,
              }),
            })

            if (!response.ok) {
              throw new Error("Erro ao remover indisponibilidade.")
            }
          }),
        )
      } catch (error) {
        console.error(error)
        toast.error("Erro ao remover indisponibilidade.")
        return
      }
    }

    setBlockedDates((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`))

  const DateButton = ({
    id,
    value,
    placeholder,
    calendarAlign = "start",
    isOpen,
    onOpen,
    onChange,
  }: {
    id: string
    value: string
    placeholder: string
    calendarAlign?: "start" | "end"
    isOpen: boolean
    onOpen: () => void
    onChange: (value: string) => void
  }) => (
    <div className="relative min-w-0 flex-1 sm:w-[104px] sm:flex-none">
      <button
        id={id}
        type="button"
        onClick={onOpen}
        className="h-9 w-full bg-transparent px-1 text-center text-sm outline-none focus-visible:ring-0"
      >
        {value ? (
          formatDate(value)
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute top-11 z-50 rounded-xl border bg-background shadow-lg ${
            calendarAlign === "end" ? "right-0" : "left-0"
          }`}
        >
          <Calendar
            locale={ptBR}
            className="p-2 [--cell-size:1.75rem] sm:p-3 sm:[--cell-size:2rem]"
            mode="single"
            selected={inputValueToDate(value)}
            onSelect={(date) => {
              if (!date) return
              onChange(dateToInputValue(date))
              setOpenCalendar(null)
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="min-w-0">
      <div className="min-w-0 space-y-4">
        <DialogHeader>
          <DialogTitle>Disponibilidade</DialogTitle>
          <DialogDescription>
            Configure sua disponibilidade de horário
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-w-0 gap-3">
          <div className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3">
            <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:justify-center sm:gap-3">
              <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background sm:flex">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              <DateButton
                id="day-off-from"
                value={dayOffFromDate}
                placeholder="dd/mm/aaaa"
                isOpen={openCalendar === "from"}
                onOpen={() => setOpenCalendar("from")}
                onChange={setDayOffFromDate}
              />
              <ArrowRight className="h-4 text-muted-foreground" />
              <DateButton
                id="day-off-to"
                value={dayOffToDate}
                placeholder="dd/mm/aaaa"
                isOpen={openCalendar === "to"}
                onOpen={() => setOpenCalendar("to")}
                onChange={setDayOffToDate}
                calendarAlign="end"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={dayOffMode === "all-day" ? "default" : "outline"}
              className="h-auto min-h-10 whitespace-normal px-2"
              onClick={() => setDayOffMode("all-day")}
            >
              O dia todo
            </Button>
            <Button
              type="button"
              variant={dayOffMode === "period" ? "default" : "outline"}
              className="h-auto min-h-10 whitespace-normal px-2"
              onClick={() => setDayOffMode("period")}
            >
              Por período
            </Button>
          </div>
        </div>

        {dayOffMode === "period" && (
          <div className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 px-3 py-3">
            <div className="mb-2 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Período da indisponibilidade
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2">
                <Select
                  value={dayOffStartHour}
                  onValueChange={setDayOffStartHour}
                >
                  <SelectTrigger className="min-w-0 bg-background">
                    <SelectValue placeholder="00:00" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TIME_LIST.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid min-w-0 gap-2">
                <Select value={dayOffEndHour} onValueChange={setDayOffEndHour}>
                  <SelectTrigger className="min-w-0 bg-background">
                    <SelectValue placeholder="00:00" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TIME_LIST.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleAddBlockedDate}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Adicionar indisponibilidade"}
        </Button>
      </div>

      <div className="min-w-0 space-y-2">
        <p className="pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Indisponibilidades adicionadas
        </p>

        {blockedDates.length > 0 ? (
          blockedDates.map((item, index) => (
            <div
              key={`${item.fromDate}-${item.toDate}-${item.mode}-${index}`}
              className="flex min-w-0 flex-col gap-3 rounded-xl bg-muted/30 px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="break-words text-sm font-medium">
                  {formatDate(item.fromDate)} até {formatDate(item.toDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.mode === "all-day"
                    ? "O dia todo"
                    : `${item.startHour} até ${item.endHour}`}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => handleRemoveBlockedDate(index)}
              >
                Remover
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhuma indisponibilidade adicionada ainda.
          </p>
        )}
      </div>
    </div>
  )
}

export default DayOff
