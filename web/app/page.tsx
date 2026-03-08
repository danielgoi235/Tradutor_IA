'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Copy, Send, LogOut, Users, CheckCircle } from 'lucide-react'

type Language = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE'
type AppState = 'login' | 'create' | 'join' | 'waiting' | 'chat'

const LANGUAGES = {
  'pt-BR': '🇧🇷 Português',
  'en-US': '🇺🇸 English',
  'es-ES': '🇪🇸 Español',
  'fr-FR': '🇫🇷 Français',
  'de-DE': '🇩🇪 Deutsch',
}

interface ChatMessage {
  id: string
  sender: string
  senderLanguage: string
  originalText: string
  translatedText: string
  receiverLanguage: string
  timestamp: number
}

interface RemoteUser {
  id: string
  username: string
  language: Language
  connected?: boolean
}

export default function Home() {
  // Socket connection
  const socketRef = useRef<Socket | null>(null)

  // State
  const [appState, setAppState] = useState<AppState>('login')
  const [username, setUsername] = useState('')
  const [yourLanguage, setYourLanguage] = useState<Language>('pt-BR')
  const [sessionId, setSessionId] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null)
  const [connectionConfirmed, setConnectionConfirmed] = useState(false)
  const [bothReady, setBothReady] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize Socket.io
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server')
      setError('')
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setError('Conexão perdida. Reconectando...')
    })

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      setError('Erro ao conectar ao servidor')
    })

    // Session events
    socket.on('user_joined', (data) => {
      console.log('User joined:', data)
      setError('')
      if (data.users.length === 2) {
        const other = data.users.find((u: RemoteUser) => u.id !== socket.id)
        if (other) {
          setRemoteUser(other)
          setAppState('waiting')
        }
      }
    })

    socket.on('connection_status', (data) => {
      console.log('Connection status:', data)
      // Mostrar que o outro usuário confirmou
      if (data.allConfirmed) {
        setConnectionConfirmed(true)
      }
    })

    socket.on('both_ready', (data) => {
      console.log('Both ready:', data)
      setBothReady(true)
      setAppState('chat')
    })

    socket.on('user_disconnected', () => {
      console.log('User disconnected')
      setError('Outro usuário desconectou')
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    })

    // Message events
    socket.on('message_received', (message: ChatMessage) => {
      console.log('Message received:', message)
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // =========================================================================
  // CREATE SESSION
  // =========================================================================
  const handleCreateSession = () => {
    if (!username.trim()) {
      setError('Digite seu nome')
      return
    }

    setLoading(true)
    socketRef.current?.emit('create_session', { username, language: yourLanguage }, (response: any) => {
      setLoading(false)
      if (response.success) {
        setSessionId(response.sessionId)
        setAppState('waiting')
        setError('')
      } else {
        setError(response.error || 'Erro ao criar sessão')
      }
    })
  }

  // =========================================================================
  // JOIN SESSION
  // =========================================================================
  const handleJoinSession = () => {
    if (!username.trim()) {
      setError('Digite seu nome')
      return
    }
    if (!joinCode.trim() || joinCode.length < 5) {
      setError('Digite um código válido')
      return
    }

    setLoading(true)
    socketRef.current?.emit(
      'join_session',
      { sessionId: joinCode.toUpperCase(), username, language: yourLanguage },
      (response: any) => {
        setLoading(false)
        if (response.success) {
          setSessionId(response.sessionId)
          // Encontrar o outro usuário
          if (response.users.length === 2) {
            const other = response.users.find((u: RemoteUser) => u.username !== username)
            if (other) {
              setRemoteUser(other)
            }
          }
          setAppState('waiting')
          setError('')
        } else {
          setError(response.error || 'Erro ao entrar na sessão')
        }
      }
    )
  }

  // =========================================================================
  // CONFIRM CONNECTION
  // =========================================================================
  const handleConfirmConnection = () => {
    socketRef.current?.emit('confirm_connection', (response: any) => {
      if (response.success) {
        setConnectionConfirmed(true)
        if (response.allConfirmed) {
          setBothReady(true)
          setAppState('chat')
        }
      } else {
        setError(response.error || 'Erro ao confirmar conexão')
      }
    })
  }

  // =========================================================================
  // SEND MESSAGE
  // =========================================================================
  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    setLoading(true)
    socketRef.current?.emit('send_message', { text: messageInput }, (response: any) => {
      setLoading(false)
      if (response.success) {
        setMessageInput('')
      } else {
        setError(response.error || 'Erro ao enviar mensagem')
      }
    })
  }

  // =========================================================================
  // DISCONNECT
  // =========================================================================
  const handleDisconnect = () => {
    socketRef.current?.disconnect()
    setAppState('login')
    setSessionId('')
    setMessages([])
    setRemoteUser(null)
    setConnectionConfirmed(false)
    setBothReady(false)
  }

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (appState === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🌐</div>
            <h1 className="text-4xl font-bold text-white mb-2">Tradutor IA Chat</h1>
            <p className="text-blue-200">Conversa sem barreiras de idioma</p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-white font-semibold mb-2">Seu Nome</label>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-600 text-white px-4 py-3 rounded-lg border border-slate-500 focus:border-blue-400 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Seu Idioma</label>
              <select
                value={yourLanguage}
                onChange={(e) => setYourLanguage(e.target.value as Language)}
                className="w-full bg-slate-600 text-white px-4 py-3 rounded-lg border border-slate-500"
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">{error}</div>}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setAppState('create')}
              disabled={!username.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              ➕ Criar Nova Conversa
            </button>

            <button
              onClick={() => setAppState('join')}
              disabled={!username.trim() || loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              🔑 Entrar em Conversa
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // CREATE SESSION SCREEN
  // =========================================================================
  if (appState === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🎟️</div>
            <h1 className="text-3xl font-bold text-white mb-2">Seu Código</h1>
          </div>

          {!sessionId ? (
            <>
              <p className="text-blue-200 text-center">Clique para gerar um código único e compartilhe com alguém</p>
              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-6 px-6 rounded-lg text-lg transition"
              >
                {loading ? '⏳ Gerando...' : '✨ Gerar Código'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-6 text-center border-2 border-green-500">
                <p className="text-blue-200 text-sm mb-3">Compartilhe este código:</p>
                <p className="text-4xl font-bold text-white font-mono tracking-widest mb-3">{sessionId}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sessionId)
                    setError('✅ Código copiado!')
                    setTimeout(() => setError(''), 2000)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Copy size={18} />
                  Copiar Código
                </button>
              </div>

              <p className="text-blue-200 text-center text-sm">⏳ Aguardando o outro participante...</p>
            </div>
          )}

          <button
            onClick={() => {
              setAppState('login')
              setSessionId('')
              handleDisconnect()
            }}
            className="w-full text-gray-300 hover:text-white transition py-2"
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // JOIN SESSION SCREEN
  // =========================================================================
  if (appState === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">Entrar em Conversa</h1>
          </div>

          <div>
            <input
              type="text"
              placeholder="Cole o código aqui"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg text-lg font-mono text-center tracking-widest border border-slate-600 focus:border-blue-400 outline-none"
            />
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">{error}</div>}

          <button
            onClick={handleJoinSession}
            disabled={!joinCode || joinCode.length < 5 || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? '⏳ Entrando...' : '✔️ Entrar'}
          </button>

          <button
            onClick={() => {
              setAppState('login')
              setJoinCode('')
              handleDisconnect()
            }}
            className="w-full text-gray-300 hover:text-white transition py-2"
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // WAITING FOR CONFIRMATION
  // =========================================================================
  if (appState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">👥</div>
            <h1 className="text-3xl font-bold text-white mb-4">Conectando...</h1>

            <div className="bg-slate-700/50 rounded-lg p-6 space-y-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Você ({username})</p>
                    <p className="text-blue-200 text-sm">{LANGUAGES[yourLanguage]}</p>
                  </div>
                </div>

                {remoteUser && (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${remoteUser.connected ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {remoteUser.connected ? '✓' : '⏳'}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{remoteUser.username}</p>
                      <p className="text-blue-200 text-sm">{LANGUAGES[remoteUser.language]}</p>
                      {remoteUser.connected && <p className="text-green-400 text-xs">✓ Conectado</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!connectionConfirmed ? (
              <>
                <p className="text-blue-200 mb-4">Confirme sua conexão para começar:</p>
                <button
                  onClick={handleConfirmConnection}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition mb-4"
                >
                  ✅ Confirmar Conexão
                </button>
              </>
            ) : (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded">
                ✓ Você confirmou! Aguardando o outro participante...
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setAppState('login')
              handleDisconnect()
            }}
            className="w-full text-gray-300 hover:text-white transition py-2"
          >
            ← Sair
          </button>
        </div>
      </div>
    )
  }

  // =========================================================================
  // CHAT SCREEN
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* HEADER */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-lg">💬 Chat Tradutor</p>
            <p className="text-xs text-gray-400">Session: {sessionId}</p>
          </div>
          <button
            onClick={() => {
              setAppState('login')
              handleDisconnect()
            }}
            className="text-gray-400 hover:text-white transition"
          >
            <LogOut size={24} />
          </button>
        </div>

        {remoteUser && (
          <div className="flex items-center gap-2 bg-slate-700/50 rounded px-3 py-2">
            <Users size={16} className="text-cyan-400" />
            <span className="text-blue-200 text-sm">
              Você ({LANGUAGES[yourLanguage]}) ↔️ {remoteUser.username} ({LANGUAGES[remoteUser.language]})
            </span>
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p>Comece a conversa!</p>
              <p className="text-sm text-gray-600 mt-2">Cada um fala no seu idioma, tradução automática</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  msg.sender === username ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-200'
                }`}
              >
                <p className="text-xs opacity-75 mb-1 font-semibold">{msg.sender}</p>
                <p className="text-sm mb-2">📝 {msg.originalText}</p>
                {msg.originalText !== msg.translatedText && (
                  <div className="border-t border-current border-opacity-30 pt-2 mt-2">
                    <p className="text-xs opacity-75">Traduzido para {LANGUAGES[msg.receiverLanguage as Language]}:</p>
                    <p className="text-sm font-semibold">🌐 {msg.translatedText}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="bg-slate-800/50 border-t border-slate-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escreva sua mensagem..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !messageInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition flex items-center gap-2"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
