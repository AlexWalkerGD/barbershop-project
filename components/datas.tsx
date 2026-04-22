import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "./ui/card"

interface BarberDatas {
  title: string
  value: string
  growth: string
  description: string
  trend?: "up" | "down"
}

const Datas = ({
  title,
  value,
  growth,
  description,
  trend = "up",
}: BarberDatas) => {
  const isPositive = trend === "up"

  return (
    <Card className="mt-3 overflow-hidden rounded-xl border bg-card/80 shadow-sm transition-colors hover:bg-card">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
            <h1 className="text-2xl font-bold leading-none text-primary sm:text-3xl">
              {value}
            </h1>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
              isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            <span>{growth}</span>
          </div>
        </div>

        <p className="text-[11px] leading-4 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default Datas
