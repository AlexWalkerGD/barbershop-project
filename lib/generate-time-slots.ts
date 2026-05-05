import { set } from "date-fns"
import {
  DayOffBlock,
  SLOT_INTERVAL_MINUTES,
  hasDayOffOverlap,
} from "./booking-utils"

export function generateTimeSlots({
  day,
  startHour,
  endHour,
  dayOffs = [],
}: {
  day: Date
  startHour: string
  endHour: string
  dayOffs?: DayOffBlock[]
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

    const overlapsDayOff = hasDayOffOverlap({
      day,
      start: slot,
      durationInMinutes: SLOT_INTERVAL_MINUTES,
      dayOffs,
    })

    if (!overlapsDayOff) {
      slots.push(slot)
    }

    minute += SLOT_INTERVAL_MINUTES
    if (minute >= 60) {
      minute = 0
      hour++
    }
  }

  return slots
}
