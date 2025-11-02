"use client"

import { useState } from "react"
import { type Recipe, type Ingredient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Scale, Check } from "lucide-react"

interface IngredientBalanceProps {
  recipe: Recipe
  onAcceptModifications?: (ingredients: Ingredient[]) => void
}

export function IngredientBalance({ recipe, onAcceptModifications }: IngredientBalanceProps) {
  const [userRequest, setUserRequest] = useState("")
  const [suggestions, setSuggestions] = useState("")
  const [modifiedIngredients, setModifiedIngredients] = useState<Ingredient[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleBalance() {
    if (!userRequest.trim()) return

    setLoading(true)
    setSuggestions("")
    setModifiedIngredients(null)

    try {
      const response = await fetch("/api/ai/balance-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe: {
            nome: recipe.nome,
            ingredienti: recipe.ingredienti,
          },
          userRequest: userRequest.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuggestions(data.suggestions)
        if (data.modifiedIngredients) {
          setModifiedIngredients(data.modifiedIngredients)
        }
      } else {
        setSuggestions("Errore: " + (data.error || "Qualcosa è andato storto"))
      }
    } catch (error) {
      console.error("Errore:", error)
      setSuggestions("Errore nella chiamata API")
    } finally {
      setLoading(false)
    }
  }

  function handleAcceptModifications() {
    if (modifiedIngredients && onAcceptModifications) {
      onAcceptModifications(modifiedIngredients)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="balance-request">
          Cosa vorresti ottenere?
        </Label>
        <Textarea
          id="balance-request"
          placeholder="Es: più leggero, più soffice, meno dolce..."
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleBalance}
        disabled={loading || !userRequest.trim()}
        className="w-full"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analizzando...
          </>
        ) : (
          <>
            <Scale className="h-4 w-4 mr-2" />
            Bilancia Ingredienti
          </>
        )}
      </Button>

      {suggestions && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-muted rounded-md text-sm space-y-2 max-h-[400px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {suggestions.split("\n").map((line, i) => {
                // Render markdown table
                if (line.startsWith("|")) {
                  return (
                    <div key={i} className="font-mono text-xs">
                      {line}
                    </div>
                  )
                }
                // Render bold text
                if (line.includes("**")) {
                  const parts = line.split("**")
                  return (
                    <p key={i} className="mb-1">
                      {parts.map((part, j) =>
                        j % 2 === 0 ? (
                          <span key={j}>{part}</span>
                        ) : (
                          <strong key={j}>{part}</strong>
                        )
                      )}
                    </p>
                  )
                }
                return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />
              })}
            </div>
          </div>

          {modifiedIngredients && (
            <Button
              onClick={handleAcceptModifications}
              className="w-full"
              size="sm"
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" />
              Accetta Modifiche e Salva come Nuova Ricetta
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
