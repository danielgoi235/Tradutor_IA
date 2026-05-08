'use client'

/**
 * 🔧 DEBUG PAGE - Verificar conexão Socket.io
 */

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function DebugPage() {
  const [status, setStatus] = useState({
    socketURL: '',
    connected: false,
    error: '',
    latency: 0,
    messages: [] as string[],
  })

  useEffect(() => {
    const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    addMessage(`🔗 Tentando conectar em: ${socketURL}`)

    const socket = io(socketURL, {
      reconnection: true,
      reconnectionDelay: 1000,
    })

    const startTime = Date.now()

    socket.on('connect', () => {
      const latency = Date.now() - startTime
      addMessage(`✅ CONECTADO ao servidor! (latência: ${latency}ms)`)
      setStatus((prev) => ({
        ...prev,
        connected: true,
        latency,
        socketURL,
      }))
    })

    socket.on('disconnect', () => {
      addMessage('❌ Desconectado do servidor')
      setStatus((prev) => ({ ...prev, connected: false }))
    })

    socket.on('connect_error', (error) => {
      const msg = `❌ Erro de conexão: ${error.message}`
      addMessage(msg)
      setStatus((prev) => ({ ...prev, error: error.message }))
    })

    // Enviar ping a cada 5 segundos
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping', {}, (response: any) => {
          addMessage(`📡 Pong! ${response}`)
        })
      }
    }, 5000)

    return () => {
      clearInterval(pingInterval)
      socket.disconnect()
    }
  }, [])

  const addMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setStatus((prev) => ({
      ...prev,
      messages: [`[${timestamp}] ${msg}`, ...prev.messages.slice(0, 19)],
    }))
    console.log(msg)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-white">🔧 DEBUG Socket.io</h1>

        {/* Status */}
        <div className={`rounded-lg p-6 border-2 ${status.connected ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded-full ${status.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <p className={`text-xl font-bold ${status.connected ? 'text-green-400' : 'text-red-400'}`}>
              {status.connected ? '✅ CONECTADO' : '❌ DESCONECTADO'}
            </p>
          </div>
          {status.socketURL && <p className="text-blue-200 text-sm">URL: {status.socketURL}</p>}
          {status.latency > 0 && <p className="text-blue-200 text-sm">Latência: {status.latency}ms</p>}
          {status.error && <p className="text-red-300 text-sm mt-2">Erro: {status.error}</p>}
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-3">📋 Como Testar:</h2>
          <ol className="text-blue-200 space-y-2 text-sm">
            <li>1️⃣ Terminal 1: <code className="bg-slate-900 px-2 py-1 rounded">npx ts-node server.ts</code></li>
            <li>2️⃣ Aguarde a mensagem: <code className="bg-slate-900 px-2 py-1 rounded">🚀 TRADUTOR IA CHAT SERVER RODANDO</code></li>
            <li>3️⃣ Terminal 2: <code className="bg-slate-900 px-2 py-1 rounded">cd web && npm run dev</code></li>
            <li>4️⃣ Abra: <code className="bg-slate-900 px-2 py-1 rounded">http://localhost:3000/debug</code></li>
            <li>5️⃣ Veja os logs abaixo</li>
          </ol>
        </div>

        {/* Logs */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-3">📡 Logs:</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
            {status.messages.length === 0 ? (
              <p className="text-gray-500">Aguardando... (atualizando em tempo real)</p>
            ) : (
              status.messages.map((msg, i) => (
                <p key={i} className="text-blue-200 break-all">
                  {msg}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-slate-800 rounded-lg p-6 border border-yellow-700 bg-yellow-500/10">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">⚠️ Se não conectar:</h2>
          <ul className="text-yellow-200 space-y-2 text-sm">
            <li>✓ Servidor está rodando em terminal separado?</li>
            <li>✓ Vê a mensagem "🚀 TRADUTOR IA CHAT SERVER RODANDO"?</li>
            <li>✓ Porta 3001 não está bloqueada?</li>
            <li>✓ Firewall não está bloqueando localhost:3001?</li>
            <li>✓ .env.local tem NEXT_PUBLIC_SOCKET_URL=http://localhost:3001?</li>
          </ul>
        </div>

        {/* Back Button */}
        <a
          href="/"
          className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          ← Voltar ao App
        </a>
      </div>
    </div>
  )
}
