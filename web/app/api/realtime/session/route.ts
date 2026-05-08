import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const LANGUAGE_NAMES: Record<string, string> = {
  'pt-BR': 'Portuguese from Brazil',
  'en-US': 'English from the United States',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'de-DE': 'German',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'zh-CN': 'Mandarin Chinese',
}

const INPUT_LANGUAGE_CODES: Record<string, string> = {
  'pt-BR': 'pt',
  'en-US': 'en',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'it-IT': 'it',
  'ja-JP': 'ja',
  'zh-CN': 'zh',
}

function buildInstructions(sourceLanguage: string, targetLanguage: string) {
  const source = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage
  const target = LANGUAGE_NAMES[targetLanguage] || targetLanguage

  return [
    `You are a real-time speech interpreter.`,
    `The user speaks ${source}.`,
    `Translate everything the user says into ${target}.`,
    `Reply only with the translated speech. Do not explain, greet, answer questions, or add commentary.`,
    `Preserve meaning, tone, names, numbers, and short pauses naturally.`,
    `If the user says a fragment, translate the fragment naturally instead of waiting for a perfect sentence.`,
  ].join(' ')
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY nao foi configurada no ambiente.' },
      { status: 500 }
    )
  }

  const sdp = await request.text()

  if (!sdp.trim()) {
    return NextResponse.json({ error: 'SDP offer vazio.' }, { status: 400 })
  }

  const sourceLanguage = request.nextUrl.searchParams.get('source') || 'pt-BR'
  const targetLanguage = request.nextUrl.searchParams.get('target') || 'en-US'
  const voice = request.nextUrl.searchParams.get('voice') || 'marin'
  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-translate'
  const inputLanguage = INPUT_LANGUAGE_CODES[sourceLanguage] || sourceLanguage.split('-')[0]

  const formData = new FormData()
  formData.set('sdp', sdp)
  formData.set(
    'session',
    JSON.stringify({
      type: 'realtime',
      model,
      instructions: buildInstructions(sourceLanguage, targetLanguage),
      audio: {
        output: { voice },
        input: {
          transcription: {
            model: 'gpt-4o-mini-transcribe',
            language: inputLanguage,
          },
          turn_detection: {
            type: 'semantic_vad',
          },
        },
      },
    })
  )

  const primaryEndpoint =
    process.env.OPENAI_REALTIME_ENDPOINT || 'https://api.openai.com/v1/realtime/translations'

  let response = await fetch(primaryEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok && primaryEndpoint.endsWith('/realtime/translations')) {
    response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })
  }

  const body = await response.text()

  if (!response.ok) {
    return NextResponse.json(
      {
        error: 'Falha ao criar sessao Realtime na OpenAI.',
        details: body,
      },
      { status: response.status }
    )
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/sdp',
    },
  })
}
