"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Image, Loader2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UpdateImagesButtonProps {
  onUpdateComplete?: () => void
}

export function UpdateImagesButton({ onUpdateComplete }: UpdateImagesButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | null
    message: string
    details?: { total: number; updated: number; failed: number }
  }>({ type: null, message: "" })

  async function handleUpdate() {
    setLoading(true)
    setResult({ type: null, message: "" })

    try {
      const response = await fetch("/api/admin/update-images", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message,
          details: {
            total: data.total,
            updated: data.updated,
            failed: data.failed,
          },
        })
        if (onUpdateComplete) {
          onUpdateComplete()
        }
      } else {
        setResult({
          type: "error",
          message: data.error || "Errore nell'aggiornamento",
        })
      }
    } catch (error) {
      console.error("Errore:", error)
      setResult({
        type: "error",
        message: "Errore nella chiamata API",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="h-4 w-4 mr-2" />
          Aggiorna Immagini
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiorna Immagini Ricette</DialogTitle>
          <DialogDescription>
            Questo aggiungerà automaticamente immagini a tutte le ricette che non ne hanno una.
            Il processo può richiedere alcuni minuti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result.type && !loading && (
            <Button onClick={handleUpdate} className="w-full">
              <Image className="h-4 w-4 mr-2" />
              Avvia Aggiornamento
            </Button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Aggiornamento in corso...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Questo può richiedere qualche minuto
                </p>
              </div>
            </div>
          )}

          {result.type && (
            <div
              className={`p-4 rounded-md border ${
                result.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    result.type === "success" ? "text-green-900" : "text-red-900"
                  }`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Totale ricette trovate: {result.details.total}</p>
                      <p className="text-green-700">Aggiornate con successo: {result.details.updated}</p>
                      {result.details.failed > 0 && (
                        <p className="text-red-700">Fallite: {result.details.failed}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {result.type && (
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
            Chiudi
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
