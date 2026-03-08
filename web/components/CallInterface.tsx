'use client'

import { useState } from 'react'
import { Phone, PhoneOff, Mic, MicOff, ChevronLeft, Volume2 } from 'lucide-react'
import axios from 'axios'

interface CallState {
  sessionId: string | null
  callSid: string | null
  isActive: boolean
  participant1: {
    number: string
    name: string
    language: string
    isRecording: boolean
  }
  participant2: {
    number: string
    name: string
    language: string
    isRecording: boolean
  }
  duration: number
  stats: {
    translations: number
    latency: number
    errors: number
  }
}

const INITIAL_STATE: CallState = {
  sessionId: null,
  callSid: null,
  isActive: false,
  participant1: {
    number: '+55',
    name: 'Você',
    language: 'pt-BR',
    isRecording: false,
  },
  participant2: {
    number: '+1',
    name: 'Contato',
    language: 'en-US',
    isRecording: false,
  },
  duration: 0,
  stats: {
    translations: 0,
    latency: 0,
    errors: 0,
  },
}

export default function CallInterface({ onBack }: { onBack: () => void }) {
  const [callState, setCallState] = useState<CallState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInitiateCall = async () => {
    try {
      setLoading(true)
      setError('')

      if (!callState.participant1.number || !callState.participant2.number) {
        setError('Preencha ambos os números de telefone')
        return
      }

      // Chamar API para iniciar chamada
      const response = await axios.post('/api/bidirectional/initiate', {
        participant1Number: callState.participant1.number,
        participant2Number: callState.participant2.number,
        participant1Name: callState.participant1.name,
        participant2Name: callState.participant2.name,
      })

      const { sessionId, callSid } = response.data.data

      setCallState((prev) => ({
        ...prev,
        sessionId,
        callSid,
        isActive: true,
      }))

      // Simulação de estatísticas
      startStatsMonitoring(sessionId)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao iniciar chamada')
    } finally {
      setLoading(false)
    }
  }

  const handleEndCall = async () => {
    try {
      setLoading(true)

      if (callState.sessionId) {
        await axios.post(`/api/bidirectional/call/${callState.sessionId}/complete`)
      }

      setCallState(INITIAL_STATE)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao desligar')
    } finally {
      setLoading(false)
    }
  }

  const startStatsMonitoring = (sessionId: string) => {
    const interval = setInterval(() => {
      setCallState((prev) => ({
        ...prev,
        duration: prev.duration + 1,
        stats: {
          translations: prev.stats.translations + Math.floor(Math.random() * 2),
          latency: Math.floor(Math.random() * 500) + 800,
          errors: prev.stats.errors,
        },
      }))
    }, 1000)

    return () => clearInterval(interval)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (callState.isActive) {
    return (
      <div className="p-4 space-y-6">
        {/* Timer */}
        <div className="text-center pt-8">
          <div className="text-5xl font-bold text-cyan-400 font-mono">
            {formatDuration(callState.duration)}
          </div>
          <p className="text-slate-400 mt-2">Duração da chamada</p>
        </div>

        {/* Participants */}
        <div className="space-y-4">
          <ParticipantCard
            name={callState.participant1.name}
            number={callState.participant1.number}
            language={callState.participant1.language}
            isRecording={callState.participant1.isRecording}
            isSelf={true}
          />
          <div className="flex justify-center">
            <div className="text-2xl">↔️</div>
          </div>
          <ParticipantCard
            name={callState.participant2.name}
            number={callState.participant2.number}
            language={callState.participant2.language}
            isRecording={callState.participant2.isRecording}
            isSelf={false}
          />
        </div>

        {/* Stats */}
        <div className="card grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{callState.stats.translations}</div>
            <div className="text-xs text-slate-400">Traduções</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{callState.stats.latency}ms</div>
            <div className="text-xs text-slate-400">Latência</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{callState.stats.errors}</div>
            <div className="text-xs text-slate-400">Erros</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button className="btn-secondary p-4 rounded-full">
            <Mic size={24} />
          </button>
          <button
            onClick={handleEndCall}
            disabled={loading}
            className="btn-danger p-4 rounded-full"
          >
            <PhoneOff size={24} />
          </button>
          <button className="btn-secondary p-4 rounded-full">
            <Volume2 size={24} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Input Fields */}
      <div className="card space-y-4 mt-6">
        <h2 className="font-bold">👤 Participante 1 (Você)</h2>
        <input
          type="tel"
          placeholder="Seu número (+55...)"
          value={callState.participant1.number}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant1: { ...prev.participant1, number: e.target.value },
            }))
          }
          className="input-field"
        />
        <input
          type="text"
          placeholder="Seu nome"
          value={callState.participant1.name}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant1: { ...prev.participant1, name: e.target.value },
            }))
          }
          className="input-field"
        />
        <select
          value={callState.participant1.language}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant1: { ...prev.participant1, language: e.target.value },
            }))
          }
          className="input-field"
        >
          <option value="pt-BR">🇧🇷 Português (Brasil)</option>
          <option value="en-US">🇺🇸 Inglês (EUA)</option>
          <option value="es-ES">🇪🇸 Espanhol</option>
          <option value="fr-FR">🇫🇷 Francês</option>
          <option value="de-DE">🇩🇪 Alemão</option>
          <option value="it-IT">🇮🇹 Italiano</option>
        </select>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">👥 Participante 2 (Contato)</h2>
        <input
          type="tel"
          placeholder="Número do contato (+1...)"
          value={callState.participant2.number}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant2: { ...prev.participant2, number: e.target.value },
            }))
          }
          className="input-field"
        />
        <input
          type="text"
          placeholder="Nome do contato"
          value={callState.participant2.name}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant2: { ...prev.participant2, name: e.target.value },
            }))
          }
          className="input-field"
        />
        <select
          value={callState.participant2.language}
          onChange={(e) =>
            setCallState((prev) => ({
              ...prev,
              participant2: { ...prev.participant2, language: e.target.value },
            }))
          }
          className="input-field"
        >
          <option value="en-US">🇺🇸 Inglês (EUA)</option>
          <option value="pt-BR">🇧🇷 Português (Brasil)</option>
          <option value="es-ES">🇪🇸 Espanhol</option>
          <option value="fr-FR">🇫🇷 Francês</option>
          <option value="de-DE">🇩🇪 Alemão</option>
          <option value="it-IT">🇮🇹 Italiano</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-500/20 border border-red-500 text-red-200">
          {error}
        </div>
      )}

      {/* Call Button */}
      <button
        onClick={handleInitiateCall}
        disabled={loading}
        className="w-full btn-primary py-4 text-lg font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Phone size={24} />
        {loading ? 'Conectando...' : 'Iniciar Chamada'}
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full btn-secondary py-3 rounded-lg flex items-center justify-center gap-2"
      >
        <ChevronLeft size={20} />
        Voltar
      </button>
    </div>
  )
}

function ParticipantCard({
  name,
  number,
  language,
  isRecording,
  isSelf,
}: {
  name: string
  number: string
  language: string
  isRecording: boolean
  isSelf: boolean
}) {
  const languageEmoji: { [key: string]: string } = {
    'pt-BR': '🇧🇷',
    'en-US': '🇺🇸',
    'es-ES': '🇪🇸',
    'fr-FR': '🇫🇷',
    'de-DE': '🇩🇪',
    'it-IT': '🇮🇹',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-slate-400 text-sm">{number}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl">{languageEmoji[language] || '🌐'}</div>
          <div className="text-xs text-slate-400 mt-1">{language}</div>
        </div>
      </div>
      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Gravando...</span>
        </div>
      )}
    </div>
  )
}
