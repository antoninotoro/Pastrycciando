"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, type Recipe, type Ingredient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { NutritionChart } from "@/components/nutrition-chart"
import { IngredientBalance } from "@/components/ingredient-balance"
import { IngredientSubstitution } from "@/components/ingredient-substitution"
import { RecipeImageUpload } from "@/components/recipe-image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState(100)
  const [scaledIngredients, setScaledIngredients] = useState<Ingredient[]>([])
  const [modifiedIngredients, setModifiedIngredients] = useState<Ingredient[] | null>(null)
  const [modificationNote, setModificationNote] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newRecipeName, setNewRecipeName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadRecipe(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (recipe) {
      const scaled = recipe.ingredienti.map((ing) => ({
        ...ing,
        quantita: (ing.quantita * scale) / 100,
      }))
      setScaledIngredients(scaled)
    }
  }, [recipe, scale])

  async function loadRecipe(id: string) {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      setRecipe(data)
    } catch (error) {
      console.error("Errore nel caricamento della ricetta:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleAcceptModifications(ingredients: Ingredient[], note: string = "") {
    setModifiedIngredients(ingredients)
    setModificationNote(note)
    setNewRecipeName(recipe ? `${recipe.nome} - Modificata` : "Nuova Ricetta")
    setShowSaveDialog(true)
  }

  async function handleSaveNewRecipe() {
    if (!recipe || !modifiedIngredients || !newRecipeName.trim()) return

    setSaving(true)
    try {
      // Cerca un'immagine per la nuova ricetta
      let imageUrl = recipe.image_url
      try {
        const imageResponse = await fetch("/api/images/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: newRecipeName.trim() + " " + (recipe.categoria || ""),
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          imageUrl = imageData.imageUrl
        }
      } catch (imageError) {
        console.error("Errore nella ricerca immagine:", imageError)
        // Continua con l'immagine originale se la ricerca fallisce
      }

      const newRecipe: Omit<Recipe, "id" | "created_at" | "updated_at"> = {
        nome: newRecipeName.trim(),
        categoria: recipe.categoria,
        ingredienti: modifiedIngredients,
        procedimento: recipe.procedimento,
        consigli: modificationNote
          ? `${recipe.consigli || ""}\n\n**Modifica AI:** ${modificationNote}`.trim()
          : recipe.consigli,
        image_url: imageUrl,
      }

      const { data, error } = await supabase
        .from("recipes")
        .insert([newRecipe])
        .select()
        .single()

      if (error) throw error

      // Redirect to the new recipe
      router.push(`/recipe/${data.id}`)
    } catch (error) {
      console.error("Errore nel salvare la ricetta:", error)
      alert("Errore nel salvare la ricetta. Riprova.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Ricetta non trovata</h2>
          <Button onClick={() => router.push("/")}>Torna alla Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{recipe.nome}</h1>
            {recipe.categoria && (
              <p className="text-muted-foreground mt-1">{recipe.categoria}</p>
            )}
          </div>
        </div>
        <RecipeImageUpload
          recipeId={recipe.id}
          recipeName={recipe.nome}
          onImageUpdated={() => loadRecipe(params.id as string)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients with Scaling */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredienti</CardTitle>
              <CardDescription>
                Usa lo slider per scalare le quantità ({scale}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium min-w-[60px]">{scale}%</span>
                  <Slider
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    min={25}
                    max={400}
                    step={25}
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Min: 25%</div>
                  <div className="text-right">Max: 400%</div>
                </div>
              </div>

              <div className="space-y-2">
                {scaledIngredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{ing.nome}</span>
                    <span className="text-muted-foreground">
                      {ing.quantita.toFixed(1)} {ing.unita}
                      {ing.percentuale && (
                        <span className="ml-2 text-xs">({ing.percentuale}%)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Procedure */}
          {recipe.procedimento && (
            <Card>
              <CardHeader>
                <CardTitle>Procedimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {recipe.procedimento}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {recipe.consigli && (
            <Card>
              <CardHeader>
                <CardTitle>Consigli</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {recipe.consigli}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Nutrition Chart */}
          <NutritionChart ingredients={scaledIngredients} />

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funzionalità AI</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="balance" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="balance">Bilancia</TabsTrigger>
                  <TabsTrigger value="substitute">Sostituisci</TabsTrigger>
                </TabsList>
                <TabsContent value="balance" className="mt-4">
                  <IngredientBalance
                    recipe={recipe}
                    onAcceptModifications={(ingredients) => handleAcceptModifications(ingredients)}
                  />
                </TabsContent>
                <TabsContent value="substitute" className="mt-4">
                  <IngredientSubstitution
                    recipe={recipe}
                    onAcceptModifications={(ingredients, note) => handleAcceptModifications(ingredients, note)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save New Recipe Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salva Nuova Ricetta</DialogTitle>
            <DialogDescription>
              Stai per salvare una nuova versione di questa ricetta con gli ingredienti modificati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Nome della Ricetta</Label>
              <Input
                id="recipe-name"
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                placeholder="Inserisci il nome della ricetta"
              />
            </div>
            {modificationNote && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p className="font-medium mb-1">Modifica applicata:</p>
                <p className="text-muted-foreground">{modificationNote}</p>
              </div>
            )}
            {modifiedIngredients && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Nuovi ingredienti:</p>
                <div className="p-3 bg-muted rounded-md text-sm max-h-[200px] overflow-y-auto">
                  {modifiedIngredients.map((ing, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span>{ing.nome}</span>
                      <span className="text-muted-foreground">
                        {ing.quantita} {ing.unita}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleSaveNewRecipe}
              disabled={saving || !newRecipeName.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Ricetta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
