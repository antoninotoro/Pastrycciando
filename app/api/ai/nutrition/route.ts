import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { ingredienti } = await request.json()

    if (!ingredienti || ingredienti.length === 0) {
      return NextResponse.json(
        { error: 'Ingredienti richiesti' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: `Sei un nutrizionista esperto. Calcola i valori nutrizionali approssimativi per la ricetta fornita.

Considera i valori medi per 100g di ogni ingrediente e calcola:
- Calorie totali
- Proteine (g)
- Grassi (g)
- Carboidrati (g)
- Calorie per porzione (assumi 8-12 porzioni per ricetta tipica)

Rispondi SOLO in formato JSON valido:
{
  "calorieTotali": numero,
  "caloriePerPorzione": numero,
  "porzioni": numero,
  "proteine": numero,
  "grassi": numero,
  "carboidrati": numero
}`,
      messages: [
        {
          role: 'user',
          content: `Calcola i valori nutrizionali per questi ingredienti:\n${JSON.stringify(ingredienti, null, 2)}`,
        },
      ],
    })

    const content = message.content[0]
    const nutritionText = content.type === 'text' ? content.text : ''

    let nutrition
    try {
      const jsonMatch = nutritionText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        nutrition = JSON.parse(jsonMatch[0])
      } else {
        nutrition = JSON.parse(nutritionText)
      }
    } catch (parseError) {
      console.error('Errore nel parsing JSON:', parseError)
      return NextResponse.json(
        { error: 'Errore nel calcolo nutrizionale', rawResponse: nutritionText },
        { status: 500 }
      )
    }

    return NextResponse.json({ nutrition })
  } catch (error) {
    console.error('Errore nella chiamata API:', error)
    return NextResponse.json(
      { error: 'Errore nel calcolare i valori nutrizionali' },
      { status: 500 }
    )
  }
}
