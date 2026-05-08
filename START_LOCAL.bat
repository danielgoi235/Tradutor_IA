@echo off
REM Script para iniciar servidor Socket.io + Frontend Next.js
REM Este script abre 2 janelas do terminal automaticamente

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 INICIANDO SISTEMA DE TESTE LOCAL                  ║
echo ║  Tradutor IA Chat - Socket.io + Next.js               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/2] Iniciando SERVIDOR Socket.io em nova janela...
start cmd /k "title SERVIDOR SOCKET.IO && cd /d "%cd%" && echo Aguarde... && timeout /t 2 && npx ts-node server.ts"

timeout /t 3

echo [2/2] Iniciando FRONTEND Next.js em nova janela...
start cmd /k "title FRONTEND NEXT.JS && cd /d "%cd%\web" && echo Aguarde... && timeout /t 2 && npm run dev"

timeout /t 3

echo.
echo ✅ Ambas as janelas foram abertas!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo    1. Aguarde a mensagem no servidor: "🚀 TRADUTOR IA CHAT SERVER RODANDO"
echo    2. Aguarde a mensagem no frontend: "- Local: http://localhost:3000"
echo    3. Abra http://localhost:3000 no navegador
echo    4. Teste o sistema seguindo TESTE_LOCAL.md
echo.
echo 🔧 DEBUG:
echo    http://localhost:3000/debug (para verificar conexão Socket.io)
echo.
echo ⚠️  IMPORTANTE:
echo    - NÃO feche essas janelas enquanto estiver testando!
echo    - Para parar: Ctrl+C em cada janela
echo.
pause
