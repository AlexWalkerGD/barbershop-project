"use client"

import React, { useState } from "react"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { createBarbeshop } from "@/app/_actions/create-barbershop"
import { Input } from "./ui/input"
import { toast } from "sonner"

interface NewBarbershopProps {
  dialogTitle: string
  dialogDescription: string
  onSuccess: () => void
}

const NewBarbershop = ({
  dialogTitle,
  dialogDescription,
  onSuccess,
}: NewBarbershopProps) => {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [phones, setPhones] = useState<string[]>([""])
  const [image, setImage] = useState("")

  const addPhones = () => {
    setPhones([...phones, ""])
  }

  const updatePhones = (index: number, value: string) => {
    const updated = [...phones]
    updated[index] = value
    setPhones(updated)
  }

  const removePhones = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index))
  }

  const handleResetInputs = () => {
    setName("")
    setDescription("")
    setAddress("")
    setPhones([""])
    setImage("")
  }

  const handleCreateBarbershop = async () => {
    try {
      if (!name) return toast.error("Nome obrigatório")
      if (!description) return toast.error("Descrição obrigatório")
      if (!address) return toast.error("Endereço obrigatório")

      const phoneRegex = /^\d{9}$/
      const hasValidPhone = phones.some((phone) => phoneRegex.test(phone))
      if (!hasValidPhone) return toast.error("Telefone obrigatório")
      if (!image) return toast.error("Imagem obrigatório")

      await createBarbeshop({
        name: name,
        description: description,
        address: address,
        phones: phones,
        imageUrl: image,
      })

      toast.success("Barbearia criada com sucesso!")

      handleResetInputs()
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar barbearia")
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 px-6 pt-4">
        <Input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Input
          placeholder="Endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        {phones.map((phones, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Telefone"
              value={phones}
              onChange={(e) => updatePhones(index, e.target.value)}
              required
            />
            {index < 1 && (
              <Button type="button" onClick={addPhones}>
                + Adicionar telefone
              </Button>
            )}

            {phones.length > 1 && index > 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removePhones(index)}
              >
                -
              </Button>
            )}
          </div>
        ))}

        <Input
          placeholder="Imagem (URL)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <Button onClick={handleCreateBarbershop}>Adicionar</Button>
      </div>
    </div>
  )
}

export default NewBarbershop
