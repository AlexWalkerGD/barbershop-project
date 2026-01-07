import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, image, email, barbershopId } = await req.json()

    if (!name || !email || !barbershopId) {
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 },
      )
    }

    // Criar usuário com role BARBER e vincular à barbearia
    const user = await db.user.create({
      data: {
        name,
        image,
        email,
        role: "BARBER",
      },
    })
    await db.barbershopEmployee.create({
      data: {
        barbershopId,
        userId: user.id,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar colaborador" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const barbershopId = url.searchParams.get("barbershopId")

  if (!barbershopId) {
    return NextResponse.json(
      { error: "barbershopId is required" },
      { status: 400 },
    )
  }

  const employees = await db.user.findMany({
    where: {
      barbershops: {
        some: { id: barbershopId },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
  })

  return NextResponse.json(employees)
}
