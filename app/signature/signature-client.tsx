"use client"

import React, { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import { createStripeCheckout } from "../_actions/create-stripe-checkout"
import { createStripePortal } from "../_actions/create-stripe-portal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SignInDialog from "@/components/sign-in-dialog"
import { useSession } from "next-auth/react"

export type SignatureSubscription = {
  status:
    | "ACTIVE"
    | "TRIALING"
    | "INCOMPLETE"
    | "PAST_DUE"
    | "CANCELED"
    | "UNPAID"
  currentPeriodEnd: string
}

type SignatureClientProps = {
  subscription: SignatureSubscription | null
}

const priceLabel = "€15,90/mês"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
  }).format(date)
}

function getDaysUntil(date: Date) {
  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  const targetStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )

  return Math.max(
    0,
    Math.ceil(
      (targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    ),
  )
}

const SignatureClient = ({ subscription }: SignatureClientProps) => {
  const { data } = useSession()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: ({ data }) => {
      if (!data?.url) {
        throw new Error("Checkout URL not found")
      }

      window.location.href = data.url
    },
  })

  const createStripePortalAction = useAction(createStripePortal, {
    onSuccess: ({ data }) => {
      if (!data?.url) {
        throw new Error("Portal URL not found")
      }

      window.location.href = data.url
    },
  })

  const currentPeriodEnd = subscription
    ? new Date(subscription.currentPeriodEnd)
    : null
  const isTrialing = subscription?.status === "TRIALING"
  const isActive = subscription?.status === "ACTIVE"
  const canManageSubscription = isTrialing || isActive
  const daysUntilPeriodEnd = currentPeriodEnd
    ? getDaysUntil(currentPeriodEnd)
    : null

  const handleSubscribeClick = () => {
    if (data?.user) {
      createStripeCheckoutAction.execute()
      return
    }
    setSignInDialogIsOpen(true)
  }

  const handleManageClick = () => {
    createStripePortalAction.execute()
  }

  return (
    <div>
      <Header />
      <div className="flex items-center px-6 pt-10">
        <Card className="w-full max-w-xl rounded-2xl border px-8 py-5 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between gap-3">
              <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                Premium
              </span>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={!canManageSubscription}>
                    Gerenciar assinatura
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      {isTrialing
                        ? "Plano Premium — Teste grátis"
                        : "Plano Premium ativo"}
                    </DialogTitle>
                    <DialogDescription className="pt-1 text-center">
                      Controle seu plano e pagamentos.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Badge variant={isTrialing ? "secondary" : "default"}>
                        {isTrialing ? "TRIAL ATIVO" : "ASSINATURA ATIVA"}
                      </Badge>
                    </div>

                    {currentPeriodEnd && (
                      <div className="rounded-lg border p-4 text-sm">
                        {isTrialing ? (
                          <div className="space-y-2">
                            <p>
                              Seu teste termina em{" "}
                              <strong>{formatDate(currentPeriodEnd)}</strong>
                            </p>
                            <p className="text-muted-foreground">
                              Faltam {daysUntilPeriodEnd} dias. Após isso:{" "}
                              {priceLabel}.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p>
                              Próxima cobrança:{" "}
                              <strong>{formatDate(currentPeriodEnd)}</strong>
                            </p>
                            <p className="text-muted-foreground">
                              Faltam {daysUntilPeriodEnd} dias. Valor:{" "}
                              {priceLabel}.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <Button className="w-full" onClick={handleManageClick}>
                      Atualizar ou cancelar assinatura
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">30 dias grátis</h2>
                <h2 className="text-sm font-bold text-muted-foreground">
                  Depois {priceLabel}.
                </h2>
              </div>
              <p className="pt-2 text-xs">
                Cancele quando quiser. Sem taxas escondidas.
              </p>
            </div>
            <Button
              className="bg-primary font-semibold text-primary-foreground"
              onClick={handleSubscribeClick}
              disabled={canManageSubscription}
            >
              {canManageSubscription ? "Plano ativo" : "Testar grátis"}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SignatureClient
