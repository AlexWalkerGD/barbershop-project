"use client"

import React from "react"
import { Avatar, AvatarImage } from "./ui/avatar"

interface EmployeeProps {
  name?: string | null
  image?: string | null
  role?: string | null
}

const Employee = ({ name, image, role }: EmployeeProps) => {
  return (
    <div className="flex w-24 flex-col items-center pt-2">
      <div className="relative h-[45px] w-[45px]">
        <Avatar>
          <AvatarImage src={image ?? "logo.png"} alt={name ?? "Sem nome"} />
        </Avatar>
      </div>
      <h2 className="text-md truncate text-center">{name ?? "Sem nome"}</h2>
      <h2 className="text-[10px] font-bold">{role}</h2>
    </div>
  )
}

export default Employee
