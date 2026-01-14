import React, { useState } from "react"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from "./ui/button"

type DayAvailability = {
  enabled: boolean
  start: string
  end: string
}

export const AvailabilityCard = () => {
  const WEEK_DAYS = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ]

  const TIME_LIST = [
    { key: "06", hour: "06:00" },
    { key: "07", hour: "07:00" },
    { key: "08", hour: "08:00" },
    { key: "09", hour: "09:00" },
    { key: "10", hour: "10:00" },
    { key: "11", hour: "11:00" },
    { key: "12", hour: "12:00" },
    { key: "13", hour: "13:00" },
    { key: "14", hour: "14:00" },
    { key: "15", hour: "15:00" },
    { key: "16", hour: "16:00" },
    { key: "17", hour: "17:00" },
    { key: "18", hour: "18:00" },
    { key: "19", hour: "19:00" },
    { key: "20", hour: "20:00" },
    { key: "21", hour: "21:00" },
    { key: "22", hour: "22:00" },
    { key: "23", hour: "23:00" },
  ]

  const [availability, setAvailability] = useState<
    Record<string, DayAvailability>
  >(() =>
    WEEK_DAYS.reduce(
      (acc, day) => {
        acc[day.key] = {
          enabled: false,
          start: "",
          end: "",
        }
        return acc
      },
      {} as Record<string, DayAvailability>,
    ),
  )
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
            const dayData = availability[day.key]

            return (
              <div key={day.key} className="flex justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={dayData.enabled}
                    onCheckedChange={(checked) =>
                      setAvailability((prev) => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          enabled: Boolean(checked),
                        },
                      }))
                    }
                    className="h-[20px] w-[20px]"
                  />
                  <Label className="text-base">{day.label}</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    disabled={!dayData.enabled}
                    onValueChange={(value) =>
                      setAvailability((prev) => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          start: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[85px]">
                      <SelectValue placeholder="00:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TIME_LIST.map((time) => {
                          return (
                            <div key={time.key}>
                              <SelectItem value={time.hour}>
                                {time.hour}
                              </SelectItem>
                            </div>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    disabled={!dayData.enabled}
                    onValueChange={(value) =>
                      setAvailability((prev) => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          end: value,
                        },
                      }))
                    }
                  >
                    <SelectTrigger className="w-[85px]">
                      <SelectValue placeholder="00:00" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TIME_LIST.map((time) => {
                          return (
                            <div key={time.key}>
                              <SelectItem value={time.hour}>
                                {time.hour}
                              </SelectItem>
                            </div>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
          <div className="flex justify-center pt-5">
            <Button className="px-10">Salvar</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
