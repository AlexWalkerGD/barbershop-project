"use server"

import { db } from "@/lib/prisma"
import { getBusinessDayBounds } from "@/lib/timezone-utils"

interface GetBookingsProps {
  date: Date
  employeeId: string
}

export const getBookings = ({ date, employeeId }: GetBookingsProps) => {
  const { start, end } = getBusinessDayBounds(date)

  return db.booking.findMany({
    where: {
      employeeId,
      date: {
        lte: end,
        gte: start,
      },
    },
    include: {
      service: {
        select: {
          durationInMinutes: true,
        },
      },
    },
  })
}
