import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json()

    if (!ingredients || ingredients.trim() === '') {
      return NextResponse.json(
        { error: 'Gli ingredienti sono richiesti' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: `Sei un esperto pasticcere italiano. Il tuo compito è suggerire ricette di pasticceria basate sugli ingredienti forniti dall'utente.

Regole:
- Suggerisci 3-5 ricette creative e fattibili
- Usa principalmente gli ingredienti forniti, ma puoi aggiungere ingredienti base comuni (zucchero, sale, lievito, ecc.)
- Fornisci il nome della ricetta e una breve descrizione (2-3 righe)
- Sii creativo ma pratico
- Rispondi in italiano

Formato della risposta:
1. **Nome Ricetta** - Breve descrizione della ricetta e perché funziona con questi ingredienti.
2. **Nome Ricetta** - Breve descrizione...
(continua per 3-5 ricette)`,
      messages: [
        {
          role: 'user',
          content: `Ho questi ingredienti in dispensa: ${ingredients}\n\nSuggeriscimi alcune ricette di pasticceria che posso preparare.`,
        },
      ],
    })

    const content = message.content[0]
    const suggestions = content.type === 'text' ? content.text : ''

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Errore nella chiamata API:', error)
    return NextResponse.json(
      { error: 'Errore nel generare i suggerimenti' },
      { status: 500 }
    )
  }
}
