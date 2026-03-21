"use client"

import Header from "@/components/header"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import InfoBarber from "@/components/info-barbershop"
import NewBarber from "@/components/new-barbershop"
import { DialogContent } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { BarbershopWithRelations } from "@/lib/barbershop"

interface DashboardContentProps {
  initialBarbershops: BarbershopWithRelations[]
  userName?: string | null
}

const DashboardContent = ({
  initialBarbershops,
  userName,
}: DashboardContentProps) => {
  const [barbershops, setBarbershops] =
    useState<BarbershopWithRelations[]>(initialBarbershops)
  const [newBarbershop, setNewBarbershop] = useState(false)

  const handleSuccess = async () => {
    setNewBarbershop(false)
    const res = await fetch("/api/barbershops")
    const data = await res.json()
    setBarbershops(data)
  }

  const handleSetBarbers = async (barbershopsId: string) => {
    setBarbershops((prev) => prev.filter((b) => b.id !== barbershopsId))
  }

  return (
    <div>
      <div>
        <Header />
        <div className="m-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <h4 className="font-semibold">Ola, {userName ?? "usuario"}</h4>
            </div>
            <Dialog
              open={newBarbershop}
              onOpenChange={(open) => setNewBarbershop(open)}
            >
              <DialogTrigger asChild>
                <Button
                  className="mt-3 p-[10px] pb-5 text-4xl font-extralight"
                  onClick={() => setNewBarbershop(true)}
                >
                  +
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-[90%]"
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                <NewBarber
                  dialogTitle="Nova barbearia"
                  dialogDescription="Descreva sua nova barbearia"
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-muted-foreground">
            Minhas barbearias
          </h2>

          <div className="flex flex-col gap-5 pt-5">
            {barbershops.length === 0 && <p>Voce nao tem barbearias.</p>}
            {barbershops.map((b) => (
              <InfoBarber
                key={b.id}
                barbershop={b}
                onSuccess={() => handleSetBarbers(b.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
