"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { updateMonthlyGoal } from "@/app/_actions/update-monthly-goal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import EditGoal from "./editGoal"
import { Card, CardContent } from "./ui/card"

export type GoalType = "revenue" | "clients"

interface MonthlyGoalProps {
  barbershopId?: string
  initialGoalType?: GoalType
  initialTargetValue: number
  currentRevenueValue: number
  currentClientsValue: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const formatValue = (type: GoalType, value: number) => {
  if (type === "revenue") {
    return formatCurrency(value)
  }

  return `${value} clientes`
}

const MonthlyGoal = ({
  barbershopId,
  initialGoalType = "revenue",
  initialTargetValue,
  currentRevenueValue,
  currentClientsValue,
}: MonthlyGoalProps) => {
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [goalConfig, setGoalConfig] = useState({
    type: initialGoalType,
    targetValue: initialTargetValue,
  })

  const currentValue = useMemo(
    () =>
      goalConfig.type === "revenue" ? currentRevenueValue : currentClientsValue,
    [currentClientsValue, currentRevenueValue, goalConfig.type],
  )

  const progress =
    goalConfig.targetValue > 0
      ? Math.min((currentValue / goalConfig.targetValue) * 100, 100)
      : 0

  const handleSaveGoal = async (goal: {
    type: GoalType
    targetValue: number
  }) => {
    if (!barbershopId) {
      toast.error("Cadastre uma barbearia antes de configurar a meta")
      return
    }

    try {
      setIsSaving(true)
      const updatedGoal = await updateMonthlyGoal({
        barbershopId,
        goalType: goal.type,
        goalValue: goal.targetValue,
      })

      setGoalConfig({
        type: updatedGoal.monthlyGoalType === "CLIENTS" ? "clients" : "revenue",
        targetValue: updatedGoal.monthlyGoalValue ?? goal.targetValue,
      })
      setIsEditGoalOpen(false)
      toast.success("Meta mensal atualizada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível atualizar a meta mensal")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Card className="rounded-2xl border bg-card/85 shadow-sm">
        <CardContent className="space-y-5 p-4">
          <div className="flex justify-between gap-3">
            <h3 className="text-lg font-bold text-foreground">
              {progress.toFixed(0)}% da meta atingida
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-md text-xs"
              disabled={!barbershopId}
              onClick={() => setIsEditGoalOpen(true)}
            >
              Editar meta
            </Button>
          </div>

          <div className="space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{formatValue(goalConfig.type, currentValue)}</span>
              <span className="font-semibold text-foreground">
                {formatValue(goalConfig.type, goalConfig.targetValue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isEditGoalOpen}
        onOpenChange={(open) => setIsEditGoalOpen(open)}
      >
        <DialogContent
          className="w-[90%]"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <EditGoal
            initialType={goalConfig.type}
            initialTargetValue={goalConfig.targetValue}
            isSaving={isSaving}
            onCancel={() => setIsEditGoalOpen(false)}
            onSave={handleSaveGoal}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MonthlyGoal
