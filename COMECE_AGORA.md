# ⚡ COMECE AGORA - 5 Passos para Começar

**Tempo total:** 90 minutos

---

## 🟢 PASSO 1: Commit dos Documentos (5 min)

```bash
cd /c/Users/danie/OneDrive/Documentos/GitHub/tradutor-ia-real

# Ver o que foi criado
git status

# Deverá mostrar:
# New files:
#   PRD.md
#   ARCHITECTURE.md
#   PHASE1_PLAN.md
#   OPÇÃO_A_SUMMARY.md
#   COMECE_AGORA.md
#   docs/stories/1.1.story.md

# Criar branch
git checkout -b feat/phase1-webrtc main

# Adicionar arquivos
git add PRD.md ARCHITECTURE.md PHASE1_PLAN.md OPÇÃO_A_SUMMARY.md COMECE_AGORA.md docs/stories/1.1.story.md

# Fazer commit
git commit -m "docs: Phase 1 WebRTC architecture and planning documents

- Add PRD (Product Requirements Document)
- Add ARCHITECTURE.md (technical design)
- Add PHASE1_PLAN.md (execution plan, 2 weeks)
- Add Story 1.1 (example story in AIOX format)
- Add implementation summaries

This represents OPTION A: Serverless WebRTC P2P translation platform"

# Push
git push -u origin feat/phase1-webrtc

# ✅ Pronto!
echo "✅ Branch criada e documentos commiteados"
```

---

## 🟡 PASSO 2: Setup Firebase (30 min)

### 2.1 Criar Projeto Firebase

```bash
# Ir para: https://console.firebase.google.com
# Clique em "Criar projeto"
# Nome: "tradutor-ia"
# Aceitar términos
# Criar
```

### 2.2 Habilitar Firestore Database

```
1. No Firebase Console (esquerda):
   → "Firestore Database"
2. Clique "Criar banco de dados"
3. Modo: "Iniciar no modo de teste"
4. Localização: "us-central1"
5. Criar
```

### 2.3 Habilitar Cloud Functions

```
1. No Firebase Console (esquerda):
   → "Cloud Functions"
2. Habilitar a API
3. Deixar para depois (vamos usar via CLI)
```

### 2.4 Habilitar Hosting

```
1. No Firebase Console (esquerda):
   → "Hosting"
2. Clique "Começar"
3. Deixar para depois (vamos usar via CLI)
```

### 2.5 Copiar Credenciais

```
1. No Firebase Console (esquerda):
   → "Configurações do projeto" (ícone de engrenagem)
   → Selecione "Seu projeto"
2. Role para "Seus aplicativos"
3. Em "Aplicativos da web", clique "<>"
4. Registrar aplicativo (se não existir)
5. Copiar o objeto firebaseConfig:

{
  apiKey: "AIzaSy...",
  authDomain: "tradutor-ia.firebaseapp.com",
  projectId: "tradutor-ia",
  storageBucket: "tradutor-ia.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

**Salvar em arquivo temporário!**

---

## 🟡 PASSO 3: Setup Google Gemini API (15 min)

### 3.1 Ativar Gemini API

```
1. Ir para: https://console.cloud.google.com
2. Selecionar projeto "tradutor-ia"
3. Pesquisar "Gemini API"
4. Clicar em "Gemini API"
5. Clique "HABILITAR"
6. Aguardar...
```

### 3.2 Criar API Key

```
1. No Google Cloud Console:
   → "Credenciais" (esquerda)
2. Clique "Criar credenciais"
3. Tipo: "Chave de API"
4. Copiar a chave gerada (API Key)
5. Guardar em segurança!
```

---

## 🟢 PASSO 4: Configurar `.env.local` (10 min)

```bash
# Na raiz do projeto (tradutor-ia-real/)
# Criar arquivo: .env.local

cat > .env.local << 'EOF'
# Firebase Configuration (cole aqui as credenciais do PASSO 2.5)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tradutor-ia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tradutor-ia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tradutor-ia.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Gemini API Key (cole aqui a chave do PASSO 3.2)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
EOF

