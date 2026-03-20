"use client"

import React, { useState } from "react"
import { toast } from "sonner"

import { updatedBarbershop } from "@/app/_actions/upgrade-barbeshop"
import { BarbershopWithRelations, Employee, UserInfo } from "@/lib/barbershop"
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

interface BarbershopItemProps {
  barbershop: BarbershopWithRelations
  onSuccess: () => void
  onUpdate: (data: Partial<BarbershopState>) => void
}

const EditBarbershop = ({
  barbershop,
  onSuccess,
  onUpdate,
}: BarbershopItemProps) => {
  const [name, setName] = useState(barbershop.name)
  const [address, setAddress] = useState(barbershop.address)
  const [description, setDescription] = useState(barbershop.description)
  const [phones, setPhones] = useState<string[]>(barbershop.phones)
  const [image, setImage] = useState(barbershop.imageUrl)
  const [isImageUploading, setIsImageUploading] = useState(false)

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
    setName(barbershop.name)
    setDescription(barbershop.description)
    setAddress(barbershop.address)
    setPhones(barbershop.phones)
    setImage(barbershop.imageUrl)
  }

  const handleEditBarbershop = async () => {
    try {
      if (!name) return toast.error("Nome obrigatório")
      if (!description) return toast.error("Descrição obrigatória")
      if (!address) return toast.error("Endereço obrigatório")

      const phoneRegex = /^\d{9}$/
      const hasValidPhone = phones.some((phone) => phoneRegex.test(phone))

      if (!hasValidPhone) return toast.error("Telefone obrigatório")
      if (isImageUploading) return toast.error("Aguarde o envio da imagem")
      if (!image) return toast.error("Imagem obrigatória")

      await updatedBarbershop({
        id: barbershop.id,
        name,
        description,
        address,
        phones,
        imageUrl: image,
      })

      onUpdate({
        name,
        description,
        address,
        phones,
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
        <DialogDescription>Faça suas alterações</DialogDescription>
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

        {phones.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Telefone"
              value={phone}
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

        <ImageUploadInput
          value={image}
          onChange={setImage}
          inputId={`edit-barbershop-image-${barbershop.id}`}
          onUploadingChange={setIsImageUploading}
        />

        <Button onClick={handleEditBarbershop} disabled={isImageUploading}>
          Salvar
        </Button>
      </div>
    </div>
  )
}

export default EditBarbershop
