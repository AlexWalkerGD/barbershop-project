import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, imageUrl, description, price, barbershopId } =
      await req.json()

    if (!name || !description || !price || !barbershopId) {
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      )
    }

    const service = await db.barbershopService.create({
      data: {
        name,
        imageUrl,
        description,
        price,
        barbershopId,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 },
    )
  }
}
