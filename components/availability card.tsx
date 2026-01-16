"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "./ui/select"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { toast } from "sonner"

type DayAvailability = {
  day: string
  enabled: boolean
  startHour: string
  endHour: string
}

type Props = {
  employees: { id: string; name: string }[]
}

const TIME_LIST = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
)

export const AvailabilityCard = ({ employees }: Props) => {
  const WEEK_DAYS = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ]

  const createInitialAvailability = () =>
    WEEK_DAYS.map((day) => ({
      day: day.key,
      enabled: false,
      startHour: "",
      endHour: "",
    }))

  const [availability, setAvailability] = useState<DayAvailability[]>(
    createInitialAvailability,
  )

  // Busca disponibilidade global (do primeiro employee, por exemplo)
  useEffect(() => {
    if (!employees.length) return
    fetch(`/api/availability?employeeId=${employees[0].id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length) setAvailability(data)
      })
  }, [employees])

  const handleSave = async () => {
    if (!employees.length) return

    // Criar payload para cada employee
    const payload = employees.flatMap((emp) =>
      availability.map((day) => ({
        id: `${emp.id}-${day.day}`, // garante que seja único
        employeeId: emp.id,
        day: day.day,
        enabled: day.enabled,
        startHour: day.startHour,
        endHour: day.endHour,
      })),
    )

    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Erro ao salvar disponibilidade.")
      toast.success("Disponibilidade Atualizada!")
    } catch (error) {
      console.log(error)
      console.log(payload)
      toast.error("Erro ao salvar disponibilidade.")
    }
  }
  return (
    <div>
      <Dialog>
        <DialogHeader>
          <DialogTitle>Disponibilidade</DialogTitle>
          <DialogDescription>
            Configure sua disponibilidade de horário
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 pt-6">
          {WEEK_DAYS.map((day) => {
            const dayData = availability.find((d) => d.day === day.key)!

            return (
              <div key={day.key} className="flex justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={dayData.enabled}
                    onCheckedChange={(checked) =>
                      setAvailability((prev) =>
                        prev.map((d) =>
                          d.day === day.key
                            ? { ...d, enabled: Boolean(checked) }
                            : d,
                        ),
                      )
                    }
                    className="h-[20px] w-[20px]"
                  />
                  <Label className="text-base">{day.label}</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    disabled={!dayData.enabled}
                    value={dayData.startHour}
                    onValueChange={(value) =>
                      setAvailability((prev) =>
                        prev.map((d) =>
                          d.day === day.key ? { ...d, startHour: value } : d,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-[85px]">
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

                  <Select
                    disabled={!dayData.enabled}
                    value={dayData.endHour}
                    onValueChange={(value) =>
                      setAvailability((prev) =>
                        prev.map((d) =>
                          d.day === day.key ? { ...d, endHour: value } : d,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-[85px]">
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
            )
          })}
          <div className="flex justify-center pt-5">
            <Button className="px-10" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
