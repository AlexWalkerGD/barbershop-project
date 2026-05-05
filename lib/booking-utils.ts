import { addMinutes, isBefore, set } from "date-fns"

export const SLOT_INTERVAL_MINUTES = 15
export const SERVICE_DURATION_OPTIONS = [
  15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
] as const
export const DEFAULT_SERVICE_DURATION = 30

export interface BookingWithDuration {
  date: Date
  service: {
    durationInMinutes: number
  }
}

export interface DayOffBlock {
  date: string
  allDay?: boolean
  startHour?: string | null
  endHour?: string | null
}

export function buildDateFromTime(day: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  return set(day, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  })
}

export function formatDurationLabel(durationInMinutes: number) {
  if (durationInMinutes < 60) {
    return `${durationInMinutes} min`
  }

  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60

  if (!minutes) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}min`
}

export function bookingEnd(date: Date, durationInMinutes: number) {
  return addMinutes(date, durationInMinutes)
}

export function hasBookingOverlap({
  start,
  durationInMinutes,
  bookings,
}: {
  start: Date
  durationInMinutes: number
  bookings: BookingWithDuration[]
}) {
  const end = bookingEnd(start, durationInMinutes)

  return bookings.some((booking) => {
    const bookingStart = new Date(booking.date)
    const bookingEndDate = bookingEnd(
      bookingStart,
      booking.service.durationInMinutes,
    )

    return isBefore(start, bookingEndDate) && isBefore(bookingStart, end)
  })
}

export function hasDayOffOverlap({
  day,
  start,
  durationInMinutes,
  dayOffs,
}: {
  day: Date
  start: Date
  durationInMinutes: number
  dayOffs: DayOffBlock[]
}) {
  const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(day.getDate()).padStart(2, "0")}`
  const end = bookingEnd(start, durationInMinutes)

  return dayOffs.some((dayOff) => {
    if (dayOff.date !== dateKey) return false
    if (dayOff.allDay !== false) return true
    if (!dayOff.startHour || !dayOff.endHour) return false

    const [startHour, startMinute] = dayOff.startHour.split(":").map(Number)
    const [endHour, endMinute] = dayOff.endHour.split(":").map(Number)
    const blockStart = set(day, {
      hours: startHour,
      minutes: startMinute,
      seconds: 0,
      milliseconds: 0,
    })
    const blockEnd = set(day, {
      hours: endHour,
      minutes: endMinute,
      seconds: 0,
      milliseconds: 0,
    })

    return isBefore(start, blockEnd) && isBefore(blockStart, end)
  })
}

export function generateAvailableTimeStrings({
  day,
  startHour,
  endHour,
  durationInMinutes,
  bookings,
  dayOffs = [],
  includePast = false,
}: {
  day: Date
  startHour: string
  endHour: string
  durationInMinutes: number
  bookings: BookingWithDuration[]
  dayOffs?: DayOffBlock[]
  includePast?: boolean
}) {
  const slots: string[] = []

  let [hour, minute] = startHour.split(":").map(Number)
  const [endHourNumber, endMinuteNumber] = endHour.split(":").map(Number)
  const scheduleEnd = set(day, {
    hours: endHourNumber,
    minutes: endMinuteNumber,
    seconds: 0,
    milliseconds: 0,
  })

  while (
    hour < endHourNumber ||
    (hour === endHourNumber && minute < endMinuteNumber)
  ) {
    const start = set(day, {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0,
    })

    const end = bookingEnd(start, durationInMinutes)
    const isPastSlot = !includePast && isBefore(start, new Date())
    const fitsInSchedule = !isBefore(scheduleEnd, end)
    const overlaps = hasBookingOverlap({
      start,
      durationInMinutes,
      bookings,
    })
    const overlapsDayOff = hasDayOffOverlap({
      day,
      start,
      durationInMinutes,
      dayOffs,
    })

    if (!isPastSlot && fitsInSchedule && !overlaps && !overlapsDayOff) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      )
    }

    minute += SLOT_INTERVAL_MINUTES
    if (minute >= 60) {
      minute = 0
      hour++
    }
  }

  return slots
}
