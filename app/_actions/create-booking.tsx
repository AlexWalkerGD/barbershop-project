"use server"

import { randomUUID } from "crypto"

import { addMinutes } from "date-fns"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { hasBookingOverlap } from "@/lib/booking-utils"
import { db } from "@/lib/prisma"
import {
  getBusinessDayBounds,
  getWeekdayInBusinessTimeZone,
  setBusinessTimeOnDate,
} from "@/lib/timezone-utils"

interface User {
  id?: string
  name?: string
  email?: string
}

interface CreateBookingParams {
  serviceId: string
  employeeId: string
  date: Date
  user?: User
}

export const createBooking = async ({
  serviceId,
  employeeId,
  date,
  user,
}: CreateBookingParams) => {
  try {
    let finalUserId = user?.id

    if (user?.id === "crie") {
      try {
        const newId = randomUUID()
        const tempEmail =
          user.email?.trim() || `agendamento-${newId}@tempus.local`

        const tempUser = await db.user.create({
          data: {
            name: user.name!,
            email: tempEmail,
            id: newId,
          },
        })
        finalUserId = tempUser.id
      } catch (err) {
        console.error("Erro ao criar usuário temporário:", err)
        throw new Error("Não foi possível criar usuário temporário")
      }
    }

    if (!finalUserId) {
      const session = await getServerSession(authOptions)

      if (!session) {
        console.error("Usuário não autenticado ao criar booking")
        throw new Error("Usuário não autenticado")
      }

      finalUserId = session.user.id
    }

    const service = await db.barbershopService.findUnique({
      where: { id: serviceId },
      select: {
        durationInMinutes: true,
      },
    })

    if (!service) {
      throw new Error("Serviço não encontrado")
    }

    const weekday = getWeekdayInBusinessTimeZone(date)

    const availability = await db.availability.findUnique({
      where: {
        employeeId_day: {
          employeeId,
          day: weekday,
        },
      },
    })

    if (!availability?.enabled) {
      throw new Error("Funcionário indisponível neste dia")
    }

    const workStart = setBusinessTimeOnDate(date, availability.startHour)
    const workEnd = setBusinessTimeOnDate(date, availability.endHour)

    const bookingEnd = addMinutes(date, service.durationInMinutes)

    if (date < workStart || bookingEnd > workEnd) {
      throw new Error("Horário fora da disponibilidade do funcionário")
    }

    const { start, end } = getBusinessDayBounds(date)

    const bookings = await db.booking.findMany({
      where: {
        employeeId,
        date: {
          gte: start,
          lte: end,
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

    const hasOverlap = hasBookingOverlap({
      start: date,
      durationInMinutes: service.durationInMinutes,
      bookings,
    })

    if (hasOverlap) {
      throw new Error("Já existe um agendamento neste intervalo")
    }

    await db.booking.create({
      data: {
        serviceId,
        employeeId,
        date,
        userId: finalUserId,
      },
    })
  } catch (err) {
    console.error("Erro na função createBooking:", err)
    throw err
  }
}