# Verificar
cat .env.local
```

**⚠️ NUNCA comitar .env.local!** Já está em .gitignore.

---

## 🟢 PASSO 5: Instalar Dependências (30 min)

### 5.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools

# Verificar instalação
firebase --version
# Deve mostrar: 13.0.0+ (ou similar)
```

### 5.2 Fazer Login no Firebase

```bash
firebase login

# Será aberto navegador
# Fazer login com conta Google
# Permitir acesso
```

### 5.3 Inicializar Projeto Firebase

```bash
firebase init

# Perguntas:
# 1. "Which features do you want to setup?"
#    → Selecionar: Firestore, Functions, Hosting
# 2. "Use an existing project?"
#    → Selecionar: "tradutor-ia"
# 3. Resto: deixar defaults (Enter)

# Resultado: Arquivos criados
# - firebase.json
# - firestore.rules
# - firestore.indexes.json
# - functions/
```

### 5.4 Instalar Dependências do Projeto

```bash
# Backend (raiz)
npm install firebase-admin --save-dev

# Frontend (web/)
cd web
npm install firebase @google/generative-ai zustand

# Voltar
cd ..
```

### 5.5 Verificar Setup

```bash
npm run build
# Deve compilar sem erros

cd web
npm run build
# Deve compilar sem erros

cd ..
```

---

## ✅ PRONTO!

Se chegou aqui sem erros:

```bash
# Verificar final
echo "✅ SETUP COMPLETO!"
ls -la .env.local firebase.json firestore.rules
echo "Arquivos de configuração: OK"
```

---

## 🚀 Próximos Passos (AMANHÃ)

1. Ler **ARCHITECTURE.md** (entender design)
2. Ler **Story 1.1** (primeira implementação)
3. Começar implementação: `npm run dev`
4. Criar componentes conforme Story 1.1

---

## ❓ Troubleshooting Rápido

### Erro: "Firebase project not found"
```bash
# Solução:
firebase projects:list
# Verificar se "tradutor-ia" aparece
firebase use tradutor-ia
```

### Erro: "Invalid API Key"
```bash
# Solução:
# 1. Verificar .env.local
# 2. Chave está completa (sem espaços)?
# 3. Ir para Google Cloud Console
# 4. Certifique-se que Gemini API está HABILITADO
```

### Erro: "Firestore not initialized"
```bash
# Solução:
firebase init firestore
# Ou ir em Firebase Console > Firestore > Create Database
```

---

## 📊 Checklist Final

- [ ] Commit dos documentos feito
- [ ] Projeto Firebase criado
- [ ] Firestore Database habilitado
- [ ] Gemini API habilitado
- [ ] `.env.local` preenchido
- [ ] Firebase CLI instalado
- [ ] `firebase init` rodou com sucesso
- [ ] Dependências instaladas (`npm install`)
- [ ] Build compile sem erros (`npm run build`)

---

## 🎯 Resumo

Você agora tem:
- ✅ **Arquitetura** documentada e aprovada
- ✅ **Backend** (Firebase) configurado
- ✅ **APIs** (Gemini) habilitadas
- ✅ **Variáveis de ambiente** prontas
- ✅ **Projeto** pronto para desenvolvimento

**Tempo investido:** ~90 minutos
**Resultado:** MVP pronto para começar em 2 semanas

---

## 📞 Próximas Ações

**Agora você pode:**

1. ✅ Ler **ARCHITECTURE.md** para entender como implementar
2. ✅ Começar **Story 1.1** (Anfitrião cria sala)
3. ✅ Rodar `npm run dev` localmente
4. ✅ Testar WebRTC P2P entre dois navegadores

**Comando para iniciar dev:**
```bash
npm run dev        # Backend (porta 3001)
cd web
npm run dev        # Frontend (porta 3000)
```

---

**Status:** 🟢 PRONTO PARA DESENVOLVER

**Boa sorte! 🚀**
