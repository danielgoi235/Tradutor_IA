import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tradutor IA - Chamadas em Tempo Real',
  description: 'Tradutor de voz bidirecional para chamadas internacionais',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1e40af',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tradutor IA" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/favicon.svg" color="#1e40af" />
      </head>
      <body className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white min-h-screen">
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col">
          {children}
        </div>
        <script src="/register-sw.js" />
      </body>
    </html>
  )
}
