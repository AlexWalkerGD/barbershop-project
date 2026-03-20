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

export function generateAvailableTimeStrings({
  day,
  startHour,
  endHour,
  durationInMinutes,
  bookings,
  includePast = false,
}: {
  day: Date
  startHour: string
  endHour: string
  durationInMinutes: number
  bookings: BookingWithDuration[]
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

    if (!isPastSlot && fitsInSchedule && !overlaps) {
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
