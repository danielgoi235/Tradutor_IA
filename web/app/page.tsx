'use client'

import { useState, useEffect } from 'react'
import CreateRoomForm from '@/components/CreateRoomForm'

type Language = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE'
type AppState = 'create-room' | 'waiting-guest' | 'active-call'

const LANGUAGES = {
  'pt-BR': '🇧🇷 Português (Brasil)',
  'en-US': '🇺🇸 English',
  'es-ES': '🇪🇸 Español',
  'fr-FR': '🇫🇷 Français',
  'de-DE': '🇩🇪 Deutsch',
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('create-room')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [language, setLanguage] = useState<Language>('pt-BR')

  // Initialize Firebase (client-side only)
  useEffect(() => {
    // Firebase initialization happens in components that need it
    console.log('🚀 App initialized - WebRTC P2P architecture')
  }, [])

  const handleRoomCreated = (newRoomId: string) => {
    setRoomId(newRoomId)
    setAppState('waiting-guest')
    console.log('✅ Room created:', newRoomId)
  }

  // Show CreateRoomForm on initial state
  if (appState === 'create-room') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <CreateRoomForm onRoomCreated={handleRoomCreated} />
      </div>
    )
  }

  // Waiting for guest to join
  if (appState === 'waiting-guest' && roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-3">
            <div className="text-5xl">👥</div>
            <h2 className="text-2xl font-bold text-white">Aguardando Convidado</h2>
            <p className="text-blue-200">Código: <span className="font-mono font-bold text-lg">{roomId}</span></p>
          </div>

          <div className="bg-blue-950 p-6 rounded-lg border border-blue-600 space-y-4">
            <p className="text-blue-200 text-sm">📱 Compartilhe este código com quem deseja conversar</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId)
                console.log('✅ Código copiado:', roomId)
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              📋 Copiar Código
            </button>
          </div>

          <div className="text-sm text-blue-300 animate-pulse">
            ⏳ Conectando... aguarde o convidado
          </div>

          <button
            onClick={() => {
              setAppState('create-room')
              setRoomId(null)
            }}
            className="w-full text-gray-400 hover:text-white transition py-2"
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  // Active call state (TODO: implement in future tasks)
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <p className="text-white">📞 Chamada ativa</p>
        <p className="text-sm text-gray-400 mt-2">(Em desenvolvimento - Tarefas 3-6)</p>
      </div>
    </div>
  )
}
