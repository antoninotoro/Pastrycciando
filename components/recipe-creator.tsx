"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Save, CheckCircle2 } from "lucide-react"

interface RecipeCreatorProps {
  onRecipeCreated: () => void
}

export function RecipeCreator({ onRecipeCreated }: RecipeCreatorProps) {
  const [description, setDescription] = useState("")
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleGenerate() {
    if (!description.trim()) return

    setLoading(true)
    setGeneratedRecipe(null)
    setSaved(false)

    try {
      const response = await fetch("/api/ai/create-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedRecipe(data.recipe)
      } else {
        alert("Errore: " + (data.error || "Qualcosa è andato storto"))
      }
    } catch (error) {
      console.error("Errore:", error)
      alert("Errore nella chiamata API")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!generatedRecipe) return

    setSaving(true)

    try {
      // Cerca un'immagine per la ricetta
      let imageUrl = null
      try {
        const imageResponse = await fetch("/api/images/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: generatedRecipe.nome + " " + (generatedRecipe.categoria || ""),
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          imageUrl = imageData.imageUrl
        }
      } catch (imageError) {
        console.error("Errore ricerca immagine:", imageError)
        // Continua senza immagine
      }

      const { error } = await supabase.from("recipes").insert({
        nome: generatedRecipe.nome,
        categoria: generatedRecipe.categoria,
        ingredienti: generatedRecipe.ingredienti,
        procedimento: generatedRecipe.procedimento,
        consigli: generatedRecipe.consigli,
        image_url: imageUrl,
      })

      if (error) throw error

      setSaved(true)
      onRecipeCreated()

      setTimeout(() => {
        setGeneratedRecipe(null)
        setDescription("")
        setSaved(false)
      }, 2000)
    } catch (error) {
      console.error("Errore nel salvare la ricetta:", error)
      alert("Errore nel salvare la ricetta")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Crea Ricetta con AI
        </CardTitle>
        <CardDescription>
          Descrivi la ricetta che vuoi creare e l'AI la genererà per te
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Es: crea una ricetta di biscotti al cioccolato vegani e senza glutine..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !description.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando ricetta...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Genera Ricetta
            </>
          )}
        </Button>

        {generatedRecipe && (
          <div className="mt-6 space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{generatedRecipe.nome}</h3>
                {generatedRecipe.categoria && (
                  <p className="text-sm text-muted-foreground">
                    {generatedRecipe.categoria}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || saved}
                size="sm"
                className={saved ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Salvata!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva
                  </>
                )}
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Ingredienti:</h4>
              <ul className="space-y-1 text-sm">
                {generatedRecipe.ingredienti?.map((ing: any, i: number) => (
                  <li key={i}>
                    • {ing.nome}: {ing.quantita} {ing.unita}
                    {ing.percentuale && ` (${ing.percentuale}%)`}
                  </li>
                ))}
              </ul>
            </div>

            {generatedRecipe.procedimento && (
              <div>
                <h4 className="font-semibold mb-2">Procedimento:</h4>
                <p className="text-sm whitespace-pre-line">
                  {generatedRecipe.procedimento}
                </p>
              </div>
            )}

            {generatedRecipe.consigli && (
              <div>
                <h4 className="font-semibold mb-2">Consigli:</h4>
                <p className="text-sm whitespace-pre-line">
                  {generatedRecipe.consigli}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
