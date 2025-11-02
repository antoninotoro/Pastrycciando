import { NextResponse } from 'next/server'

// Mappa di categorie con immagini CURATE MANUALMENTE e verificate
const categoryImages: { [key: string]: string } = {
  // CREME - Immagini verificate di creme vere
  'crema pasticcera': 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=800',
  'crema inglese': 'https://images.pexels.com/photos/7474083/pexels-photo-7474083.jpeg?auto=compress&cs=tinysrgb&w=800',
  'crema chantilly': 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=800',
  'panna': 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=800',
  'crema': 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=800',
  'bavarese': 'https://images.pexels.com/photos/3776942/pexels-photo-3776942.jpeg?auto=compress&cs=tinysrgb&w=800',
  'mousse': 'https://images.pexels.com/photos/3776942/pexels-photo-3776942.jpeg?auto=compress&cs=tinysrgb&w=800',

  // CIOCCOLATO - Immagini di cioccolato/ganache
  'cioccolato': 'https://images.pexels.com/photos/4110351/pexels-photo-4110351.jpeg?auto=compress&cs=tinysrgb&w=800',
  'chocolate': 'https://images.pexels.com/photos/4110351/pexels-photo-4110351.jpeg?auto=compress&cs=tinysrgb&w=800',
  'ganache': 'https://images.pexels.com/photos/4110351/pexels-photo-4110351.jpeg?auto=compress&cs=tinysrgb&w=800',

  // TORTE - Immagini di torte
  'torta': 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cake': 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=800',
  'pan di spagna': 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=800',
  'sponge': 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=800',

  // CROSTATE - Immagini di crostate/tart
  'crostata': 'https://images.pexels.com/photos/6607/food-dessert-cake-sweet.jpg?auto=compress&cs=tinysrgb&w=800',
  'tart': 'https://images.pexels.com/photos/6607/food-dessert-cake-sweet.jpg?auto=compress&cs=tinysrgb&w=800',

  // BISCOTTI - Immagini di biscotti
  'biscotti': 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cookie': 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=800',

  // MUFFIN/CUPCAKE - Immagini di muffin
  'muffin': 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cupcake': 'https://images.pexels.com/photos/913136/pexels-photo-913136.jpeg?auto=compress&cs=tinysrgb&w=800',

  // IMPASTI/PASTE - Immagini di impasti e pasta frolla
  'pasta frolla': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',
  'pasta sfoglia': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',
  'frolla': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',
  'sfoglia': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',
  'impasto': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',
  'pasta': 'https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=800',

  // PANE E LIEVITATI - Immagini di pane e croissant
  'pane': 'https://images.pexels.com/photos/209887/pexels-photo-209887.jpeg?auto=compress&cs=tinysrgb&w=800',
  'brioche': 'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cornetto': 'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=800',
  'croissant': 'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=800',

  // DEFAULT - Pasticceria generica bellissima
  'default': 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=800'
}

// Funzione per determinare la categoria dalla query
function getCategoryImage(query: string): string {
  const queryLower = query.toLowerCase()

  // Cerca una corrispondenza nelle categorie
  for (const [category, imageUrl] of Object.entries(categoryImages)) {
    if (queryLower.includes(category)) {
      return imageUrl
    }
  }

  // Se non trova nulla, usa l'immagine default
  return categoryImages['default']
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query di ricerca obbligatoria' },
        { status: 400 }
      )
    }

    // Usa sempre le immagini categorizzate che sono più pertinenti
    // (l'API di Unsplash può essere riattivata in futuro se necessario)
    console.log(`Cercando immagine categorizzata per: ${query}`)
    return NextResponse.json({
      imageUrl: getCategoryImage(query)
    })

  } catch (error) {
    console.error('Errore nella ricerca immagini:', error)
    return NextResponse.json(
      { error: 'Errore nella ricerca immagini' },
      { status: 500 }
    )
  }
}
