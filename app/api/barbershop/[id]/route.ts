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

  // Pega a data da query string do front
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
              service: true, // adicionado
            },
          },
        },
      },
    },
  })

  if (!barbershop)
    return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })

  // Transformar os dados para o formato do front
  const employees = []

  // Admin como employee
  if (barbershop.owner) {
    const adminBookings = await db.booking.findMany({
      where: {
        employeeId: barbershop.owner.id,
        date: {
          gte: startOfDay(selectedDate),
          lte: endOfDay(selectedDate),
        },
      },
      include: { user: true, service: true }, // incluído service
    })
    employees.push({
      id: barbershop.owner.id,
      name: barbershop.owner.name,
      bookings: adminBookings.map((b) => ({
        id: b.id,
        date: b.date,
        userName: b.user?.name ?? "Cliente",
        serviceName: b.service?.name ?? "Serviço",
      })),
    })
  }

  // Colaboradores
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

  return NextResponse.json({
    id: barbershop.id,
    name: barbershop.name,
    employees,
  })
}
