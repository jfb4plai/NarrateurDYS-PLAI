import { NextRequest, NextResponse } from 'next/server'

const MAX_CHARS = 3000

// Voice per language — chosen for clarity (DYS)
const LANG_VOICES: Record<string, { voice: string; engine: string }> = {
  fr:   { voice: 'fr-FR-DeniseNeural',   engine: 'edge-tts' },
  fr_BE:{ voice: 'fr-BE-CharlineNeural', engine: 'edge-tts' },
  nl:   { voice: 'nl-BE-DenaNeural',     engine: 'edge-tts' },
  nl_NL:{ voice: 'nl-NL-ColetteNeural', engine: 'edge-tts' },
  de:   { voice: 'de-DE-KatjaNeural',    engine: 'edge-tts' },
  en:   { voice: 'en-GB-SoniaNeural',    engine: 'edge-tts' },
  es:   { voice: 'es-ES-ElviraNeural',   engine: 'edge-tts' },
  it:   { voice: 'it-IT-ElsaNeural',     engine: 'edge-tts' },
}

export async function POST(req: NextRequest) {
  const hfUrl = process.env.NEXT_PUBLIC_HF_SPACE_URL
  if (!hfUrl) return NextResponse.json({ error: 'HF_SPACE_URL non configuré.' }, { status: 500 })

  const { text, lang = 'fr', silenceMs = 600 } = await req.json()

  if (!text?.trim()) return NextResponse.json({ error: 'Texte manquant.' }, { status: 400 })
  if (text.length > MAX_CHARS) return NextResponse.json({ error: `Texte trop long (max ${MAX_CHARS} caractères).` }, { status: 400 })

  const langConfig = LANG_VOICES[lang] ?? LANG_VOICES['fr']

  // Split into paragraphs, format as A: lines
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p: string) => p.replace(/\n/g, ' ').trim())
    .filter((p: string) => p.length > 0)

  // Fallback: if no double newlines, split by sentence (every 2 sentences)
  const lines =
    paragraphs.length > 1
      ? paragraphs
      : text.match(/[^.!?]+[.!?]+/g)?.reduce((acc: string[], s: string, i: number) => {
          if (i % 2 === 0) acc.push(s.trim())
          else acc[acc.length - 1] += ' ' + s.trim()
          return acc
        }, []) ?? [text.trim()]

  const script = lines.map((l: string) => `A: ${l}`).join('\n')

  const body = {
    script,
    speakers: [{ label: 'A', voice: langConfig.voice, color: '#0a9370', engine: langConfig.engine }],
    silence_ms: silenceMs,
    language: lang,
    upload_to_archive: false,
  }

  try {
    const res = await fetch(`${hfUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PLAI-Secret': process.env.HF_SPACE_SECRET ?? '',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Serveur TTS inaccessible.' }, { status: 502 })
  }
}
