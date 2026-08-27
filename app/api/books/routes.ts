import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, COVERS_BUCKET } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = supabaseAdmin()
    if (!db) return NextResponse.json({ ok: false, error: 'No Supabase keys in.env.local' }, { status: 500 })

    let coverUrl = body.cover_url || null
    if (coverUrl?.startsWith('data:')) {
      const b64 = coverUrl.split(',')[1]
      const buf = Buffer.from(b64, 'base64')
      const name = `${body.slug}-${Date.now()}.webp`
      const { error: upErr } = await db.storage.from(COVERS_BUCKET).upload(name, buf, { contentType: 'image/webp', upsert: true })
      if (!upErr) {
        const { data } = db.storage.from(COVERS_BUCKET).getPublicUrl(name)
        coverUrl = data.publicUrl
      }
    }

    const { data, error } = await db.from('books').upsert({
      title: body.title,
      slug: body.slug,
      trail_name: body.trail_name || 'ember',
      level: body.level || 'seed',
      source_text: body.source_text,
      cover_url: coverUrl,
    }, { onConflict: 'slug' }).select()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) { return POST(req) }