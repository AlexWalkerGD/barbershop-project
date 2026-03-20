"use client"

import React, { useState } from "react"
import { toast } from "sonner"

import { Employee, UserInfo } from "@/lib/barbershop"
import { Button } from "@/components/ui/button"

import ImageUploadInput from "./image-upload-input"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"

interface BarbershopState {
  id: string
  name: string
  address: string
  services?: {
    id: string
    name: string
    description: string
    image: string
    price: number
  }[]
  phones: string[]
  description: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  ownerId: string | null
  owner?: UserInfo
  employees?: Employee[]
}

interface AddNewEmployeeProps {
  barbershopId: string
  onSuccess: () => void
  onAddItem: (
    data:
      | Partial<BarbershopState>
      | ((prev: BarbershopState) => BarbershopState),
  ) => void
}

const AddNewEmployee = ({
  onSuccess,
  barbershopId,
  onAddItem,
}: AddNewEmployeeProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)

  const handleAddEmployee = async () => {
    if (!name) return toast.error("Nome obrigatório")
    if (!email) return toast.error("Email obrigatório")
    if (isImageUploading) return toast.error("Aguarde o envio da imagem")
    if (!image) return toast.error("Imagem obrigatória")

    setLoading(true)

    const newUser: UserInfo = {
      id: crypto.randomUUID(),
      name,
      email,
      image,
    }

    const newEmployee = {
      id: crypto.randomUUID(),
      user: newUser,
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, email, barbershopId }),
      })

      if (!res.ok) throw new Error("Erro ao criar colaborador")

      toast.success("Colaborador adicionado com sucesso!")
      setName("")
      setEmail("")
      setImage("")
      onSuccess()

      onAddItem((prev) => ({
        ...prev,
        employees: [...(prev.employees || []), newEmployee],
      }))
    } catch (error) {
      console.error(error)
      toast.error("Erro ao adicionar colaborador")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Novo Colaborador</DialogTitle>
        <DialogDescription>
          Adicione um novo funcionário à barbearia
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 px-6 pt-4">
        <Input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <ImageUploadInput
          value={image}
          onChange={setImage}
          inputId={`employee-image-${barbershopId}`}
          label="Foto do colaborador"
          onUploadingChange={setIsImageUploading}
        />

        <Button
          onClick={handleAddEmployee}
          disabled={loading || isImageUploading}
        >
          {loading ? "Criando..." : "Adicionar"}
        </Button>
      </div>
    </div>
  )
}

export default AddNewEmployee
