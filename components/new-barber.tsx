import React from "react"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"

const NewBarber = () => {
  return (
    <div className="">
      <DialogHeader>
        <DialogTitle>Nova Barbearia</DialogTitle>
        <DialogDescription>Descreva sua barbearia</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 px-6 pt-4">
        <Input type="email" placeholder="Nome" required />
        <Input type="email" placeholder="Endereço" required />
        <Input type="email" placeholder="Telefone" required />
        <Input type="email" placeholder="Imagem" />
        <Button className="mx-28">Adicionar</Button>
      </div>
    </div>
  )
}

export default NewBarber
