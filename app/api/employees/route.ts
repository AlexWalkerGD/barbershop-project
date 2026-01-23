/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("📦 BODY:", body)

    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        image: body.image ?? null,
        role: "BARBER",
      },
    })

    await db.barbershopEmployee.create({
      data: {
        barbershopId: body.barbershopId,
        userId: user.id,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error("🔥 ERROR POST EMPLOYEE:", error)

    return NextResponse.json(
      {
        message: "Erro ao criar employee",
        prismaError: error?.message,
        meta: error?.meta ?? null,
      },
      { status: 500 },
    )
  }
}
