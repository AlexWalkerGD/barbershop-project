import React, { useState } from "react"
import { toast } from "sonner"

import { Employee, UserInfo } from "@/lib/barbershop"
import { Button } from "@/components/ui/button"

import ImageUploadInput from "./image-upload-input"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
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

interface AddNewServiceProps {
  barbershopId: string
  onSuccess: () => void
  onAddItem: (
    data:
      | Partial<BarbershopState>
      | ((prev: BarbershopState) => BarbershopState),
  ) => void
}

const AddNewService = ({
  onSuccess,
  barbershopId,
  onAddItem,
}: AddNewServiceProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  const handleAddService = async () => {
    if (!name) return toast.error("Nome obrigatório")
    if (!description) return toast.error("Descrição obrigatória")
    if (!price) return toast.error("Preço obrigatório")
    if (isImageUploading) return toast.error("Aguarde o envio da imagem")

    setLoading(true)

    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageUrl: imageUrl || null,
          description,
          price,
          barbershopId,
        }),
      })

      if (!res.ok) throw new Error("Erro ao criar serviço")

      toast.success("Serviço adicionado com sucesso!")
      setName("")
      setDescription("")
      setPrice("")
      setImageUrl("")
      setShowImageUpload(false)
      onSuccess()

      onAddItem((prev) => ({
        ...prev,
        services: [
          ...(prev.services || []),
          {
            id: crypto.randomUUID(),
            name,
            description,
            image: imageUrl,
            price: Number(price),
          },
        ],
      }))
    } catch (error) {
      console.error(error)
      toast.error("Erro ao adicionar serviço")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Dialog>
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
          <DialogDescription>Adicione um novo serviço</DialogDescription>
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
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImageUpload((prev) => !prev)}
            >
              {showImageUpload
                ? "Remover imagem opcional"
                : "Adicionar imagem opcional"}
            </Button>

            {showImageUpload && (
              <ImageUploadInput
                value={imageUrl}
                onChange={setImageUrl}
                inputId={`service-image-${barbershopId}`}
                label="Imagem do serviço"
                onUploadingChange={setIsImageUploading}
              />
            )}
          </div>

          <Input
            type="number"
            placeholder="Preço"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Button
            onClick={handleAddService}
            disabled={loading || isImageUploading}
          >
            {loading ? "Criando..." : "Adicionar"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

export default AddNewService
