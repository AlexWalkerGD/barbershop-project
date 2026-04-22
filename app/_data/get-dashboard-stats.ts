import { db } from "@/lib/prisma"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns"
import { Prisma } from "@prisma/client"

export type DashboardMetric = {
  value: number
  growth: number
  trend: "up" | "down"
  description: string
}

export type DashboardStats = {
  todayBookings: DashboardMetric
  weekBookings: DashboardMetric
  monthBookings: DashboardMetric
  monthRevenue: DashboardMetric
}

const buildBookingWhere = (
  userId: string,
  startDate: Date,
  endDate: Date,
): Prisma.BookingWhereInput => ({
  date: {
    gte: startDate,
    lte: endDate,
  },
  service: {
    barbershop: {
      ownerId: userId,
    },
  },
})

const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) {
    return {
      growth: current > 0 ? 100 : 0,
      trend: "up" as const,
    }
  }

  const growth = ((current - previous) / previous) * 100

  return {
    growth,
    trend: growth >= 0 ? ("up" as const) : ("down" as const),
  }
}

const createMetric = (
  current: number,
  previous: number,
  description: string,
): DashboardMetric => {
  const { growth, trend } = calculateGrowth(current, previous)

  return {
    value: current,
    growth,
    trend,
    description,
  }
}

const sumBookingPrices = (
  bookings: Array<{
    service: {
      price: Prisma.Decimal
    }
  }>,
) =>
  bookings.reduce((total, booking) => total + Number(booking.service.price), 0)

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const now = new Date()

  const startToday = startOfDay(now)
  const endToday = endOfDay(now)

  const yesterday = subDays(now, 1)
  const startYesterday = startOfDay(yesterday)
  const endYesterday = endOfDay(yesterday)

  const startWeek = startOfWeek(now, { weekStartsOn: 1 })
  const endWeek = endOfWeek(now, { weekStartsOn: 1 })

  const lastWeek = subWeeks(now, 1)
  const startLastWeek = startOfWeek(lastWeek, { weekStartsOn: 1 })
  const endLastWeek = endOfWeek(lastWeek, { weekStartsOn: 1 })

  const startMonth = startOfMonth(now)
  const endMonth = endOfMonth(now)

  const lastMonth = subMonths(now, 1)
  const startLastMonth = startOfMonth(lastMonth)
  const endLastMonth = endOfMonth(lastMonth)

  const todayWhere = buildBookingWhere(userId, startToday, endToday)
  const yesterdayWhere = buildBookingWhere(userId, startYesterday, endYesterday)
  const weekWhere = buildBookingWhere(userId, startWeek, endWeek)
  const lastWeekWhere = buildBookingWhere(userId, startLastWeek, endLastWeek)
  const monthWhere = buildBookingWhere(userId, startMonth, endMonth)
  const lastMonthWhere = buildBookingWhere(userId, startLastMonth, endLastMonth)

  const [
    todayBookingsValue,
    yesterdayBookingsValue,
    weekBookingsValue,
    lastWeekBookingsValue,
    monthBookingsValue,
    lastMonthBookingsValue,
    monthRevenueBookings,
    lastMonthRevenueBookings,
  ] = await Promise.all([
    db.booking.count({ where: todayWhere }),
    db.booking.count({ where: yesterdayWhere }),
    db.booking.count({ where: weekWhere }),
    db.booking.count({ where: lastWeekWhere }),
    db.booking.count({ where: monthWhere }),
    db.booking.count({ where: lastMonthWhere }),
    db.booking.findMany({
      where: monthWhere,
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),
    db.booking.findMany({
      where: lastMonthWhere,
      select: {
        service: {
          select: {
            price: true,
          },
        },
      },
    }),
  ])

  const monthRevenueValue = sumBookingPrices(monthRevenueBookings)
  const lastMonthRevenueValue = sumBookingPrices(lastMonthRevenueBookings)

  return {
    todayBookings: createMetric(
      todayBookingsValue,
      yesterdayBookingsValue,
      "comparado com ontem",
    ),
    weekBookings: createMetric(
      weekBookingsValue,
      lastWeekBookingsValue,
      "comparado com a semana passada",
    ),
    monthBookings: createMetric(
      monthBookingsValue,
      lastMonthBookingsValue,
      "comparado com o mês passado",
    ),
    monthRevenue: createMetric(
      monthRevenueValue,
      lastMonthRevenueValue,
      "comparado com o mês passado",
    ),
  }
}
