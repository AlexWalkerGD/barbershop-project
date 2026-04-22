import DashboardContent from "@/components/dashboard-content"
import { authOptions } from "@/lib/auth"
import { BarbershopWithRelations } from "@/lib/barbershop"
import { db } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { getDashboardStats } from "../_data/get-dashboard-stats"
import { getNewClients } from "../_data/get-new-clients"

const DashboardPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  if (session.user.role === "USER") {
    redirect("/signature")
  }

  const [dashboardStats, newClients, barbershops] = await Promise.all([
    getDashboardStats(session.user.id),
    getNewClients(session.user.id),
    db.barbershop.findMany({
      where: { ownerId: session.user.id },
      include: {
        services: true,
        employees: {
          include: {
            user: true,
          },
        },
      },
    }),
  ])

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
      dashboardStats={dashboardStats}
      newClients={newClients}
    />
  )
}

export default DashboardPage
