"use client"

import { useState } from "react"
import { DialogTrigger } from "@radix-ui/react-dialog"

import type {
  DashboardMetric,
  DashboardStats,
} from "@/app/_data/get-dashboard-stats"
import type { NewClient } from "@/app/_data/get-new-clients"
import Header from "@/components/header"
import InfoBarber from "@/components/info-barbershop"
import NewBarber from "@/components/new-barbershop"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BarbershopWithRelations } from "@/lib/barbershop"

import Datas from "./datas"
import NewClientsCard from "./newClientsCard"
/* import MonthlyGoal from "./monthlyGoal" */

interface DashboardContentProps {
  initialBarbershops: BarbershopWithRelations[]
  userName?: string | null
  dashboardStats: DashboardStats
  newClients: NewClient[]
}

const formatGrowth = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const createCardData = (stats: DashboardStats) => [
  {
    title: "Hoje",
    metric: stats.todayBookings,
    value: String(stats.todayBookings.value),
  },
  {
    title: "Semana",
    metric: stats.weekBookings,
    value: String(stats.weekBookings.value),
  },
  {
    title: "Mês",
    metric: stats.monthBookings,
    value: String(stats.monthBookings.value),
  },
  {
    title: "Faturamento",
    metric: stats.monthRevenue,
    value: formatCurrency(stats.monthRevenue.value),
  },
]

const DashboardContent = ({
  initialBarbershops,
  userName,
  dashboardStats,
  newClients,
}: DashboardContentProps) => {
  const [barbershops, setBarbershops] =
    useState<BarbershopWithRelations[]>(initialBarbershops)
  const [newBarbershop, setNewBarbershop] = useState(false)
  const canCreateBarbershop = barbershops.length === 0

  const handleSuccess = async () => {
    setNewBarbershop(false)
    const res = await fetch("/api/barbershops")
    const data = await res.json()
    setBarbershops(data)
  }

  const handleSetBarbers = async (barbershopsId: string) => {
    setBarbershops((prev) => prev.filter((b) => b.id !== barbershopsId))
  }

  const cards = createCardData(dashboardStats)

  return (
    <div>
      <div>
        <Header />
        <div className="m-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold">Dashboard</h1>
              <h4 className="font-semibold">Olá, {userName ?? "usuario"}</h4>
            </div>
            {canCreateBarbershop && (
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
            )}
          </div>
          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-muted-foreground">
            Minhas barbearias
          </h2>

          <div className="flex flex-col gap-5 pt-5">
            {barbershops.length === 0 && <p>Você não tem barbearias.</p>}
            {barbershops.map((b) => (
              <InfoBarber
                key={b.id}
                barbershop={b}
                onSuccess={() => handleSetBarbers(b.id)}
              />
            ))}
          </div>

          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-muted-foreground">
            Indicadores da barbearia
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.map(
              ({
                title,
                metric,
                value,
              }: {
                title: string
                metric: DashboardMetric
                value: string
              }) => (
                <Datas
                  key={title}
                  title={title}
                  value={value}
                  growth={formatGrowth(metric.growth)}
                  trend={metric.trend}
                  description={metric.description}
                />
              ),
            )}
          </div>

          <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-muted-foreground">
            Novos Clients
          </h2>

          <div className="mt-8">
            <NewClientsCard clients={newClients} />
          </div>

          {/* <h2 className="mb-3 mt-10 text-xs font-bold uppercase text-muted-foreground">
            Meta Mensal
          </h2>

          <div className="mt-8">
            <MonthlyGoal
              type="revenue"
              currentValue={dashboardStats.monthRevenue.value}
              targetValue={5000}
            />
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
