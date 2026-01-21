import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Pega a sessão do usuário logado
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
      })
    }

    // Busca barbearias do usuário logado
    const barbershops = await db.barbershop.findMany({
      where: { ownerId: session.user.id },
      include: {
        services: true,
        employees: {
          include: {
            user: true,
          },
        },
      },
    })

    return new Response(JSON.stringify(barbershops), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: "Erro ao buscar barbearias" }),
      { status: 500 },
    )
  }
}
