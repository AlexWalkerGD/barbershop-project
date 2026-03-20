"use client"

import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "./ui/button"

interface CopyBarbershopLinkProps {
  barbershopId: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")

const CopyBarbershopLink = ({ barbershopId }: CopyBarbershopLinkProps) => {
  const barbershopUrl = APP_URL
    ? `${APP_URL}/barbershops/${barbershopId}`
    : `/barbershops/${barbershopId}`
  const shortBarbershopUrlLabel = APP_URL
    ? `${APP_URL.replace(/^https?:\/\//, "")}/barbershops/${barbershopId.slice(0, 20)}...`
    : `/barbershops/${barbershopId.slice(0, 8)}...`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(barbershopUrl)
      toast.success("Link da barbearia copiado com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível copiar o link")
    }
  }

  return (
    <div className="mt-2 flex max-w-full items-center justify-between gap-2 rounded-md border border-border bg-secondary px-2 py-1">
      <span
        className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground sm:hidden"
        title={barbershopUrl}
      >
        {shortBarbershopUrlLabel}
      </span>

      <span
        className="hidden min-w-0 flex-1 truncate text-[11px] text-muted-foreground sm:block lg:text-xs"
        title={barbershopUrl}
      >
        {barbershopUrl}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={handleCopyLink}
        title="Copiar link da barbearia"
        aria-label="Copiar link da barbearia"
      >
        <CopyIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default CopyBarbershopLink
