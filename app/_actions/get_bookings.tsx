"use server"

import { endOfDay, startOfDay } from "date-fns"

import { db } from "@/lib/prisma"

interface GetBookingsProps {
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
    include: {
      service: {
        select: {
          durationInMinutes: true,
        },
      },
    },
  })
}
