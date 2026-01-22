/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const availability = await req.json()

    await Promise.all(
      availability.map((day: any) =>
        db.availability.upsert({
          where: {
            employeeId_day: { employeeId: day.employeeId, day: day.day },
          },
          update: {
            enabled: day.enabled,
            startHour: day.startHour,
            endHour: day.endHour,
          },
          create: {
            employeeId: day.employeeId,
            day: day.day,
            enabled: day.enabled,
            startHour: day.startHour,
            endHour: day.endHour,
          },
        }),
      ),
    )

    return NextResponse.json(
      { message: "Disponibilidade salva" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro no POST /api/availability:", error)
    return NextResponse.json(
      { error: "Erro ao salvar disponibilidade" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")

    if (!employeeId) {
      console.error("GET /api/availability chamado sem employeeId")
      return NextResponse.json(
        { error: "employeeId é obrigatório" },
        { status: 400 },
      )
    }

    const availability = await db.availability.findMany({
      where: { employeeId },
    })

    return NextResponse.json(availability, { status: 200 })
  } catch (error) {
    console.error("Erro no GET /api/availability:", error)
    return NextResponse.json(
      { error: "Erro ao buscar disponibilidade" },
      { status: 500 },
    )
  }
}
