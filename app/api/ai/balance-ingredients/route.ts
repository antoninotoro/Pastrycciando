import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { recipe, userRequest } = await request.json()

    if (!recipe || !userRequest) {
      return NextResponse.json(
        { error: 'Ricetta e richiesta sono obbligatori' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      system: `Sei un maestro pasticcere esperto in bilanciamento degli ingredienti e tecniche di pasticceria.

Il tuo compito è:
1. Analizzare la ricetta fornita
2. Fornire i range di quantità MIN-MAX per ogni ingrediente rispettando le regole di pasticceria
3. Suggerire modifiche specifiche per ottenere il risultato richiesto dall'utente
4. IMPORTANTE: Dopo aver fornito i suggerimenti testuali, DEVI SEMPRE chiamare il tool 'provide_modified_ingredients' con la lista completa degli ingredienti con le nuove quantità

Regole di bilanciamento in pasticceria:
- La farina è di solito l'ingrediente base (100%)
- Zucchero: 20-100% rispetto alla farina
- Grassi (burro/olio): 20-80% rispetto alla farina
- Uova: contribuiscono a struttura e umidità (calcola in base al peso)
- Liquidi: bilanciare con ingredienti secchi
- Lievito: 1-3% per lievitati
- Sale: 0.5-2%

Formato della risposta:
Prima fornisci una tabella markdown con i range:
| Ingrediente | Quantità Attuale | Min | Max | Note |
|-------------|------------------|-----|-----|------|
| ... | ... | ... | ... | ... |

Poi fornisci suggerimenti specifici per ottenere: [richiesta utente]
- Ingrediente X: modificare da Y a Z perché...
- ...

INFINE, chiama il tool provide_modified_ingredients con TUTTI gli ingredienti (anche quelli non modificati) usando le nuove quantità suggerite.`,
      messages: [
        {
          role: 'user',
          content: `Ricetta attuale:
Nome: ${recipe.nome}
Ingredienti: ${JSON.stringify(recipe.ingredienti, null, 2)}

Richiesta dell'utente: ${userRequest}

Analizza il bilanciamento e suggerisci modifiche.`,
        },
      ],
      tools: [
        {
          name: 'provide_modified_ingredients',
          description: 'DEVI SEMPRE usare questo tool per fornire la lista degli ingredienti modificati in formato strutturato alla fine della tua risposta',
          input_schema: {
            type: 'object',
            properties: {
              modified_ingredients: {
                type: 'array',
                description: 'Lista degli ingredienti con le quantità modificate',
                items: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string', description: 'Nome dell\'ingrediente' },
                    quantita: { type: 'number', description: 'Nuova quantità suggerita' },
                    unita: { type: 'string', description: 'Unità di misura' },
                    percentuale: { type: 'number', description: 'Percentuale rispetto alla farina (opzionale)' },
                  },
                  required: ['nome', 'quantita', 'unita'],
                },
              },
            },
            required: ['modified_ingredients'],
          },
        },
      ],
    })

    let suggestions = ''
    let modifiedIngredients = null

    for (const block of message.content) {
      if (block.type === 'text') {
        suggestions = block.text
      } else if (block.type === 'tool_use' && block.name === 'provide_modified_ingredients') {
        modifiedIngredients = (block.input as any).modified_ingredients
      }
    }

    return NextResponse.json({ suggestions, modifiedIngredients })
  } catch (error) {
    console.error('Errore nella chiamata API:', error)
    return NextResponse.json(
      { error: 'Errore nel bilanciare gli ingredienti' },
      { status: 500 }
    )
  }
}
