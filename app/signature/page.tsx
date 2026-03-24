"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Card } from "@/components/ui/card"
import { createStripeCheckout } from "../_actions/create-stripe-checkout"
import { useAction } from "next-safe-action/hooks"
const Signature = () => {
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: ({ data }) => {
      if (!data?.url) {
        throw new Error("Checkout URL not found")
      }

      window.location.href = data.url
    },
  })

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute()
  }

  return (
    <div>
      <Header />
      <div className="flex items-center px-6 pt-10">
        <Card className="w-full max-w-xl rounded-2xl border p-8 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Premium
            </span>
            <h1 className="text-xl font-bold">
              Acesso completo aos serviços de agendamento
            </h1>
            <p className="text-sm text-muted-foreground">
              Desbloqueie uma experiência premium para organizar sua agenda e
              atender mais clientes sem esforço.
            </p>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p>
                Agendamentos ilimitados e confirmação automática por cliente.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p>Gestão inteligente de horários com prevenção de conflitos.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <p>
                Relatórios simples para acompanhar crescimento da barbearia.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-row items-end gap-1">
                <h2 className="text-2xl font-bold">€15,90</h2>
                <h2 className="text-sm font-bold text-muted-foreground">
                  /mês
                </h2>
              </div>
              <p className="text-xs">
                Cancele quando quiser. Sem taxas escondidas.
              </p>
            </div>
            <Button
              className="bg-primary font-semibold text-primary-foreground"
              onClick={handleSubscribeClick}
            >
              Assinar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Signature
