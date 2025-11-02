import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { description } = await request.json()

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'La descrizione è richiesta' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3072,
      system: `Sei un maestro pasticcere italiano esperto. Il tuo compito è creare ricette di pasticceria complete e dettagliate basate sulle richieste dell'utente.

Regole:
- Crea ricette bilanciate e funzionanti
- Usa percentuali rispetto alla farina (se presente) o all'ingrediente principale
- Fornisci quantità precise in grammi o millilitri
- Includi istruzioni dettagliate e consigli pratici
- Rispetta eventuali restrizioni alimentari (vegano, senza glutine, ecc.)
- Rispondi SEMPRE in formato JSON valido

Formato OBBLIGATORIO della risposta (JSON):
{
  "nome": "Nome della ricetta",
  "categoria": "Categoria (es: Biscotti, Torte, Lievitati, ecc.)",
  "ingredienti": [
    {
      "nome": "Nome ingrediente",
      "quantita": numero,
      "unita": "g/ml/pezzi",
      "percentuale": numero (opzionale, rispetto all'ingrediente base)
    }
  ],
  "procedimento": "Istruzioni dettagliate passo dopo passo...",
  "consigli": "Consigli pratici per la riuscita della ricetta..."
}`,
      messages: [
        {
          role: 'user',
          content: `Crea una ricetta di pasticceria basata su questa richiesta: ${description}`,
        },
      ],
    })

    const content = message.content[0]
    const recipeText = content.type === 'text' ? content.text : ''

    // Estrai il JSON dalla risposta
    let recipe
    try {
      // Cerca un blocco JSON nella risposta
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0])
      } else {
        recipe = JSON.parse(recipeText)
      }
    } catch (parseError) {
      console.error('Errore nel parsing JSON:', parseError)
      return NextResponse.json(
        { error: 'Errore nel formato della ricetta generata', rawResponse: recipeText },
        { status: 500 }
      )
    }

    return NextResponse.json({ recipe })
  } catch (error) {
    console.error('Errore nella chiamata API:', error)
    return NextResponse.json(
      { error: 'Errore nel generare la ricetta' },
      { status: 500 }
    )
  }
}
