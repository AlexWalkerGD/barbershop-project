import { authOptions } from "@/lib/auth"
import { db } from "@/lib/prisma"
import DashboardContent from "@/components/dashboard-content"
import { BarbershopWithRelations } from "@/lib/barbershop"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const DashboardPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  if (session.user.role === "USER") {
    redirect("/signature")
  }

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

  const normalizedBarbershops: BarbershopWithRelations[] = barbershops.map(
    (barbershop) => ({
      ...barbershop,
      services: barbershop.services.map((service) => ({
        id: service.id,
        name: service.name,
        price: Number(service.price),
      })),
      employees: barbershop.employees.map((employee) => ({
        id: employee.id,
        user: {
          id: employee.user.id,
          name: employee.user.name,
          image: employee.user.image,
          email: employee.user.email,
        },
      })),
    }),
  )

  return (
    <DashboardContent
      initialBarbershops={normalizedBarbershops}
      userName={session.user.name}
    />
  )
}

export default DashboardPage
