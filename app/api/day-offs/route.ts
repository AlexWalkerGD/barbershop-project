import { db } from "@/lib/prisma"
import {
  getBusinessDayBoundsFromDateKey,
  setBusinessTimeOnDate,
} from "@/lib/timezone-utils"
import { addMinutes, isBefore } from "date-fns"
import { NextResponse } from "next/server"

function normalizeEmployeeIds(employeeIds: unknown) {
  if (!Array.isArray(employeeIds)) {
    return []
  }

  return employeeIds.filter(
    (employeeId): employeeId is string =>
      typeof employeeId === "string" && employeeId.trim().length > 0,
  )
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId é obrigatório" },
        { status: 400 },
      )
    }

    const dayOffs = await db.employeeDayOff.findMany({
      where: { employeeId },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(dayOffs, { status: 200 })
  } catch (error) {
    console.error("Erro no GET /api/day-offs:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dias bloqueados" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const employeeIds = normalizeEmployeeIds(body.employeeIds)
    const date = typeof body.date === "string" ? body.date : ""
    const allDay = body.allDay !== false
    const startHour = typeof body.startHour === "string" ? body.startHour : null
    const endHour = typeof body.endHour === "string" ? body.endHour : null
    const reason = typeof body.reason === "string" ? body.reason : null

    if (!employeeIds.length || !date) {
      return NextResponse.json(
        { error: "employeeIds e date são obrigatórios" },
        { status: 400 },
      )
    }

    if (!allDay && (!startHour || !endHour || startHour >= endHour)) {
      return NextResponse.json(
        { error: "startHour e endHour sÃ£o obrigatÃ³rios para perÃ­odo" },
        { status: 400 },
      )
    }

    const { start, end } = getBusinessDayBoundsFromDateKey(date)
    const existingDayOff = await db.employeeDayOff.findFirst({
      where: {
        employeeId: {
          in: employeeIds,
        },
        date,
        allDay,
        startHour: allDay ? null : startHour,
        endHour: allDay ? null : endHour,
      },
    })

    if (existingDayOff) {
      return NextResponse.json(
        { error: "Bloqueio jÃ¡ cadastrado" },
        { status: 409 },
      )
    }

    const bookings = await db.booking.findMany({
      where: {
        employeeId: {
          in: employeeIds,
        },
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

    const bookingIdsToDelete = allDay
      ? bookings.map((booking) => booking.id)
      : bookings
          .filter((booking) => {
            const blockStart = setBusinessTimeOnDate(start, startHour!)
            const blockEnd = setBusinessTimeOnDate(start, endHour!)
            const bookingEnd = addMinutes(
              booking.date,
              booking.service.durationInMinutes,
            )

            return (
              isBefore(booking.date, blockEnd) &&
              isBefore(blockStart, bookingEnd)
            )
          })
          .map((booking) => booking.id)

    await db.$transaction([
      ...employeeIds.map((employeeId) =>
        db.employeeDayOff.create({
          data: {
            employeeId,
            date,
            allDay,
            startHour: allDay ? null : startHour,
            endHour: allDay ? null : endHour,
            reason,
          },
        }),
      ),
      db.booking.deleteMany({
        where: {
          id: {
            in: bookingIdsToDelete,
          },
        },
      }),
    ])

    return NextResponse.json(
      { message: "Dia bloqueado com sucesso" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro no POST /api/day-offs:", error)
    return NextResponse.json({ error: "Erro ao bloquear dia" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const employeeIds = normalizeEmployeeIds(body.employeeIds)
    const date = typeof body.date === "string" ? body.date : ""
    const allDay = typeof body.allDay === "boolean" ? body.allDay : undefined
    const startHour = typeof body.startHour === "string" ? body.startHour : null
    const endHour = typeof body.endHour === "string" ? body.endHour : null

    if (!employeeIds.length || !date) {
      return NextResponse.json(
        { error: "employeeIds e date são obrigatórios" },
        { status: 400 },
      )
    }

    await db.employeeDayOff.deleteMany({
      where: {
        employeeId: {
          in: employeeIds,
        },
        date,
        ...(typeof allDay === "boolean" ? { allDay } : {}),
        ...(startHour ? { startHour } : {}),
        ...(endHour ? { endHour } : {}),
      },
    })

    return NextResponse.json(
      { message: "Dia desbloqueado com sucesso" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro no DELETE /api/day-offs:", error)
    return NextResponse.json(
      { error: "Erro ao remover bloqueio" },
      { status: 500 },
    )
  }
}
