"use client"

import Header from "@/components/header"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Dialog,
} from "@/components/ui/dialog"
import Image from "next/image"
import InfoBarber from "@/components/info-barbershop"
import NewBarber from "@/components/new-barbershop"
import { DialogContent } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { deleteBarbershop } from "../_actions/delete-barbershop"
import { BarbershopWithRelations } from "@/lib/barbershop"
import { toast } from "sonner"

const Dashboard = () => {
  const [barbershops, setBarbershops] = useState<BarbershopWithRelations[]>([])
  const [newBarbershop, setNewBarbershop] = useState(false)
  const handleLoginWithGoogleClick = () => signIn("google")
  const { data: session } = useSession()

  const handleSuccess = async () => {
    setNewBarbershop(false)
    if (!session) return
    const res = await fetch("/api/barbershops")
    const data = await res.json()
    setBarbershops(data)
  }

  const handleDeleteBarbershop = async (barbershopsId: string) => {
    try {
      await deleteBarbershop(barbershopsId)
      toast.success("Barbearia excluída com sucesso")
      setBarbershops((prev) => prev.filter((b) => b.id !== barbershopsId))
    } catch (error) {
      console.error(error)
      console.log(barbershopsId)
      toast.error("Erro ao excluir barbearia. Tente novamente.")
    }
  }

  useEffect(() => {
    if (!session) return

    fetch("/api/barbershops")
      .then((res) => res.json())
      .then((data) => setBarbershops(data))
  }, [session])

  if (!session) {
    return (
      <div className="h-fill flex flex-col items-center justify-center pt-80">
        <Dialog>
          <DialogHeader>
            <DialogTitle>Faça login na plataforma</DialogTitle>
            <DialogDescription>
              Conecte-se usando sua conta do Google
            </DialogDescription>
          </DialogHeader>
        </Dialog>

        <Button
          variant="outline"
          className="mt-4 gap-1 font-bold"
          onClick={handleLoginWithGoogleClick}
        >
          <Image
            alt="Fazer login com o Google"
            src="/google.svg"
            width={18}
            height={18}
          />
          Google
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div>
        <Header />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <h4 className="font-semibold">Olá, Alex Walker</h4>
            </div>
            <Dialog
              open={newBarbershop}
              onOpenChange={(open) => setNewBarbershop(open)}
            >
              <DialogTrigger asChild>
                <Button
                  className="mt-3 p-[10px] pb-4 text-4xl font-extralight"
                  onClick={() => setNewBarbershop(true)}
                >
                  +
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <NewBarber onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          </div>
          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-gray-400">
            Minhas barbearias
          </h2>

          <div className="flex flex-col items-center justify-center gap-5 pt-5">
            {barbershops.length === 0 && <p>Você não tem barbearias.</p>}
            {barbershops.map((b) => (
              <InfoBarber
                key={b.id}
                barbershop={b}
                onSuccess={() => handleDeleteBarbershop(b.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
