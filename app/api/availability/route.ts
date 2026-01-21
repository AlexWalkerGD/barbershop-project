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
            // UNIQUE(employeeId + day) precisa existir no schema
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
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao salvar disponibilidade" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get("employeeId") ?? undefined
  const availability = await db.availability.findMany({ where: { employeeId } })
  return NextResponse.json(availability, { status: 200 })
}
