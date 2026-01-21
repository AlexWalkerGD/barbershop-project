import React, { useState } from "react"
import { toast } from "sonner"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Employee, UserInfo } from "@/lib/barbershop"

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

  const handleAddService = async () => {
    if (!name) return toast.error("Nome obrigatório")
    if (!description) return toast.error("Descrição obrigatório")
    if (!imageUrl) return toast.error("Imagem obrigatório")
    if (!price) return toast.error("Preço obrigatório")
    setLoading(true)

    try {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageUrl,
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
      <DialogHeader>
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogDescription>Adicione um novo serviço </DialogDescription>
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
        <Input
          type="url"
          placeholder="Imagem"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button className="mx-28" onClick={handleAddService} disabled={loading}>
          {loading ? "Criando..." : "Adicionar"}
        </Button>
      </div>
    </div>
  )
}

export default AddNewService
