"use client"

import { useMemo, useRef, useState } from "react"
import { CalendarDays, Check, Percent, Tag, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createPromotion, deletePromotion } from "@/app/_actions/promotions"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

export type Promotion = {
  id: string
  name: string
  description: string
  discountValue: string
  endsAt: string
  serviceId: string | null
  appliesTo: string
  active: boolean
}

type ServiceOption = {
  id: string
  name: string
}

interface PromotionsClientProps {
  initialPromotions: Promotion[]
  services: ServiceOption[]
}

const ALL_SERVICES_VALUE = "all"

const dateToInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const inputValueToDate = (date: string) =>
  date ? new Date(`${date}T12:00:00`) : undefined

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T12:00:00`))

const PromotionsClient = ({
  initialPromotions,
  services,
}: PromotionsClientProps) => {
  const router = useRouter()
  const calendarRef = useRef<HTMLDivElement>(null)
  const [formIsOpen, setFormIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [openCalendar, setOpenCalendar] = useState<"from" | "to" | null>(null)
  const [endsAt, setEndsAt] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState(ALL_SERVICES_VALUE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingPromotionId, setRemovingPromotionId] = useState<string | null>(
    null,
  )

  const activePromotions = useMemo(() => {
    const now = new Date()

    return initialPromotions.filter(
      (promotion) =>
        promotion.active && new Date(`${promotion.endsAt}T23:59:59.999`) >= now,
    ).length
  }, [initialPromotions])

  const resetForm = () => {
    setName("")
    setDescription("")
    setDiscountValue("")
    setEndsAt("")
    setSelectedServiceId(ALL_SERVICES_VALUE)
  }

  const handleAddPromotion = async () => {
    if (!name.trim() || !discountValue.trim() || !endsAt) return

    try {
      setIsSubmitting(true)

      await createPromotion({
        name,
        description,
        discountValue,
        endsAt,
        serviceId:
          selectedServiceId === ALL_SERVICES_VALUE ? null : selectedServiceId,
      })

      resetForm()
      setFormIsOpen(false)
      router.refresh()
      toast.success("Promoção adicionada com sucesso")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao adicionar promoção"

      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemovePromotion = async (promotionId: string) => {
    try {
      setRemovingPromotionId(promotionId)
      await deletePromotion(promotionId)
      router.refresh()
      toast.success("Promoção removida com sucesso")
    } catch {
      toast.error("Erro ao remover promoção")
    } finally {
      setRemovingPromotionId(null)
    }
  }

  const DateButton = ({
    id,
    value,
    placeholder,
    calendarAlign = "start",
    isOpen,
    onOpen,
    onChange,
  }: {
    id: string
    value: string
    placeholder: string
    calendarAlign?: "start" | "end"
    isOpen: boolean
    onOpen: () => void
    onChange: (value: string) => void
  }) => (
    <div className="relative min-w-0 flex-1 sm:w-[104px] sm:flex-none">
      <div className="flex flex-row items-center">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <button
          id={id}
          type="button"
          onClick={onOpen}
          className="h-9 w-full bg-transparent px-1 text-center text-sm outline-none focus-visible:ring-0"
        >
          {value ? (
            formatDate(value)
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute top-11 z-50 rounded-xl border bg-background shadow-lg ${
            calendarAlign === "end" ? "right-0" : "left-0"
          }`}
        >
          <Calendar
            locale={ptBR}
            className="p-2 [--cell-size:1.75rem] sm:p-3 sm:[--cell-size:2rem]"
            mode="single"
            selected={inputValueToDate(value)}
            onSelect={(date) => {
              if (!date) return
              onChange(dateToInputValue(date))
              setOpenCalendar(null)
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div>
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
        <section className="flex flex-col gap-4 rounded-lg p-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Crie descontos automáticos por período para todos os serviços ou
              para um serviço específico.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-row items-center gap-0.5 rounded-md border px-3 py-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="px-0.5 font-semibold">{activePromotions} </span>
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
              <div className="grid gap-3 md:grid-cols-[1fr_160px_170px]">
                <Input
                  placeholder="Nome da promoção"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />

                <div className="relative">
                  <Percent className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    inputMode="decimal"
                    placeholder="Desconto"
                    value={discountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                  />
                </div>

                <DateButton
                  id="promotions to date"
                  value={endsAt}
                  placeholder="dd/mm/aaaa"
                  isOpen={openCalendar === "to"}
                  onOpen={() => setOpenCalendar("to")}
                  onChange={setEndsAt}
                  calendarAlign="end"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <Input
                  placeholder="Descrição opcional"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />

                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aplicar em" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_SERVICES_VALUE}>
                      Todos os serviços
                    </SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleAddPromotion}
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    !discountValue.trim() ||
                    !endsAt
                  }
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Adicionando" : "Adicionar"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Minhas promoções
          </h2>

          {initialPromotions.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {initialPromotions.map((promotion) => (
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
                      disabled={removingPromotionId === promotion.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5">
                    <p className="text-3xl font-semibold leading-none text-primary">
                      {promotion.discountValue}%
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>Termina em {formatDate(promotion.endsAt)}</span>
                    </div>
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

export default PromotionsClient
