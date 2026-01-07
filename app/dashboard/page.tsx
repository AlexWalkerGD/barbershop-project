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

interface Barbershop {
  id: string
  name: string
  address: string
  services?: { id: string; name: string; price: number }[]
}

const Dashboard = () => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [newBarbershop, setNewBarbershop] = useState(false)
  const handleLoginWithGoogleClick = () => signIn("google")
  const { data: session } = useSession()

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
            <Button
              className="mt-3 p-[10px] pb-4 text-4xl font-extralight"
              onClick={() => setNewBarbershop(true)}
            >
              +
            </Button>
          </div>
          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-gray-400">
            Minhas barbearias
          </h2>

          <div className="flex flex-col items-center justify-center gap-5 pt-5">
            {barbershops.length === 0 && <p>Você não tem barbearias.</p>}
            {barbershops.map((b) => (
              <InfoBarber key={b.id} barbershop={b} />
            ))}
          </div>
        </div>
      </div>
      <Dialog
        open={newBarbershop}
        onOpenChange={(open) => setNewBarbershop(open)}
      >
        <DialogContent className="w-[90%]">
          <NewBarber />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard
