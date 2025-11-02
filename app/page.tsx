"use client"

import { useState, useEffect } from "react"
import { supabase, type Recipe } from "@/lib/supabase"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeUpload } from "@/components/recipe-upload"
import { PantrySuggestions } from "@/components/pantry-suggestions"
import { RecipeCreator } from "@/components/recipe-creator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ChefHat, Sparkles } from "lucide-react"

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = recipes.filter(
        (recipe) =>
          recipe.nome.toLowerCase().includes(query) ||
          recipe.categoria?.toLowerCase().includes(query)
      )
      setFilteredRecipes(filtered)
    }
  }, [searchQuery, recipes])

  async function loadRecipes() {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setRecipes(data || [])
      setFilteredRecipes(data || [])
    } catch (error) {
      console.error("Errore nel caricamento delle ricette:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", id)

      if (error) throw error
      loadRecipes()
    } catch (error) {
      console.error("Errore nell'eliminazione:", error)
    }
  }

  async function handleRecipeCreated() {
    loadRecipes()
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Benvenuto in Pastrycciando
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          La tua piattaforma di pasticceria intelligente. Scopri ricette, crea nuove delizie con l'AI e bilancia perfettamente ogni ingrediente.
        </p>
      </section>

      {/* AI Features Tabs */}
      <section className="max-w-4xl mx-auto">
        <Tabs defaultValue="pantry" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pantry">
              <ChefHat className="h-4 w-4 mr-2" />
              Suggerimenti da Dispensa
            </TabsTrigger>
            <TabsTrigger value="create">
              <Sparkles className="h-4 w-4 mr-2" />
              Crea Ricetta con AI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pantry" className="mt-6">
            <PantrySuggestions />
          </TabsContent>
          <TabsContent value="create" className="mt-6">
            <RecipeCreator onRecipeCreated={handleRecipeCreated} />
          </TabsContent>
        </Tabs>
      </section>

      {/* Recipes Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Le Tue Ricette</h2>
            <p className="text-muted-foreground mt-1">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? "ricetta" : "ricette"}
            </p>
          </div>
          <RecipeUpload onUploadComplete={loadRecipes} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca ricette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Nessuna ricetta trovata</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Prova a cercare qualcos'altro"
                : "Carica le tue prime ricette o creane una con l'AI!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
