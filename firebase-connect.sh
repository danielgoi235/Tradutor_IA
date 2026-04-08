#!/bin/bash

# Firebase Connection Script
# Conecta seu projeto local ao Firebase "tradutor-ia-21aee"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           🔗 FIREBASE CONNECTION SCRIPT                       ║"
echo "║                                                               ║"
echo "║  Este script vai conectar seu projeto ao Firebase             ║"
echo "║  Projeto: tradutor-ia-21aee                                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ID="tradutor-ia-21aee"
PROJECT_DIR="/c/Users/danie/OneDrive/Documentos/GitHub/tradutor-ia-real"

cd "$PROJECT_DIR" || exit 1

echo "📍 Diretório: $PROJECT_DIR"
echo "🔧 Projeto Firebase: $PROJECT_ID"
echo ""

# Passo 1: Fazer login
echo "════════════════════════════════════════════════════════════════"
echo "PASSO 1: Login no Firebase"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Vou abrir seu navegador para fazer login..."
echo ""
echo "⚠️  Um navegador vai abrir. Faça login com sua conta Google."
echo ""

npx firebase login

if [ $? -ne 0 ]; then
  echo "❌ Erro no login. Tente novamente com:"
  echo "   npx firebase login"
  exit 1
fi

echo "✅ Login realizado com sucesso!"
echo ""

# Passo 2: Verificar conexão
echo "════════════════════════════════════════════════════════════════"
echo "PASSO 2: Verificar projetos disponíveis"
echo "════════════════════════════════════════════════════════════════"
echo ""

npx firebase projects:list

echo ""
echo "Procure por: $PROJECT_ID"
echo ""

# Passo 3: Usar projeto
echo "════════════════════════════════════════════════════════════════"
echo "PASSO 3: Conectar ao projeto"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Conectando ao projeto: $PROJECT_ID"
echo ""

npx firebase use $PROJECT_ID

if [ $? -ne 0 ]; then
  echo "❌ Erro ao conectar. Verifique o ID do projeto."
  exit 1
fi

echo "✅ Conectado ao projeto $PROJECT_ID!"
echo ""

# Passo 4: Inicializar firebase.json
echo "════════════════════════════════════════════════════════════════"
echo "PASSO 4: Inicializar configuração"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ -f "firebase.json" ]; then
  echo "✅ firebase.json já existe"
else
  echo "Criando firebase.json..."
  cat > firebase.json << 'EOF'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-functions-debug.log"
      ]
    }
  ],
  "hosting": {
    "public": "web/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
EOF
  echo "✅ firebase.json criado"
fi

echo ""

# Passo 5: Criar firestore.rules
if [ ! -f "firestore.rules" ]; then
  echo "Criando firestore.rules..."
  cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow create: if true;
      allow read: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
EOF
  echo "✅ firestore.rules criado"
fi

echo ""

# Passo 6: Criar firestore.indexes.json
if [ ! -f "firestore.indexes.json" ]; then
  echo "Criando firestore.indexes.json..."
  cat > firestore.indexes.json << 'EOF'
{
  "indexes": [],
  "fieldOverrides": []
}
EOF
  echo "✅ firestore.indexes.json criado"
fi

echo ""

# Resumo final
echo "════════════════════════════════════════════════════════════════"
echo "✅ CONEXÃO COMPLETA!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Status:"
echo "  ✅ Firebase CLI: Instalado"
echo "  ✅ Login: Realizado"
echo "  ✅ Projeto: $PROJECT_ID"
echo "  ✅ firebase.json: Configurado"
echo "  ✅ Firestore Rules: Criado"
echo ""
echo "PRÓXIMOS PASSOS:"
echo ""
echo "1. Criar arquivo .env.local com suas credenciais:"
echo "   cat > .env.local << 'EOF'"
echo "   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy..."
echo "   NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID"
echo "   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy..."
echo "   EOF"
echo ""
echo "2. Instalar dependências:"
echo "   npm install"
echo ""
echo "3. Instalar web dependencies:"
echo "   cd web && npm install && cd .."
echo ""
echo "4. Build para validar:"
echo "   npm run build"
echo ""
echo "5. Iniciar desenvolvimento:"
echo "   npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════"
