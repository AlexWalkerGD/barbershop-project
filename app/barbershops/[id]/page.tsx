import EmployeeSelector from "./employee-selector"
import { db } from "@/lib/prisma"

const BarbershopPage = async ({ params }: { params: { id: string } }) => {
  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      employees: {
        include: {
          user: true,
        },
      },
      services: true,
    },
  })

  if (!barbershop) return null

  return <EmployeeSelector barbershop={barbershop} />
}

export default BarbershopPage
