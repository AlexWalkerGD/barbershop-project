"use client"

import { useMemo, useState } from "react"
import { Check, Euro, Percent, Tag, Trash2 } from "lucide-react"

import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type DiscountType = "percentage" | "amount"

type Promotion = {
  id: string
  name: string
  description: string
  discountType: DiscountType
  discountValue: string
  appliesTo: string
  active: boolean
}

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "welcome",
    name: "Cliente novo",
    description: "Desconto para a primeira visita.",
    discountType: "percentage",
    discountValue: "20",
    appliesTo: "Todos os serviços",
    active: true,
  },
  {
    id: "beard",
    name: "Combo barba",
    description: "Oferta para serviços combinados.",
    discountType: "amount",
    discountValue: "5",
    appliesTo: "Barba e acabamento",
    active: true,
  },
]

const PromotionsPage = () => {
  const [formIsOpen, setFormIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState<DiscountType>("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [appliesTo, setAppliesTo] = useState("")
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS)

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.active).length,
    [promotions],
  )

  const resetForm = () => {
    setName("")
    setDescription("")
    setDiscountType("percentage")
    setDiscountValue("")
    setAppliesTo("")
  }

  const handleAddPromotion = () => {
    if (!name.trim() || !discountValue.trim()) return

    setPromotions((currentPromotions) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || "Promoção sem descrição.",
        discountType,
        discountValue: discountValue.trim(),
        appliesTo: appliesTo.trim() || "Todos os serviços",
        active: true,
      },
      ...currentPromotions,
    ])

    resetForm()
    setFormIsOpen(false)
  }

  const handleRemovePromotion = (promotionId: string) => {
    setPromotions((currentPromotions) =>
      currentPromotions.filter((promotion) => promotion.id !== promotionId),
    )
  }

  const formatDiscount = (promotion: Promotion) =>
    promotion.discountType === "percentage"
      ? `${promotion.discountValue}%`
      : `€ ${promotion.discountValue}`

  return (
    <div>
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
        <section className="flex flex-col gap-4 rounded-lg p-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Organize descontos e ofertas para usar nas suas campanhas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-row items-center gap-0.5 rounded-md border px-3 py-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="px-0.5 font-semibold">{activePromotions} </span>
              {"  "}
              ativas
            </div>
            <Button onClick={() => setFormIsOpen((isOpen) => !isOpen)}>
              Nova promoção
            </Button>
          </div>
        </section>

        {formIsOpen && (
          <Card className="p-4">
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                <Input
                  placeholder="Nome da promoção"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={
                      discountType === "percentage" ? "default" : "outline"
                    }
                    onClick={() => setDiscountType("percentage")}
                  >
                    <Percent className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={discountType === "amount" ? "default" : "outline"}
                    onClick={() => setDiscountType("amount")}
                  >
                    <Euro className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                <Input
                  placeholder="Descrição"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <Input
                  inputMode="decimal"
                  placeholder={discountType === "percentage" ? "%" : "€"}
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Aplicar em"
                  value={appliesTo}
                  onChange={(event) => setAppliesTo(event.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleAddPromotion}
                  disabled={!name.trim() || !discountValue.trim()}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Minhas promoções
          </h2>

          {promotions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promotion) => (
                <Card key={promotion.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {promotion.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {promotion.appliesTo}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemovePromotion(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5">
                    <p className="text-3xl font-semibold leading-none text-primary">
                      {formatDiscount(promotion)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {promotion.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-5 text-sm text-muted-foreground">
              Nenhuma promoção criada ainda.
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

export default PromotionsPage
