"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type GoalType = "revenue" | "clients"

interface EditGoalProps {
  initialType: GoalType
  initialTargetValue: number
  onCancel: () => void
  onSave: (goal: { type: GoalType; targetValue: number }) => void
}

const EditGoal = ({
  initialType,
  initialTargetValue,
  onCancel,
  onSave,
}: EditGoalProps) => {
  const [goalType, setGoalType] = useState<GoalType>(initialType)
  const [targetValue, setTargetValue] = useState(String(initialTargetValue))

  useEffect(() => {
    setGoalType(initialType)
    setTargetValue(String(initialTargetValue))
  }, [initialTargetValue, initialType])

  const handleSave = () => {
    const parsedValue = Number(targetValue)

    if (!parsedValue || parsedValue <= 0) {
      return
    }

    onSave({
      type: goalType,
      targetValue: parsedValue,
    })
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Editar meta</DialogTitle>
        <DialogDescription>
          Defina a meta que deseja atingir esse mês.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Select
            value={goalType}
            onValueChange={(value) => setGoalType(value as GoalType)}
          >
            <SelectTrigger id="goal-type">
              <SelectValue placeholder="Selecione o tipo da meta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Meta de faturamento</SelectItem>
              <SelectItem value="clients">Meta de clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Input
            id="goal-target"
            type="number"
            min="1"
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            placeholder={
              goalType === "revenue" ? "Ex: 5000" : "Ex: 80 clientes"
            }
          />
          <p className="text-xs text-muted-foreground">
            {goalType === "revenue"
              ? "Informe o valor total que deseja faturar no mês."
              : "Informe a quantidade de clientes que deseja atender no mês."}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          Salvar meta
        </Button>
      </DialogFooter>
    </div>
  )
}

export default EditGoal
