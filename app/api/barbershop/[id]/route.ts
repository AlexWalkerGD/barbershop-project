import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params

  if (!id)
    return NextResponse.json(
      { error: "Barbershop id required" },
      { status: 400 },
    )
  const selectedDateStr = req.nextUrl.searchParams.get("date")
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date()

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
                gte: startOfDay(selectedDate),
                lte: endOfDay(selectedDate),
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

  if (!barbershop)
    return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })

  const employees = []

  // Employees
  for (const emp of barbershop.employees) {
    employees.push({
      id: emp.id,
      name: emp.user?.name ?? "Sem nome",
      bookings: emp.bookings.map((b) => ({
        id: b.id,
        date: b.date,
        userName: b.user?.name ?? "Cliente",
        serviceName: b.service?.name ?? "Serviço",
      })),
    })
  }

  // Services
  const services = barbershop.services.map((s) => ({
    id: s.id,
    name: s.name,
  }))

  return NextResponse.json({
    id: barbershop.id,
    name: barbershop.name,
    employees,
    services,
  })
}
