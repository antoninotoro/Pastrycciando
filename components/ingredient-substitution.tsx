"use client"

import { useState } from "react"
import { type Recipe, type Ingredient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Check } from "lucide-react"

interface SubstitutionOption {
  alternative: string
  ratio: string
  modified_ingredients: Ingredient[]
}

interface IngredientSubstitutionProps {
  recipe: Recipe
  onAcceptModifications?: (ingredients: Ingredient[], substitutionNote: string) => void
}

export function IngredientSubstitution({ recipe, onAcceptModifications }: IngredientSubstitutionProps) {
  const [ingredient, setIngredient] = useState("")
  const [suggestions, setSuggestions] = useState("")
  const [substitutionOptions, setSubstitutionOptions] = useState<SubstitutionOption[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubstitute() {
    if (!ingredient.trim()) return

    setLoading(true)
    setSuggestions("")
    setSubstitutionOptions(null)

    try {
      const response = await fetch("/api/ai/substitute-ingredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient: ingredient.trim(),
          recipe: {
            nome: recipe.nome,
            ingredienti: recipe.ingredienti,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuggestions(data.suggestions)
        if (data.substitutionOptions) {
          setSubstitutionOptions(data.substitutionOptions)
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

  function handleAcceptSubstitution(option: SubstitutionOption) {
    if (onAcceptModifications) {
      const note = `Sostituito ${ingredient} con ${option.alternative} (${option.ratio})`
      onAcceptModifications(option.modified_ingredients, note)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ingredient">
          Ingrediente da sostituire
        </Label>
        <Input
          id="ingredient"
          placeholder="Es: zucchero, burro, uova..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && ingredient.trim()) {
              handleSubstitute()
            }
          }}
        />
      </div>

      <Button
        onClick={handleSubstitute}
        disabled={loading || !ingredient.trim()}
        className="w-full"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cercando alternative...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Trova Sostituzioni
          </>
        )}
      </Button>

      {suggestions && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-muted rounded-md text-sm space-y-2 max-h-[400px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {suggestions.split("\n").map((line, i) => {
                // Render headers
                if (line.startsWith("###")) {
                  return (
                    <h4 key={i} className="font-semibold mt-3 mb-1 text-base">
                      {line.replace(/^###\s*/, "")}
                    </h4>
                  )
                }
                if (line.startsWith("##")) {
                  return (
                    <h3 key={i} className="font-bold mt-4 mb-2 text-lg">
                      {line.replace(/^##\s*/, "")}
                    </h3>
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

          {substitutionOptions && substitutionOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seleziona una sostituzione:</Label>
              {substitutionOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAcceptSubstitution(option)}
                  className="w-full justify-start"
                  size="sm"
                  variant="outline"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Usa {option.alternative} ({option.ratio})
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
