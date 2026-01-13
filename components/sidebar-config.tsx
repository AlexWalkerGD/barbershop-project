import React, { useState } from "react"
import { BarbershopItemProps } from "@/lib/barbershop"
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { MdModeEdit } from "react-icons/md"
import { Avatar, AvatarImage } from "./ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import AddNewEmployee from "./add-new-employee"
import AddNewService from "./add-new-service"

const SidebarConfig = ({ barbershop, onSuccess }: BarbershopItemProps) => {
  const [addNewEmployee, setAddNewEmployee] = useState(false)
  const [addNewService, setAddNewService] = useState(false)

  const handleSuccessNewEmployee = async () => {
    setAddNewEmployee(false)
  }

  const handleSuccessNewService = async () => {
    setAddNewService(false)
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="text-left">Configurações</SheetTitle>
        <SheetDescription className="text-left">
          Configure suas opções de barberia aqui.
        </SheetDescription>
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5"></div>
      <div className="flex justify-between">
        <div className="flex flex-row items-center gap-2">
          <h2 className="line-clamp-2 text-sm">Nome:</h2>
          <p className="line-clamp-2 text-sm text-gray-400">nome</p>
        </div>
        <MdModeEdit />
      </div>

      <div className="flex justify-between">
        <div className="flex flex-row items-center gap-2">
          <h2 className="line-clamp-2 text-sm">Endereço:</h2>
          <p className="line-clamp-2 text-sm text-gray-400">nome</p>
        </div>
        <MdModeEdit />
      </div>

      <div>
        <div className="flex flex-row gap-2 pt-4">
          {barbershop.employees?.map((emp) => {
            return (
              <div key={emp.id} className="flex">
                <Avatar>
                  <AvatarImage
                    src={emp.user?.image ?? ""}
                    alt={emp.user?.name ?? ""}
                  />
                </Avatar>
              </div>
            )
          })}
        </div>
        <div className="flex flex-col pr-64">
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setAddNewEmployee(true)
              onSuccess()
            }}
          >
            + Colaborador
          </Button>

          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setAddNewService(true)
            }}
          >
            + Serviços
          </Button>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild className="w-full">
          <Button className="mt-3 w-full" variant="destructive">
            Deletar
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90%]">
          <DialogHeader>
            <DialogTitle>Você quer excluir sua barbearia?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja exluir? Essa ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">
                Não
              </Button>
            </DialogClose>
            <DialogClose className="w-full">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => onSuccess()}
              >
                Sim, Excluir.
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addNewEmployee}
        onOpenChange={(open) => setAddNewEmployee(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewEmployee
            barbershopId={barbershop.id}
            onSuccess={handleSuccessNewEmployee}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={addNewService}
        onOpenChange={(open) => setAddNewService(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewService
            barbershopId={barbershop.id}
            onSuccess={handleSuccessNewService}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <SheetClose asChild></SheetClose>
        <Button
          className="justify-start gap-2"
          variant="ghost"
          asChild
        ></Button>
      </div>
    </SheetContent>
  )
}

export default SidebarConfig
