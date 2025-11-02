import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { ingredient, recipe } = await request.json()

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente da sostituire è obbligatorio' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1536,
      system: `Sei un esperto pasticcere con conoscenza approfondita delle sostituzioni degli ingredienti in pasticceria.

Il tuo compito è suggerire 3-5 alternative valide per l'ingrediente da sostituire, considerando:
- Funzione dell'ingrediente nella ricetta (struttura, umidità, dolcezza, ecc.)
- Impatto su sapore, texture e aspetto
- Eventuali modifiche necessarie alle quantità
- Restrizioni alimentari comuni (vegano, senza glutine, ecc.)

Formato della risposta (markdown):
## Sostituzioni per [ingrediente]

### 1. [Alternativa 1]
**Rapporto di sostituzione:** 1:1 (o specificare)
**Impatto:** Descrizione breve dell'impatto su sapore, texture, colore
**Note:** Eventuali accorgimenti o modifiche necessarie

### 2. [Alternativa 2]
...

(continua per 3-5 alternative)

IMPORTANTE: Dopo aver fornito i suggerimenti testuali, DEVI SEMPRE chiamare il tool 'provide_substitution_options' con tutte le alternative suggerite e le liste complete degli ingredienti per ogni sostituzione.`,
      messages: [
        {
          role: 'user',
          content: recipe
            ? `Ricetta: ${recipe.nome}
Ingredienti: ${JSON.stringify(recipe.ingredienti, null, 2)}

Voglio sostituire: ${ingredient}

Suggeriscimi alternative adatte a questa ricetta.`
            : `Voglio sostituire ${ingredient} in una ricetta di pasticceria. Suggeriscimi alternative valide.`,
        },
      ],
      tools: [
        {
          name: 'provide_substitution_options',
          description: 'DEVI SEMPRE usare questo tool per fornire le opzioni di sostituzione in formato strutturato alla fine della tua risposta',
          input_schema: {
            type: 'object',
            properties: {
              substitutions: {
                type: 'array',
                description: 'Lista delle sostituzioni possibili',
                items: {
                  type: 'object',
                  properties: {
                    alternative: { type: 'string', description: 'Nome dell\'ingrediente alternativo' },
                    ratio: { type: 'string', description: 'Rapporto di sostituzione (es: 1:1, 1:1.5)' },
                    modified_ingredients: {
                      type: 'array',
                      description: 'Lista completa degli ingredienti con la sostituzione applicata',
                      items: {
                        type: 'object',
                        properties: {
                          nome: { type: 'string' },
                          quantita: { type: 'number' },
                          unita: { type: 'string' },
                          percentuale: { type: 'number' },
                        },
                        required: ['nome', 'quantita', 'unita'],
                      },
                    },
                  },
                  required: ['alternative', 'ratio', 'modified_ingredients'],
                },
              },
            },
            required: ['substitutions'],
          },
        },
      ],
    })

    let suggestions = ''
    let substitutionOptions = null

    for (const block of message.content) {
      if (block.type === 'text') {
        suggestions = block.text
      } else if (block.type === 'tool_use' && block.name === 'provide_substitution_options') {
        substitutionOptions = (block.input as any).substitutions
      }
    }

    return NextResponse.json({ suggestions, substitutionOptions })
  } catch (error) {
    console.error('Errore nella chiamata API:', error)
    return NextResponse.json(
      { error: 'Errore nel trovare sostituzioni' },
      { status: 500 }
    )
  }
}
