import { format } from "date-fns/format"
import { Card, CardContent } from "./ui/card"
import { BarbershopService } from "@prisma/client"
import { ptBR } from "date-fns/locale"
import { formatDurationLabel } from "@/lib/booking-utils"

interface BookingSummaryProps {
  service: Pick<BarbershopService, "name" | "price" | "durationInMinutes">
  barbershop: Pick<BarbershopService, "name">
  selectedDate: Date
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "EUR",
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Data</h2>
          <p className="text-sm">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Horário</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Barbearia</h2>
          <p className="text-sm">{barbershop.name}</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">Duração</h2>
          <p className="text-sm">
            {formatDurationLabel(service.durationInMinutes ?? 30)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
