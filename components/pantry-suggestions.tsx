"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export function PantrySuggestions() {
  const [ingredients, setIngredients] = useState("")
  const [suggestions, setSuggestions] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSuggest() {
    if (!ingredients.trim()) return

    setLoading(true)
    setSuggestions("")

    try {
      const response = await fetch("/api/ai/suggest-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuggestions(data.suggestions)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggerimenti da Dispensa
        </CardTitle>
        <CardDescription>
          Elenca gli ingredienti che hai a disposizione e riceverai suggerimenti per ricette creative
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Es: farina, uova, zucchero, cioccolato, burro, miele..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSuggest}
          disabled={loading || !ingredients.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando suggerimenti...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Suggerisci Ricette
            </>
          )}
        </Button>

        {suggestions && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3">Suggerimenti:</h4>
            <div className="prose prose-sm max-w-none">
              {suggestions.split("\n").map((line, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
