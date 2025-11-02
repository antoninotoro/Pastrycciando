import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, nome, image_url')
      .limit(5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const stats = {
      total: recipes?.length || 0,
      withImages: recipes?.filter(r => r.image_url).length || 0,
      withoutImages: recipes?.filter(r => !r.image_url).length || 0,
      recipes: recipes?.map(r => ({
        nome: r.nome,
        hasImage: !!r.image_url,
        imageUrl: r.image_url?.substring(0, 100) + (r.image_url && r.image_url.length > 100 ? '...' : ''),
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
