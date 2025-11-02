"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RecipeImageUploadProps {
  recipeId: string
  recipeName: string
  onImageUpdated: () => void
}

export function RecipeImageUpload({ recipeId, recipeName, onImageUpdated }: RecipeImageUploadProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleUrlSubmit() {
    if (!imageUrl.trim()) return

    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('recipes')
        .update({ image_url: imageUrl.trim() })
        .eq('id', recipeId)

      if (error) throw error

      setSuccess(true)
      onImageUpdated()

      setTimeout(() => {
        setOpen(false)
        setImageUrl("")
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Errore:", error)
      alert("Errore nell'aggiornare l'immagine")
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido')
      return
    }

    // Verifica dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine è troppo grande. Massimo 5MB.')
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      // Converti l'immagine in base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        try {
          const { error } = await supabase
            .from('recipes')
            .update({ image_url: base64 })
            .eq('id', recipeId)

          if (error) throw error

          setSuccess(true)
          onImageUpdated()

          setTimeout(() => {
            setOpen(false)
            setSuccess(false)
          }, 1500)
        } catch (error) {
          console.error("Errore:", error)
          alert("Errore nel salvare l'immagine")
        } finally {
          setLoading(false)
        }
      }

      reader.onerror = () => {
        alert("Errore nella lettura del file")
        setLoading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Errore:", error)
      alert("Errore nel caricare l'immagine")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Cambia Immagine
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambia Immagine Ricetta</DialogTitle>
          <DialogDescription>
            Carica un'immagine per "{recipeName}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL Immagine</TabsTrigger>
            <TabsTrigger value="upload">Carica File</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL Immagine</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://esempio.com/immagine.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Incolla l'URL di un'immagine da internet
              </p>
            </div>

            <Button
              onClick={handleUrlSubmit}
              disabled={loading || !imageUrl.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Salvato!
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Usa questo URL
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-file">Carica Immagine</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP - Massimo 5MB
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center p-4 text-green-600">
                <CheckCircle2 className="h-6 w-6 mr-2" />
                <span>Immagine salvata!</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
