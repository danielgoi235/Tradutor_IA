'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Save } from 'lucide-react'

interface Settings {
  apiUrl: string
  autoDetectLanguage: boolean
  enableCache: boolean
  soundEnabled: boolean
  theme: 'dark' | 'light' | 'auto'
}

export default function SettingsComponent({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    autoDetectLanguage: true,
    enableCache: true,
    soundEnabled: true,
    theme: 'dark',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 space-y-6">
      {/* API Configuration */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">⚙️ API Configuration</h2>
        <div>
          <label className="block text-sm font-semibold mb-2">API URL</label>
          <input
            type="text"
            value={settings.apiUrl}
            onChange={(e) =>
              setSettings({ ...settings, apiUrl: e.target.value })
            }
            className="input-field text-sm"
            placeholder="http://localhost:3000"
          />
          <p className="text-xs text-slate-400 mt-2">
            URL do servidor de tradução
          </p>
        </div>
      </div>

      {/* Language & Features */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">🌐 Idioma & Recursos</h2>

        <ToggleSetting
          label="Detecção Automática de Idioma"
          description="Detectar automaticamente o idioma da chamada"
          checked={settings.autoDetectLanguage}
          onChange={(value) =>
            setSettings({ ...settings, autoDetectLanguage: value })
          }
        />

        <ToggleSetting
          label="Ativar Cache"
          description="Cachear traduções para economizar custos"
          checked={settings.enableCache}
          onChange={(value) =>
            setSettings({ ...settings, enableCache: value })
          }
        />

        <ToggleSetting
          label="Som Habilitado"
          description="Tocar sons de notificação"
          checked={settings.soundEnabled}
          onChange={(value) =>
            setSettings({ ...settings, soundEnabled: value })
          }
        />
      </div>

      {/* Theme */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">🎨 Tema</h2>
        <div className="space-y-2">
          {(['dark', 'light', 'auto'] as const).map((theme) => (
            <label key={theme} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={theme}
                checked={settings.theme === theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as 'dark' | 'light' | 'auto',
                  })
                }
                className="w-4 h-4"
              />
              <span className="capitalize font-semibold">
                {theme === 'dark' && '🌙 Escuro'}
                {theme === 'light' && '☀️ Claro'}
                {theme === 'auto' && '🔄 Automático'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="card space-y-3">
        <h2 className="font-bold text-lg">ℹ️ Sobre</h2>
        <div className="space-y-2 text-sm text-slate-300">
          <div>
            <span className="font-semibold">Versão:</span> 2.0.0
          </div>
          <div>
            <span className="font-semibold">Plataforma:</span> Web App
          </div>
          <div>
            <span className="font-semibold">Status:</span> Beta
          </div>
          <div className="pt-2 text-xs text-slate-400">
            Tradutor IA © 2026. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Save Button */}
      {saved && (
        <div className="card bg-green-500/20 border border-green-500 text-green-200 text-center">
          ✓ Configurações salvas com sucesso!
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Salvar Configurações
      </button>

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

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between py-2">
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
