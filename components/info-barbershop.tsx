import { Barbershop } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { Dialog } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import AddNewEmployee from "./add-new-employee"

interface BarbershopItemProps {
  barbershop: Barbershop & {
    owner?: { name: string | null; image: string | null }
    employees?: {
      id: string
      user?: { name: string | null; image: string | null }
    }[]
  }
}

const InfoBarbershop = ({ barbershop }: BarbershopItemProps) => {
  const [addNewEmployee, setAddNewEmployee] = useState(false)
  return (
    <div>
      <Card className="min-w-[460px] rounded-2xl">
        <CardContent className="flex flex-row items-center gap-5 p-3">
          {/* IMAGEM */}
          <div className="relative h-[100px] w-[128px]">
            <Image
              alt={barbershop.name}
              fill
              className="rounded-2xl object-cover"
              src={barbershop.imageUrl}
            />
          </div>

          {/* TEXTO */}
          <div className="flex w-full flex-row items-center justify-between px-1">
            <div>
              <h3 className="truncate font-semibold">{barbershop.name}</h3>
              <p className="truncate text-sm text-gray-400">
                {barbershop.address}
              </p>
              {/*<div className="flex flex-row gap-2">
                {barbershop.employees?.map((employee) => {
                  if (!employee.user) return null
                  return (
                    <div key={employee.id} className="h-8 w-8">
                      <Avatar>
                        <AvatarImage
                          src={employee.user.image ?? ""}
                          alt={employee.user.name ?? "Funcionário"}
                        />
                        <AvatarFallback>
                          {employee.user.name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )
                })}
              </div>*/}
            </div>
            <div className="flex flex-col">
              <Button className="mt-3 w-full" asChild>
                <Link href={`/barbershops/${barbershop.id}`}>Ver horários</Link>
              </Button>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  setAddNewEmployee(true)
                }}
              >
                + Colaborador
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={addNewEmployee}
        onOpenChange={(open) => setAddNewEmployee(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewEmployee barbershopId={barbershop.id} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InfoBarbershop
