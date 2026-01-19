"use client"

import React, { useState } from "react"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { updatedBarbershop } from "@/app/_actions/upgrade-barbeshop"
import { BarbershopWithRelations } from "@/lib/barbershop"

interface BarbershopItemProps {
  barbershop: BarbershopWithRelations
  onSuccess: () => void
  onUpdate: () => void
}

const EditBarbershop = ({
  barbershop,
  onSuccess,
  onUpdate,
}: BarbershopItemProps) => {
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
      if (!name || !address || !phones) {
        toast.error("Preencha os campos obrigatórios")
        return
      }

      await updatedBarbershop({
        id: barbershop.id,
        name: name,
        description: description,
        address: address,
        phones: phones,
        imageUrl: image,
      })

      onUpdate({
        ...barbershop,
        name: name,
        description: description,
        address: address,
        phones: phones,
        imageUrl: image,
      })

      toast.success("Alteração feita com sucesso!")

      handleResetInputs()
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao fazer alteração")
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Edite sua barbearia</DialogTitle>
        <DialogDescription>Faça suas alteraçoes</DialogDescription>
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

export default EditBarbershop
