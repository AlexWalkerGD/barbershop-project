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

  const employeeIds = barbershop.employees.map((employee) => employee.id)
  const availability = employeeIds.length
    ? await db.availability.findMany({
        where: {
          employeeId: {
            in: employeeIds,
          },
        },
      })
    : []

  return (
    <EmployeeSelector barbershop={barbershop} availability={availability} />
  )
}

export default BarbershopPage
