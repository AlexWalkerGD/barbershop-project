import React, { useState } from "react"
import { BarbershopItemProps } from "@/lib/barbershop"
import { FaTrash } from "react-icons/fa"
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
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
import { Card } from "./ui/card"
import { deleteEmployee } from "@/app/_actions/delete.employee"
import { toast } from "sonner"
import { deleteService } from "@/app/_actions/delete.service"
import EditBarbershop from "./edit-barbershop"
import { AvailabilityCard } from "./availability card"

const SidebarConfig = ({ barbershop, onSuccess }: BarbershopItemProps) => {
  const [dataBarbershop, setDataBarbershop] = useState({
    id: barbershop.id,
    name: barbershop.name,
    address: barbershop.address,
    services: barbershop.services,
    phones: barbershop.phones,
    description: barbershop.description,
    imageUrl: barbershop.imageUrl,
    createdAt: new Date(barbershop.createdAt),
    updatedAt: new Date(barbershop.updatedAt),
    ownerId: barbershop.ownerId,
    owner: barbershop.owner,
    employees: barbershop.employees,
  })
  const [editBarbershop, setEditBarbershop] = useState(false)
  const [addNewEmployee, setAddNewEmployee] = useState(false)
  const [addNewService, setAddNewService] = useState(false)
  const [editAvailability, setEditAvailability] = useState(false)

  const handleSuccessNewEmployee = async () => {
    setAddNewEmployee(false)
  }

  const handleSuccessNewService = async () => {
    setAddNewService(false)
  }

  const handleSuccessEditAvailability = async () => {
    setEditAvailability(false)
  }

  const handleSuccess = async () => {
    setEditBarbershop(false)
  }

  const handleDeleteEmployee = async (userId: string, employeeId: string) => {
    try {
      await deleteEmployee(userId, employeeId)
      toast.success("Colaborador excluído com sucesso")

      setDataBarbershop((prev) => ({
        ...prev,
        employees: prev.employees?.filter((emp) => emp.id !== employeeId),
      }))
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir Colaborador. Tente novamente.")
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId)
      toast.success("Serviço excluído com sucesso")

      setDataBarbershop((prev) => ({
        ...prev,
        services: prev.services?.filter((ser) => ser.id !== serviceId),
      }))
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir Serviço. Tente novamente.")
    }
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="text-left">Configurações</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between py-5">
        <div className="flex flex-row gap-3">
          <div>
            <h2 className="line-clamp-2 text-base font-medium text-white">
              {dataBarbershop.name}
            </h2>
            <p className="line-clamp-2 text-sm text-gray-400">
              {dataBarbershop.address}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditBarbershop(true)
          }}
        >
          <MdModeEdit size={18} />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-solid"></div>

      <div>
        <Card className="mt-5">
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-row items-center justify-between px-3">
              <h2 className="font-bold">Colaboradores</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  setAddNewEmployee(true)
                }}
              >
                + Colaborador
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-solid"></div>
            {dataBarbershop.employees?.map((emp) => {
              return (
                <div
                  key={emp.id}
                  className="flex flex-row items-center justify-between rounded-xl p-2"
                >
                  <div className="flex flex-row">
                    <Avatar>
                      <AvatarImage
                        src={emp.user?.image ?? ""}
                        alt={emp.user?.name ?? ""}
                      />
                    </Avatar>
                    <div className="flex items-center">
                      <p className="pl-2">{emp.user?.name}</p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!emp.user?.id) return
                        handleDeleteEmployee(emp.user.id, emp.id)
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
        <Card className="mt-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between px-3">
              <h2 className="pt-2 text-center font-bold">Serviços</h2>
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
            <div className="flex items-center justify-between gap-3 border-b border-solid"></div>
            <div className="mx-2 flex flex-row justify-between rounded-sm bg-secondary p-[6px]">
              <p className="pl-2">Serviço</p>
              <div className="flex flex-row items-center gap-5">
                <p>Preço</p>
                <p>Excluir</p>
              </div>
            </div>
            {dataBarbershop.services?.map((ser) => {
              return (
                <div
                  key={ser.id}
                  className="ml-3 flex flex-row items-center justify-between border-b p-2"
                >
                  <p>{ser.name}</p>

                  <div className="flex flex-row items-center gap-5">
                    <p>€ {ser.price},00</p>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteService(ser.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="mt-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between px-3">
              <h2 className="pt-2 text-center font-bold">Produtos</h2>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setAddNewService(true)
                }}
              >
                + Produtos
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-solid"></div>
          </div>
        </Card>

        <Card className="mt-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between px-3">
              <h2 className="pt-2 text-center font-bold">Disponibilidade</h2>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setEditAvailability(true)
                }}
              >
                Editar
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-solid"></div>
          </div>
        </Card>
        <div className="flex flex-col pr-64"></div>
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
        open={editBarbershop}
        onOpenChange={(open) => setEditBarbershop(open)}
      >
        <DialogContent className="w-[90%]">
          <EditBarbershop
            barbershop={dataBarbershop}
            onSuccess={handleSuccess}
            onUpdate={(updatedData) =>
              setDataBarbershop((prev) => ({
                ...prev,
                ...updatedData,
              }))
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={addNewEmployee}
        onOpenChange={(open) => setAddNewEmployee(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewEmployee
            barbershopId={dataBarbershop.id}
            onSuccess={handleSuccessNewEmployee}
            onAddItem={(updatedData) =>
              setDataBarbershop((prev) => ({
                ...prev,
                ...updatedData,
              }))
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={addNewService}
        onOpenChange={(open) => setAddNewService(open)}
      >
        <DialogContent className="w-[90%]">
          <AddNewService
            barbershopId={dataBarbershop.id}
            onSuccess={handleSuccessNewService}
            onAddItem={(updatedData) =>
              setDataBarbershop((prev) => ({
                ...prev,
                ...updatedData,
              }))
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editAvailability}
        onOpenChange={(open) => setEditAvailability(open)}
      >
        <DialogContent className="w-[90%]">
          <AvailabilityCard
            employees={
              (dataBarbershop.employees as {
                id: string
                user: {
                  id: string
                  name?: string
                  email: string
                  image?: string
                }
              }[]) || []
            }
            onSuccess={handleSuccessEditAvailability}
          />
        </DialogContent>
      </Dialog>
    </SheetContent>
  )
}

export default SidebarConfig
