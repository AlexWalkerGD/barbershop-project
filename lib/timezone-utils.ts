const BUSINESS_TIME_ZONE = "Europe/London"

const zonedDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

const zonedWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: "long",
})

function getPartValue(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((part) => part.type === type)?.value ?? ""
}

export function getZonedDateParts(date: Date) {
  const parts = zonedDateTimeFormatter.formatToParts(date)

  return {
    year: Number(getPartValue(parts, "year")),
    month: Number(getPartValue(parts, "month")),
    day: Number(getPartValue(parts, "day")),
    hour: Number(getPartValue(parts, "hour")),
    minute: Number(getPartValue(parts, "minute")),
    second: Number(getPartValue(parts, "second")),
  }
}

function getTimeZoneOffsetMilliseconds(date: Date) {
  const parts = getZonedDateParts(date)
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    0,
  )

  return zonedAsUtc - date.getTime()
}

function zonedDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second = 0,
  millisecond = 0,
}: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second?: number
  millisecond?: number
}) {
  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
  )
  const offset = getTimeZoneOffsetMilliseconds(utcGuess)

  return new Date(utcGuess.getTime() - offset)
}

export function getWeekdayInBusinessTimeZone(date: Date) {
  return zonedWeekdayFormatter.format(date).toLowerCase()
}

export function getBusinessDayBounds(date: Date) {
  const { year, month, day } = getZonedDateParts(date)

  return {
    start: zonedDateTimeToUtc({ year, month, day, hour: 0, minute: 0 }),
    end: zonedDateTimeToUtc({
      year,
      month,
      day,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    }),
  }
}

export function setBusinessTimeOnDate(date: Date, time: string) {
  const { year, month, day } = getZonedDateParts(date)
  const [hour, minute] = time.split(":").map(Number)

  return zonedDateTimeToUtc({
    year,
    month,
    day,
    hour,
    minute,
  })
}

export { BUSINESS_TIME_ZONE }
