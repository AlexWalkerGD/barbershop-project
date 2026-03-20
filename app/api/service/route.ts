import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      imageUrl,
      description,
      price,
      barbershopId,
      durationInMinutes,
    } = await req.json()

    if (
      !name ||
      !description ||
      !price ||
      !barbershopId ||
      !durationInMinutes
    ) {
      console.error("POST /api/services: dados insuficientes", {
        name,
        description,
        price,
        barbershopId,
        durationInMinutes,
      })
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      )
    }

    const service = await db.barbershopService.create({
      data: {
        name,
        imageUrl: imageUrl || null,
        description,
        price,
        durationInMinutes,
        barbershopId,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Erro no POST /api/services:", error)
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 },
    )
  }
}
