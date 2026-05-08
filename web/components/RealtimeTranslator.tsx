'use client'

import { useEffect, useRef, useState } from 'react'

const LANGUAGES = [
  { code: 'pt-BR', label: 'Portugues (Brasil)' },
  { code: 'en-US', label: 'English (EUA)' },
  { code: 'es-ES', label: 'Espanol' },
  { code: 'fr-FR', label: 'Francais' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'ja-JP', label: 'Japones' },
  { code: 'zh-CN', label: 'Chines Mandarin' },
]

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

type EventLog = {
  id: string
  label: string
  detail: string
}

type Caption = {
  id: string
  role: 'original' | 'translated'
  text: string
  final: boolean
}

export default function RealtimeTranslator() {
  const [sourceLanguage, setSourceLanguage] = useState('pt-BR')
  const [targetLanguage, setTargetLanguage] = useState('en-US')
  const [state, setState] = useState<ConnectionState>('idle')
  const [error, setError] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [events, setEvents] = useState<EventLog[]>([])
  const [captions, setCaptions] = useState<Caption[]>([])

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const originalCaptionRef = useRef<Record<string, string>>({})
  const translatedCaptionRef = useRef<Record<string, string>>({})

  useEffect(() => {
    return () => stopSession()
  }, [])

  const addEvent = (label: string, detail: string) => {
    setEvents((current) =>
      [
        {
          id: `${Date.now()}-${Math.random()}`,
          label,
          detail,
        },
        ...current,
      ].slice(0, 8)
    )
  }

  const upsertCaption = (caption: Caption) => {
    setCaptions((current) => {
      const existing = current.findIndex((item) => item.id === caption.id)
      if (existing >= 0) {
        const next = [...current]
        next[existing] = caption
        return next.slice(-12)
      }

      return [...current, caption].slice(-12)
    })
  }

  const handleRealtimeEvent = (message: any) => {
    if (!message?.type) return

    if (message.type === 'conversation.item.input_audio_transcription.delta') {
      const id = `original-${message.item_id || 'live'}`
      originalCaptionRef.current[id] = `${originalCaptionRef.current[id] || ''}${message.delta || ''}`
      upsertCaption({
        id,
        role: 'original',
        text: originalCaptionRef.current[id],
        final: false,
      })
      return
    }

    if (message.type === 'conversation.item.input_audio_transcription.completed') {
      const id = `original-${message.item_id || Date.now()}`
      upsertCaption({
        id,
        role: 'original',
        text: message.transcript || originalCaptionRef.current[id] || '',
        final: true,
      })
      return
    }

    if (
      message.type === 'response.output_audio_transcript.delta' ||
      message.type === 'response.audio_transcript.delta'
    ) {
      const id = `translated-${message.item_id || message.response_id || 'live'}`
      translatedCaptionRef.current[id] = `${translatedCaptionRef.current[id] || ''}${message.delta || ''}`
      upsertCaption({
        id,
        role: 'translated',
        text: translatedCaptionRef.current[id],
        final: false,
      })
      return
    }

    if (
      message.type === 'response.output_audio_transcript.done' ||
      message.type === 'response.audio_transcript.done'
    ) {
      const id = `translated-${message.item_id || message.response_id || Date.now()}`
      upsertCaption({
        id,
        role: 'translated',
        text: message.transcript || translatedCaptionRef.current[id] || '',
        final: true,
      })
      return
    }

    if (message.type === 'error') {
      setError(message.error?.message || 'Erro recebido da OpenAI Realtime.')
      addEvent('OpenAI erro', message.error?.type || 'erro')
      return
    }

    if (
      message.type === 'session.created' ||
      message.type === 'input_audio_buffer.speech_started' ||
      message.type === 'input_audio_buffer.speech_stopped' ||
      message.type === 'response.done'
    ) {
      addEvent('OpenAI', message.type)
    }
  }

  const startSession = async () => {
    setError('')
    setState('connecting')
    setCaptions([])
    originalCaptionRef.current = {}
    translatedCaptionRef.current = {}
    addEvent('Conectando', 'Pedindo acesso ao microfone.')

    try {
      const peerConnection = new RTCPeerConnection()
      peerConnectionRef.current = peerConnection

      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioRef.current = audioElement

      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0]
        addEvent('Audio recebido', 'A traducao por voz chegou no navegador.')
      }

      peerConnection.onconnectionstatechange = () => {
        const connectionState = peerConnection.connectionState
        addEvent('WebRTC', connectionState)

        if (connectionState === 'connected') {
          setState('connected')
        }

        if (connectionState === 'failed' || connectionState === 'disconnected') {
          setState('error')
          setError('A conexao de audio caiu. Tente iniciar novamente.')
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      localStreamRef.current = stream
      stream.getAudioTracks().forEach((track) => peerConnection.addTrack(track, stream))

      const dataChannel = peerConnection.createDataChannel('oai-events')
      dataChannel.onopen = () => addEvent('Sessao pronta', 'Fale em voz alta para testar.')
      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleRealtimeEvent(message)
        } catch {
          addEvent('OpenAI', 'Evento recebido.')
        }
      }

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      const response = await fetch(
        `/api/realtime/session?source=${sourceLanguage}&target=${targetLanguage}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      )

      if (!response.ok) {
        const details = await response.text()
        throw new Error(details || 'Nao foi possivel criar a sessao Realtime.')
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await response.text(),
      }

      await peerConnection.setRemoteDescription(answer)
      addEvent('OpenAI Realtime', 'Sessao criada com sucesso.')
    } catch (err) {
      stopSession()
      setState('error')
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao iniciar.')
    }
  }

  const stopSession = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null

    peerConnectionRef.current?.close()
    peerConnectionRef.current = null

    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current = null
    }

    setIsMuted(false)
    setState('idle')
  }

  const toggleMute = () => {
    const nextMuted = !isMuted
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
    addEvent(nextMuted ? 'Microfone pausado' : 'Microfone ativo', 'Controle local alterado.')
  }

  const isActive = state === 'connecting' || state === 'connected'

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500 text-slate-950">
              <span className="text-lg font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tradutor de Voz em Tempo Real</h1>
              <p className="text-sm text-blue-100">
                Fale em um idioma e ouca a traducao com voz natural.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-lg border border-white/15 bg-slate-950/50 p-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-blue-100">
            Eu vou falar
            <select
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              disabled={isActive}
              className="input-field"
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-blue-100">
            Quero ouvir em
            <select
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value)}
              disabled={isActive}
              className="input-field"
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-lg border border-white/15 bg-slate-950/50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase text-blue-200">Status</p>
              <p className="text-3xl font-bold">
                {state === 'idle' && 'Pronto'}
                {state === 'connecting' && 'Conectando...'}
                {state === 'connected' && 'Ao vivo'}
                {state === 'error' && 'Precisa de atencao'}
              </p>
            </div>

            <div className="flex gap-3">
              {!isActive ? (
                <button
                  onClick={startSession}
                  className="btn-primary flex items-center gap-2"
                >
                  Iniciar
                </button>
              ) : (
                <>
                  <button onClick={toggleMute} className="btn-secondary flex items-center gap-2">
                    {isMuted ? 'Ativar' : 'Mutar'}
                  </button>
                  <button onClick={stopSession} className="btn-danger flex items-center gap-2">
                    Encerrar
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-400 bg-red-950/60 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/15 bg-slate-950/50 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-blue-200">Legendas ao vivo</h2>
          {captions.length === 0 ? (
            <p className="text-sm text-slate-300">
              Quando voce falar, a transcricao e a traducao aparecem aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="rounded-lg border border-white/10 bg-slate-900/80 p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-cyan-200">
                      {caption.role === 'original' ? 'Original' : 'Traducao'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {caption.final ? 'final' : 'ao vivo'}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-white">{caption.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/15 bg-slate-950/50 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase text-blue-200">Eventos recentes</h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-300">Os eventos da chamada aparecem aqui.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg bg-slate-900/80 p-3">
                  <p className="font-semibold text-white">{event.label}</p>
                  <p className="text-sm text-slate-300">{event.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
