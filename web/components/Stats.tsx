'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface ServerStats {
  activeCalls: number
  totalCompleted: number
  totalTranslations: number
  averageCallDuration: number
}

interface ActiveCall {
  sessionId: string
  participant1: string
  participant2: string
  duration: number
  languages: string
  translations: number
  latency: number
}

export default function Stats({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axios.get('/api/bidirectional/stats')
      setStats(response.data.stats)
      setActiveCalls(response.data.activeCalls || [])
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Atualizar a cada 5s

    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Stats */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">📊 Estatísticas em Tempo Real</h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {lastUpdated && (
          <p className="text-xs text-slate-400">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>

      {error && (
        <div className="card bg-red-500/20 border border-red-500 text-red-200">
          {error}
        </div>
      )}

      {stats ? (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Chamadas Ativas"
              value={stats.activeCalls}
              icon="📞"
              color="blue"
            />
            <StatCard
              label="Chamadas Completadas"
              value={stats.totalCompleted}
              icon="✓"
              color="green"
            />
            <StatCard
              label="Traduções Executadas"
              value={stats.totalTranslations}
              icon="🌐"
              color="cyan"
            />
            <StatCard
              label="Duração Média"
              value={
                stats.averageCallDuration
                  ? `${Math.round(stats.averageCallDuration)}s`
                  : '--'
              }
              icon="⏱️"
              color="orange"
            />
          </div>

          {/* Active Calls */}
          {activeCalls.length > 0 && (
            <div className="card space-y-4">
              <h3 className="font-bold">📱 Chamadas Ativas</h3>
              <div className="space-y-3">
                {activeCalls.map((call, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-lg p-3 space-y-2 border border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {call.participant1} ↔ {call.participant2}
                        </p>
                        <p className="text-xs text-slate-400">
                          {call.languages}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                        Ativa
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Duração</div>
                        <div className="font-semibold text-cyan-400">
                          {formatDuration(Math.floor(call.duration / 1000))}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Traduções</div>
                        <div className="font-semibold text-green-400">
                          {call.translations}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Latência</div>
                        <div className="font-semibold text-orange-400">
                          {call.latency}ms
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Active Calls */}
          {activeCalls.length === 0 && (
            <div className="card text-center py-8 text-slate-400">
              <div className="text-4xl mb-2">📵</div>
              <p>Nenhuma chamada ativa no momento</p>
            </div>
          )}

          {/* Usage Tips */}
          <div className="card space-y-3">
            <h3 className="font-bold">💡 Dicas de Uso</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Use detecção automática de idioma para melhor experiência</li>
              <li>✓ Ative o cache para economizar nos custos</li>
              <li>✓ Fale claramente para melhor tradução</li>
              <li>✓ Latência de ~1-2s é normal</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="card text-center py-8 text-slate-400">
          Carregando estatísticas...
        </div>
      )}

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

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'cyan' | 'orange'
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
  }

  return (
    <div className="card text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}
