"use client"

import { useState } from "react"
import { supabase, type Recipe, type Ingredient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RecipeUploadProps {
  onUploadComplete: () => void
}

export function RecipeUpload({ onUploadComplete }: RecipeUploadProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setStatus({ type: null, message: "" })

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Supporta sia array che singolo oggetto
      const recipes = Array.isArray(data) ? data : [data]

      let successCount = 0
      let errorCount = 0

      for (const recipeData of recipes) {
        try {
          // Normalizza gli ingredienti
          let ingredienti: Ingredient[] = []

          if (Array.isArray(recipeData.ingredienti)) {
            ingredienti = recipeData.ingredienti
          } else if (typeof recipeData.ingredienti === "string") {
            // Se è una stringa JSON, prova a parsarla
            try {
              ingredienti = JSON.parse(recipeData.ingredienti)
            } catch {
              console.error("Formato ingredienti non valido")
              errorCount++
              continue
            }
          } else if (typeof recipeData.ingredienti === "object") {
            // Se è un oggetto, convertilo in array
            ingredienti = Object.entries(recipeData.ingredienti).map(
              ([nome, value]: [string, any]) => ({
                nome,
                quantita: value.quantita || 0,
                unita: value.unita || "g",
                percentuale: value.percentuale,
              })
            )
          }

          // Validazione minima
          if (!recipeData.nome || ingredienti.length === 0) {
            errorCount++
            continue
          }

          // Cerca immagine se non presente
          let imageUrl = recipeData.image_url || null
          if (!imageUrl) {
            try {
              const imageResponse = await fetch("/api/images/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query: recipeData.nome + " " + (recipeData.categoria || ""),
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
          }

          const { error } = await supabase.from("recipes").insert({
            nome: recipeData.nome,
            categoria: recipeData.categoria || null,
            ingredienti: ingredienti,
            procedimento: recipeData.procedimento || null,
            consigli: recipeData.consigli || null,
            image_url: imageUrl,
          })

          if (error) {
            console.error("Errore inserimento:", error)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.error("Errore elaborazione ricetta:", err)
          errorCount++
        }
      }

      if (successCount > 0) {
        setStatus({
          type: "success",
          message: `${successCount} ricetta/e caricate con successo${errorCount > 0 ? `, ${errorCount} fallite` : ""}`,
        })
        onUploadComplete()
        setTimeout(() => {
          setOpen(false)
          setStatus({ type: null, message: "" })
        }, 2000)
      } else {
        setStatus({
          type: "error",
          message: "Nessuna ricetta caricata. Verifica il formato del file.",
        })
      }
    } catch (error) {
      console.error("Errore nel caricamento:", error)
      setStatus({
        type: "error",
        message: "Errore nel leggere il file. Assicurati che sia un JSON valido.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Carica Ricette
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carica Ricette da JSON</DialogTitle>
          <DialogDescription>
            Carica un file JSON con le tue ricette. Il file deve contenere i
            campi: nome, categoria, ingredienti, procedimento, consigli.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File JSON</Label>
            <Input
              id="file"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>

          {status.type && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                status.type === "success"
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="text-sm">{status.message}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Caricamento in corso...</span>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Formato esempio:</p>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "nome": "Torta al cioccolato",
  "categoria": "Torte",
  "ingredienti": [
    {
      "nome": "Farina",
      "quantita": 200,
      "unita": "g",
      "percentuale": 100
    }
  ],
  "procedimento": "...",
  "consigli": "..."
}`}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}
