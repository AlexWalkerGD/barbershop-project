import { set } from "date-fns"
import { SLOT_INTERVAL_MINUTES } from "./booking-utils"

export function generateTimeSlots({
  day,
  startHour,
  endHour,
}: {
  day: Date
  startHour: string
  endHour: string
}) {
  const slots: Date[] = []

  let [hour, minute] = startHour.split(":").map(Number)
  const [endHourNum, endMinute] = endHour.split(":").map(Number)

  while (hour < endHourNum || (hour === endHourNum && minute < endMinute)) {
    const slot = set(day, {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0,
    })

    slots.push(slot)

    minute += SLOT_INTERVAL_MINUTES
    if (minute >= 60) {
      minute = 0
      hour++
    }
  }

  return slots
}
