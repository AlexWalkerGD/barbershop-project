"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

import type { NewClient } from "@/app/_data/get-new-clients"

import { Card, CardContent } from "./ui/card"

interface NewClientsCardProps {
  clients: NewClient[]
}

const AUTO_SLIDE_DELAY = 3000

const getClientInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

const NewClientsCard = ({ clients }: NewClientsCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  const sliderClients = useMemo(() => {
    if (clients.length <= 1) {
      return clients
    }

    return [...clients, clients[0]]
  }, [clients])

  useEffect(() => {
    if (clients.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setIsAnimating(true)
      setCurrentIndex((prev) => prev + 1)
    }, AUTO_SLIDE_DELAY)

    return () => clearInterval(interval)
  }, [clients.length])

  const handleTransitionEnd = () => {
    if (currentIndex !== clients.length) {
      return
    }

    setIsAnimating(false)
    setCurrentIndex(0)
  }

  useEffect(() => {
    if (!isAnimating) {
      const frame = requestAnimationFrame(() => {
        setIsAnimating(true)
      })

      return () => cancelAnimationFrame(frame)
    }
  }, [isAnimating])

  if (clients.length === 0) {
    return (
      <div>
        <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Nenhum cliente novo encontrado ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Últimos 3 clientes cadastrados
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div
          className={`flex ${isAnimating ? "transition-transform duration-500 ease-out" : ""}`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {sliderClients.map((client, index) => (
            <div key={`${client.id}-${index}`} className="w-full shrink-0">
              <Card className="w-full rounded-2xl border bg-card/85 shadow-sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                    {getClientInitials(client.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                          {client.name}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                          {client.serviceName}
                        </p>
                      </div>

                      {client.isManual && (
                        <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                          Manual
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                      <span className="truncate">{client.barbershopName}</span>
                      <span className="shrink-0">
                        {formatDistanceToNow(new Date(client.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {clients.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {clients.map((client, index) => (
            <span
              key={client.id}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex % clients.length === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewClientsCard
