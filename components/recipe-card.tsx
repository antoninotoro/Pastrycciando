"use client"

import { useState } from "react"
import Link from "next/link"
import { type Recipe } from "@/lib/supabase"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RecipeCardProps {
  recipe: Recipe
  onDelete: (id: string) => void
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="card-hover overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
        {recipe.image_url && !imageError ? (
          <img
            src={recipe.image_url}
            alt={recipe.nome}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">🧁</div>
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminare la ricetta?</DialogTitle>
                <DialogDescription>
                  Sei sicuro di voler eliminare "{recipe.nome}"? Questa azione non può essere annullata.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Annulla</Button>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(recipe.id)}
                >
                  Elimina
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{recipe.nome}</h3>
          {recipe.categoria && (
            <Badge variant="secondary" className="w-fit">
              {recipe.categoria}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">
          {recipe.ingredienti.length} ingredienti
        </p>
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/recipe/${recipe.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Vedi Dettagli
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
