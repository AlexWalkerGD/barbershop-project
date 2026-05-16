"use server"

import { randomUUID } from "crypto"

import { addMinutes, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getServerSession } from "next-auth"

import { BarberBookingConfirmation } from "@/components/email/templates/admin-email"
import { CustomerBookingConfirmation } from "@/components/email/templates/client-email"
import { authOptions } from "@/lib/auth"
import { hasBookingOverlap } from "@/lib/booking-utils"
import { getEmailFrom, resend } from "@/lib/email"
import { db } from "@/lib/prisma"
import {
  getBusinessDateKey,
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
    const isManualBooking = user?.id === "crie"

    if (isManualBooking) {
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
        name: true,
        durationInMinutes: true,
        barbershop: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!service) {
      throw new Error("Serviço não encontrado")
    }

    const weekday = getWeekdayInBusinessTimeZone(date)
    const businessDateKey = getBusinessDateKey(date)

    const dayOffs = await db.employeeDayOff.findMany({
      where: {
        employeeId,
        date: businessDateKey,
      },
    })

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

    const hasDayOff = dayOffs.some((dayOff) => {
      if (dayOff.allDay) return true
      if (!dayOff.startHour || !dayOff.endHour) return false

      const blockStart = setBusinessTimeOnDate(date, dayOff.startHour)
      const blockEnd = setBusinessTimeOnDate(date, dayOff.endHour)

      return date < blockEnd && blockStart < bookingEnd
    })

    if (hasDayOff) {
      throw new Error("Funcionário indisponível neste horário")
    }

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

    const booking = await db.booking.create({
      data: {
        serviceId,
        employeeId,
        date,
        userId: finalUserId,
      },
      include: {
        employee: {
          include: {
            user: true,
          },
        },
        service: {
          include: {
            barbershop: true,
          },
        },
        user: true,
      },
    })

    if (!isManualBooking) {
      try {
        const formattedDate = format(booking.date, "dd 'de' MMMM 'de' yyyy", {
          locale: ptBR,
        })
        const formattedTime = format(booking.date, "HH:mm")
        const customerName = booking.user.name ?? "Cliente"
        const barberName = booking.employee.user.name ?? "Barbeiro"
        const shopName = booking.service.barbershop.name
        const emailFrom = getEmailFrom(shopName)

        if (booking.user.email) {
          const customerEmailResponse = await resend.emails.send({
            from: emailFrom,
            to: booking.user.email,
            subject: `Agendamento confirmado - ${shopName}`,
            react: CustomerBookingConfirmation({
              customerName,
              barberName,
              shopName,
              date: formattedDate,
              time: formattedTime,
            }),
          })

          if (customerEmailResponse.error) {
            console.error("Erro ao enviar email para cliente:", {
              to: booking.user.email,
              error: customerEmailResponse.error,
            })
          } else {
            console.log("Email de confirmação enviado para cliente:", {
              to: booking.user.email,
              id: customerEmailResponse.data?.id,
            })
          }
        } else {
          console.warn("Email de cliente não enviado: usuário sem email", {
            userId: booking.user.id,
          })
        }

        if (booking.employee.user.email) {
          const barberEmailResponse = await resend.emails.send({
            from: emailFrom,
            to: booking.employee.user.email,
            subject: `Novo agendamento - ${shopName}`,
            react: BarberBookingConfirmation({
              customerName,
              serviceName: booking.service.name,
              date: formattedDate,
              time: formattedTime,
            }),
          })

          if (barberEmailResponse.error) {
            console.error("Erro ao enviar email para barbeiro:", {
              to: booking.employee.user.email,
              error: barberEmailResponse.error,
            })
          } else {
            console.log("Email de novo agendamento enviado para barbeiro:", {
              to: booking.employee.user.email,
              id: barberEmailResponse.data?.id,
            })
          }
        } else {
          console.warn("Email de barbeiro não enviado: usuário sem email", {
            userId: booking.employee.user.id,
          })
        }
      } catch (emailError) {
        console.error("Erro ao enviar email de agendamento:", emailError)
      }
    }
  } catch (err) {
    console.error("Erro na função createBooking:", err)
    throw err
  }
}
