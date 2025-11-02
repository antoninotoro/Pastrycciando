"use client"

import { useState, useEffect } from "react"
import { type Ingredient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

interface NutritionChartProps {
  ingredients: Ingredient[]
}

interface NutritionData {
  calorieTotali: number
  caloriePerPorzione: number
  porzioni: number
  proteine: number
  grassi: number
  carboidrati: number
}

const COLORS = {
  proteine: "oklch(0.65 0.18 35)",
  grassi: "oklch(0.70 0.15 120)",
  carboidrati: "oklch(0.60 0.12 280)",
}

export function NutritionChart({ ingredients }: NutritionChartProps) {
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ingredients.length > 0) {
      fetchNutrition()
    }
  }, [ingredients])

  async function fetchNutrition() {
    setLoading(true)

    try {
      const response = await fetch("/api/ai/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredienti: ingredients }),
      })

      const data = await response.json()

      if (response.ok) {
        setNutrition(data.nutrition)
      } else {
        console.error("Errore nel calcolo nutrizionale:", data.error)
      }
    } catch (error) {
      console.error("Errore:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = nutrition
    ? [
        { name: "Proteine", value: nutrition.proteine, color: COLORS.proteine },
        { name: "Grassi", value: nutrition.grassi, color: COLORS.grassi },
        { name: "Carboidrati", value: nutrition.carboidrati, color: COLORS.carboidrati },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valori Nutrizionali</CardTitle>
        <CardDescription>Calcolati con AI</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : nutrition ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Calorie Totali</p>
                <p className="text-2xl font-bold">{Math.round(nutrition.calorieTotali)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Per Porzione</p>
                <p className="text-2xl font-bold">
                  {Math.round(nutrition.caloriePerPorzione)}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Circa {nutrition.porzioni} porzioni
            </div>

            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name}: ${((percent as number) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Macros Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.proteine }}
                  />
                  Proteine
                </span>
                <span className="font-medium">{Math.round(nutrition.proteine)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.grassi }}
                  />
                  Grassi
                </span>
                <span className="font-medium">{Math.round(nutrition.grassi)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.carboidrati }}
                  />
                  Carboidrati
                </span>
                <span className="font-medium">{Math.round(nutrition.carboidrati)}g</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nessun dato nutrizionale disponibile
          </p>
        )}
      </CardContent>
    </Card>
  )
}
