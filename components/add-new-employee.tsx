import React from "react"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"

const AddNewEmployee = () => {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Nova Barbearia</DialogTitle>
        <DialogDescription>Descreva sua barbearia</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 px-6 pt-4">
        <Input type="text" placeholder="Nome" required />
        <Input type="url" placeholder="Imagem" />
        <Button className="mx-28">Adicionar</Button>
      </div>
    </div>
  )
}

export default AddNewEmployee
