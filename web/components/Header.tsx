'use client'

import { ChevronLeft, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header({ currentView }: { currentView: string }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getTitle = () => {
    switch (currentView) {
      case 'call':
        return 'Fazer Chamada'
      case 'settings':
        return 'Configurações'
      case 'stats':
        return 'Estatísticas'
      default:
        return 'Tradutor IA'
    }
  }

  return (
    <header className="sticky top-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700 backdrop-blur-md z-40">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">{getTitle()}</h1>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi size={20} className="text-green-400" />
          ) : (
            <WifiOff size={20} className="text-red-400 animate-pulse" />
          )}
          <span className="text-xs px-2 py-1 bg-slate-800 rounded-full">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
