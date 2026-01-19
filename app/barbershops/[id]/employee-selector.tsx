/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Employee from "@/components/employee"
import PhoneItem from "@/components/phone-item"
import ServiceItem from "@/components/service-item"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import SidebarSheet from "@/components/sidebar-sheet"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"

interface SelectableEmployee {
  id: string
  name: string | null
  image: string | null
  role: "OWNER" | "EMPLOYEE"
}

const EmployeeSelector = ({ barbershop }: any) => {
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

  return (
    <>
      <div>
        {/* IMAGEM */}
        <div className="relative h-[250px] w-full">
          <Image
            alt={barbershop.name}
            src={barbershop?.imageUrl}
            fill
            className="object-cover"
          />

          <Button
            size="icon"
            variant="secondary"
            className="absolute left-4 top-4"
            asChild
          >
            <Link href="/">
              <ChevronLeftIcon />
            </Link>
          </Button>

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
        {/* TEXTO */}
        <div className="border-b border-solid p-5">
          <h1 className="mb-3 text-xl font-bold">{barbershop?.name}</h1>
          <div className="mb-2 flex items-center gap-2">
            <MapPinIcon className="text-primary" size={18} />
            <p className="text-sm">{barbershop?.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <StarIcon className="fill-primary text-primary" size={18} />
            <p className="text-sm">5.0 (499 avaliações)</p>
          </div>
        </div>

        {/* DESCRIÇÃO */}
        <div className="space-y-2 border-b border-solid p-5">
          <h2 className="text-xs font-bold uppercase text-gray-400">
            Sobre nós
          </h2>
          <p className="text-justify text-sm">{barbershop?.description}</p>
        </div>

        {/* COLABORADORES */}
        <div className="flex flex-col gap-2 border-b border-solid p-5">
          <h2 className="mb-2 text-xs font-bold uppercase text-gray-400">
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

        {/* SERVIÇOS */}
        <div className="space-y-3 border-b border-solid p-5">
          <h2 className="text-xs font-bold uppercase text-gray-400">
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

        {/* CONTATO */}
        <div className="space-y-3 p-5">
          {barbershop.phones.map((phone) => (
            <PhoneItem key={phone} phone={phone} />
          ))}
        </div>
      </div>
    </>
  )
}

export default EmployeeSelector
