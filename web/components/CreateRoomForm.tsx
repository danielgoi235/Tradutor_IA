'use client'

import { useState, useEffect } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { generateRoomId } from '@/lib/roomId'
import { createRoom, saveOffer, addIceCandidate } from '@/lib/firestore'
import { getPeerManager, resetPeerManager } from '@/lib/webrtc'

const LANGUAGES = {
  'pt-BR': '🇧🇷 Português (Brasil)',
  'en-US': '🇺🇸 English',
  'es-ES': '🇪🇸 Español',
  'fr-FR': '🇫🇷 Français',
  'de-DE': '🇩🇪 Deutsch',
}

interface CreateRoomFormProps {
  onRoomCreated?: (roomId: string) => void
}

export default function CreateRoomForm({ onRoomCreated }: CreateRoomFormProps) {
  const [username, setUsername] = useState('')
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>('pt-BR')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Limpar recursos WebRTC ao desmontar ou voltar para formulário
  useEffect(() => {
    return () => {
      if (!roomId) {
        resetPeerManager()
      }
    }
  }, [roomId])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!username.trim()) {
      setError('Nome de usuário é obrigatório')
      return
    }

    if (!language) {
      setError('Selecione um idioma')
      return
    }

    setLoading(true)

    try {
      // 1. Gerar ID único da sala (8 caracteres)
      const newRoomId = generateRoomId()
      console.log(`🎤 Criando sala ${newRoomId} para ${username}`)

      // 2. Criar sala em Firestore
      await createRoom(newRoomId, username, language)
      console.log(`✅ Sala criada em Firestore: ${newRoomId}`)

      // 3. Iniciar WebRTC Peer Connection
      const peerManager = getPeerManager()
      const offer = await peerManager.createPeerConnection(newRoomId, username)
      console.log(`✅ WebRTC iniciado, offer gerado`)

      // 4. Salvar SDP Offer em Firestore
      await saveOffer(newRoomId, offer)
      console.log(`✅ Offer salvo em Firestore`)

      // 5. Configurar listener para ICE candidates
      window.addEventListener('ice-candidate', async (event: any) => {
        const { roomId, candidate } = event.detail
        if (roomId === newRoomId) {
          try {
            await addIceCandidate(roomId, candidate)
          } catch (err) {
            console.warn('Erro ao salvar ICE candidate:', err)
          }
        }
      })

      setRoomId(newRoomId)
      console.log(`🎉 Sala pronta para convidado: ${newRoomId}`)

      // 6. Callback para notificar página principal
      onRoomCreated?.(newRoomId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sala')
      console.error('❌ Erro:', err)
      resetPeerManager()
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Se sala foi criada, mostrar código
  if (roomId) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg shadow-xl">
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-white">Sala Criada!</h2>

          <div className="bg-blue-950 p-4 rounded-lg border border-blue-600">
            <p className="text-sm text-blue-200 mb-2">Código da Sala:</p>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">
              {roomId}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Copy size={18} />
              {copied ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>

          <div className="bg-blue-950 p-3 rounded border border-blue-600">
            <p className="text-sm text-blue-200">
              🎵 Seu idioma: <span className="font-bold">{LANGUAGES[language]}</span>
            </p>
            <p className="text-sm text-blue-200">
              👤 Seu nome: <span className="font-bold">{username}</span>
            </p>
          </div>

          <p className="text-sm text-blue-300 bg-blue-950 p-3 rounded">
            ⏳ Aguardando convidado... (Compartilhe o código acima)
          </p>

          <button
            onClick={() => {
              resetPeerManager()
              setRoomId(null)
              setUsername('')
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  // Formulário de criação
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🎤 Criar Nova Sala
      </h2>

      <form onSubmit={handleCreateRoom} className="space-y-4">
        {/* Nome do Usuário */}
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Seu Nome:
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: João"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-950 border border-blue-600 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
        </div>

        {/* Seletor de Idioma */}
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-2">
            Seu Idioma (para transcrição):
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as keyof typeof LANGUAGES)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-950 border border-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code} className="bg-blue-900">
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg">
            <p className="text-sm">❌ {error}</p>
          </div>
        )}

        {/* Botão Criar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Criando sala...
            </>
          ) : (
            '✨ Criar Sala'
          )}
        </button>

        <p className="text-xs text-blue-300 text-center">
          Um código único será gerado para compartilhar
        </p>
      </form>
    </div>
  )
}

