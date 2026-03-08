#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO - Tradutor IA"
echo "=================================="
echo ""

# Step 1: Railway Login (interativo)
echo "1️⃣  Fazendo login no Railway..."
npx @railway/cli login

echo ""
echo "2️⃣  Criando novo projeto no Railway..."
npx @railway/cli init --name "tradutor-ia-backend"

echo ""
echo "3️⃣  Configurando variáveis de ambiente..."
export RAILWAY_TOKEN=$RAILWAY_TOKEN

# Variables
npx @railway/cli variables set GEMINI_API_KEY "AIzaSyBP6zGJL1bNNU7OZfc_R7lkBNlpTuGXxFQ"
npx @railway/cli variables set NODE_ENV "production"
npx @railway/cli variables set PORT "3000"

echo ""
echo "4️⃣  Conectando ao repositório GitHub..."
npx @railway/cli link --repo "danielgoi235/Tradutor_IA"

echo ""
echo "5️⃣  Iniciando deploy..."
npx @railway/cli up

echo ""
echo "✅ Deploy completo!"
echo ""
echo "6️⃣  Obtenha a URL do seu projeto e configure no Vercel:"
echo "   URL Formato: https://seu-projeto-production.up.railway.app"
echo ""
echo "7️⃣  Configure no Vercel:"
echo "   NEXT_PUBLIC_SOCKET_URL=<url-railway-acima>"
