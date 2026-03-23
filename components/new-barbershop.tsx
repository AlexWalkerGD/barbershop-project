"use client"

import React, { useState } from "react"
import { toast } from "sonner"

import { createBarbershop } from "@/app/_actions/create-barbershop"
import { Button } from "@/components/ui/button"

import ImageUploadInput from "./image-upload-input"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"

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
    setName("")
    setDescription("")
    setAddress("")
    setPhones([""])
    setImage("")
  }

  const handleCreateBarbershop = async () => {
    try {
      if (!name) return toast.error("Nome obrigatório")
      if (!description) return toast.error("Descrição obrigatória")
      if (!address) return toast.error("Endereço obrigatório")

      const phoneRegex = /^\d{9}$/
      const hasValidPhone = phones.some((phone) => phoneRegex.test(phone))

      if (!hasValidPhone) return toast.error("Telefone obrigatório")
      if (isImageUploading) return toast.error("Aguarde o envio da imagem")
      if (!image) return toast.error("Imagem obrigatória")

      await createBarbershop({
        name,
        description,
        address,
        phones,
        imageUrl: image,
      })

      toast.success("Barbearia criada com sucesso!")

      handleResetInputs()
      onSuccess()
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error ? error.message : "Erro ao criar barbearia"
      toast.error(message)
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
                + Novo
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
          inputId="new-barbershop-image"
          onUploadingChange={setIsImageUploading}
        />

        <Button onClick={handleCreateBarbershop} disabled={isImageUploading}>
          Adicionar
        </Button>
      </div>
    </div>
  )
}

export default NewBarbershop
