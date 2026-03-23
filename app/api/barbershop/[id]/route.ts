import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { getBusinessDayBounds } from "@/lib/timezone-utils"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    if (!id) {
      console.error("GET /api/barbershop chamado sem id")
      return NextResponse.json(
        { error: "Barbershop id required" },
        { status: 400 },
      )
    }

    const selectedDateStr = req.nextUrl.searchParams.get("date")
    const selectedDate = selectedDateStr
      ? new Date(selectedDateStr)
      : new Date()
    const { start, end } = getBusinessDayBounds(selectedDate)

    const barbershop = await db.barbershop.findUnique({
      where: { id },
      include: {
        owner: true,
        employees: {
          include: {
            user: true,
            bookings: {
              where: {
                date: {
                  gte: start,
                  lte: end,
                },
              },
              include: {
                user: true,
                service: true,
              },
            },
          },
        },
        services: true,
      },
    })

    if (!barbershop) {
      console.error(`Barbershop não encontrada: ${id}`)
      return NextResponse.json(
        { error: "Barbershop not found" },
        { status: 404 },
      )
    }

    // Employees
    const employees = barbershop.employees.map((emp) => ({
      id: emp.id,
      name: emp.user?.name ?? "Sem nome",
      bookings: emp.bookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString(),
        userName: b.user?.name ?? "Cliente",
        serviceName: b.service?.name ?? "Serviço",
        durationInMinutes: b.service?.durationInMinutes ?? 30,
      })),
    }))

    // Services
    const services = barbershop.services.map((s) => ({
      id: s.id,
      name: s.name,
      durationInMinutes: s.durationInMinutes,
    }))

    return NextResponse.json({
      id: barbershop.id,
      name: barbershop.name,
      employees,
      services,
    })
  } catch (error) {
    console.error("Erro no GET /api/barbershop:", error)
    return NextResponse.json(
      { error: "Erro ao buscar barbearia" },
      { status: 500 },
    )
  }
}
