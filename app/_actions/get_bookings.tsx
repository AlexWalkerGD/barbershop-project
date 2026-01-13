"use server"

import { db } from "@/lib/prisma"
import { endOfDay, startOfDay } from "date-fns"

interface GetBookingsProps {
  serviceId: string
  date: Date
  employeeId: string
}

export const getBookings = ({ date, employeeId }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      employeeId,
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
