/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo, useState } from "react"
import Employee from "@/components/employee"
import PhoneItem from "@/components/phone-item"
import ServiceItem from "@/components/service-item"
import { Button } from "@/components/ui/button"
import { MapPinIcon, MenuIcon } from "lucide-react"
import Image from "next/image"
import SidebarSheet from "@/components/sidebar-sheet"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import ThemeToggle from "@/components/theme-toggle"

interface SelectableEmployee {
  id: string
  name: string | null
  image: string | null
  role: "EMPLOYEE"
}

interface AvailabilityItem {
  employeeId: string
  day: string
  enabled: boolean
  startHour: string
  endHour: string
}

const WEEK_DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terca" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" },
]

const EmployeeSelector = ({
  barbershop,
  availability = [],
}: {
  barbershop: any
  availability?: AvailabilityItem[]
}) => {
  const [selectedEmployee, setSelectedEmployee] =
    useState<SelectableEmployee | null>(null)

  const employees: SelectableEmployee[] = [
    ...barbershop.employees
      .filter((e: any) => e.user)
      .map((e: any) => ({
        id: e.id,
        name: e.user.name,
        image: e.user.image,
        role: "EMPLOYEE",
      })),
  ]

  const availabilityByDay = useMemo(() => {
    const employeeOrder = new Map(
      employees.map((employee, index) => [employee.id, index]),
    )

    const sortedAvailability = [...availability].sort((a, b) => {
      const orderA = employeeOrder.get(a.employeeId) ?? Number.MAX_SAFE_INTEGER
      const orderB = employeeOrder.get(b.employeeId) ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

    return WEEK_DAYS.map((weekDay) => {
      const dayRows = sortedAvailability.filter(
        (item) => item.day === weekDay.key,
      )
      const enabledRow = dayRows.find((item) => item.enabled)

      if (enabledRow) {
        return {
          label: weekDay.label,
          value: `${enabledRow.startHour} - ${enabledRow.endHour}`,
        }
      }

      if (dayRows.length > 0) {
        return {
          label: weekDay.label,
          value: "Fechado",
        }
      }

      return {
        label: weekDay.label,
        value: "",
      }
    })
  }, [availability, employees])

  return (
    <>
      <div className="lg:px-[100px]">
        {/* DESKTOP NAVBAR */}
        <div className="hidden lg:flex lg:items-center lg:justify-end lg:py-6">
          <Sheet>
            <div className="pr-3">
              <ThemeToggle />
            </div>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SidebarSheet />
          </Sheet>
        </div>

        {/* MOBILE CONTENT */}
        <div className="lg:hidden">
          <div className="relative h-[250px] w-full">
            <Image
              alt={barbershop.name}
              src={barbershop?.imageUrl}
              fill
              className="object-cover"
            />

            <div className="absolute right-16 top-4">
              <ThemeToggle />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-4 top-4"
                >
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SidebarSheet />
            </Sheet>
          </div>

          <div className="border-b border-solid p-5">
            <h1 className="mb-3 text-xl font-bold">{barbershop?.name}</h1>
            <div className="mb-2 flex items-center gap-2">
              <MapPinIcon className="text-primary" size={18} />
              <p className="text-sm">{barbershop?.address}</p>
            </div>
            {/* <div className="flex items-center gap-2">
              <StarIcon className="fill-primary text-primary" size={18} />
              <p className="text-sm">5.0 (499 avaliações)</p>
            </div> */}
          </div>

          <div className="space-y-2 border-b border-solid p-5">
            <h2 className="text-xs font-bold uppercase text-muted-foreground">
              Sobre nós
            </h2>
            <p className="text-justify text-sm">{barbershop?.description}</p>
          </div>

          <div className="flex flex-col gap-2 border-b border-solid p-5">
            <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
              Funcionários
            </h2>
            <div className="flex flex-row gap-3">
              {employees.map((employee) => (
                <Employee
                  key={`${employee.role}-${employee.id}`}
                  employee={employee}
                  isSelected={selectedEmployee?.id === employee.id}
                  onSelect={setSelectedEmployee}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 border-b border-solid p-5">
            <h2 className="text-xs font-bold uppercase text-muted-foreground">
              Serviços
            </h2>
            <div className="mt-6 space-y-3">
              {barbershop.services.map((service: any) => (
                <ServiceItem
                  key={service.id}
                  barbershop={JSON.parse(JSON.stringify(barbershop))}
                  service={JSON.parse(JSON.stringify(service))}
                  employee={JSON.parse(JSON.stringify(selectedEmployee))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 p-5">
            {barbershop.phones.map((phone: any) => (
              <PhoneItem key={phone} phone={phone} />
            ))}
          </div>
        </div>

        {/* DESKTOP CONTENT */}
        <div className="hidden lg:flex lg:items-start lg:gap-10">
          <div className="w-[70%]">
            <div className="relative h-[450px] w-full overflow-hidden rounded-xl">
              <Image
                alt={barbershop.name}
                src={barbershop?.imageUrl}
                fill
                className="object-cover"
              />
            </div>

            <div className="border-b border-solid py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">
                    {barbershop?.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="text-primary" size={18} />
                    <p className="text-sm">{barbershop?.address}</p>
                  </div>
                </div>

                {/* <div className="rounded-lg border border-solid bg-card p-4">
                  <div className="flex items-center gap-2">
                    <StarIcon className="fill-primary text-primary" size={18} />
                    <p className="font-semibold">5.0</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    499 avaliações
                  </p>
                </div> */}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-solid py-6">
              <h2 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                Funcionários
              </h2>
              <div className="flex flex-row gap-3">
                {employees.map((employee) => (
                  <Employee
                    key={`${employee.role}-${employee.id}`}
                    employee={employee}
                    isSelected={selectedEmployee?.id === employee.id}
                    onSelect={setSelectedEmployee}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 border-b border-solid py-6">
              <h2 className="text-xs font-bold uppercase text-muted-foreground">
                Serviços
              </h2>
              <div className="mt-6 gap-3 lg:grid lg:grid-cols-3">
                {barbershop.services.map((service: any) => (
                  <ServiceItem
                    key={service.id}
                    barbershop={JSON.parse(JSON.stringify(barbershop))}
                    service={JSON.parse(JSON.stringify(service))}
                    employee={JSON.parse(JSON.stringify(selectedEmployee))}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="w-[25%] space-y-5">
            <div className="rounded-xl border border-solid p-5">
              <div className="relative flex h-[180px] w-full items-end">
                <Image
                  alt={`Mapa da barbearia ${barbershop.name}`}
                  src="/map.png"
                  fill
                  className="rounded-xl object-cover"
                />

                <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
                  <CardContent className="flex items-center gap-3 px-5 py-3">
                    <Avatar>
                      <AvatarImage src={barbershop.imageUrl} />
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{barbershop.name}</h3>
                      <p className="text-xs">{barbershop.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-3 border-b border-solid px-2 py-5">
                <h2 className="mb-3 mt-5 text-xs font-bold uppercase text-muted-foreground">
                  Sobre nós
                </h2>
                <p className="text-sm">{barbershop?.description ?? ""}</p>
              </div>
              <div className="space-y-3 border-b border-solid px-2 py-5">
                <div className="space-y-3">
                  {barbershop.phones.map((phone: any) => (
                    <PhoneItem key={phone} phone={phone} />
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-2">
                <div className="mt-2 space-y-2">
                  {availabilityByDay.map((day) => (
                    <div
                      key={day.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {day.label}
                      </span>
                      <span className="text-sm font-medium">{day.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmployeeSelector
