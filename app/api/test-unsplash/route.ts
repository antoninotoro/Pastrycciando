import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!unsplashAccessKey) {
      return NextResponse.json({ error: 'API key non configurata' }, { status: 500 })
    }

    // Test con una ricerca semplice
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=chocolate cake pastry&per_page=1`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashAccessKey}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        error: 'Errore Unsplash API',
        status: response.status,
        message: data
      }, { status: response.status })
    }

    if (data.results && data.results.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'API Unsplash funziona!',
        testImage: data.results[0].urls.regular,
        photographer: data.results[0].user.name,
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Nessun risultato trovato',
      data
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Errore nella chiamata',
      details: String(error)
    }, { status: 500 })
  }
}
