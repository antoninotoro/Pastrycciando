import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Recupera tutte le ricette (per aggiornare anche quelle con URL vecchi)
    const { data: recipes, error: fetchError } = await supabase
      .from('recipes')
      .select('*')

    if (fetchError) {
      console.error('Errore nel recuperare le ricette:', fetchError)
      return NextResponse.json(
        { error: 'Errore nel recuperare le ricette' },
        { status: 500 }
      )
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({
        message: 'Nessuna ricetta da aggiornare',
        updated: 0,
        total: 0,
      })
    }

    console.log(`Aggiornamento di ${recipes.length} ricette con nuove immagini da Unsplash API`)

    let updated = 0
    let failed = 0

    for (const recipe of recipes) {
      try {
        // Cerca un'immagine per la ricetta
        const baseUrl = new URL(request.url).origin
        const imageResponse = await fetch(`${baseUrl}/api/images/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: recipe.nome + ' ' + (recipe.categoria || ''),
          }),
        })

        if (!imageResponse.ok) {
          console.error(`Errore nella ricerca immagine per ${recipe.nome}`)
          failed++
          continue
        }

        const imageData = await imageResponse.json()
        const imageUrl = imageData.imageUrl

        // Aggiorna la ricetta con l'immagine
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ image_url: imageUrl })
          .eq('id', recipe.id)

        if (updateError) {
          console.error(`Errore aggiornamento ${recipe.nome}:`, updateError)
          failed++
        } else {
          console.log(`✓ Aggiornata: ${recipe.nome}`)
          updated++
        }

        // Piccola pausa per non sovraccaricare l'API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Errore elaborazione ${recipe.nome}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      message: 'Aggiornamento completato',
      total: recipes.length,
      updated,
      failed,
    })
  } catch (error) {
    console.error('Errore generale:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle immagini' },
      { status: 500 }
    )
  }
}
