# CLAUDE.md

Este arquivo fornece orientações para Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

---

## 📋 Visão Geral do Projeto

**Tradutor IA** é uma aplicação web de tradução de voz bidirecional em tempo real para chamadas internacionais.

**Stack Tecnológico:**
- **Backend:** Node.js + Express + TypeScript com Socket.io
- **Frontend:** Next.js (React) com PWA (Progressive Web App)
- **APIs Externas:** Twilio (VoIP), Gemini (tradução), Google Cloud (speech-to-text/text-to-speech)
- **Deploy:** Vercel (frontend), Railway ou Vercel (backend)

---

## 🏗️ Arquitetura de Alto Nível

### Estrutura de Diretórios

```
tradutor-ia-real/
├── server.ts              # Backend Express com Socket.io (porta 3001)
├── test-client.ts         # Cliente de teste para debug
├── api/
│   ├── handler.ts         # Handler serverless (Vercel Functions)
│   └── handler.d.ts
├── web/                   # Next.js frontend PWA
│   ├── app/
│   │   ├── layout.tsx     # Layout raiz
│   │   ├── page.tsx       # Home page
│   │   └── debug.tsx      # Debug page
│   ├── components/        # Componentes React
│   ├── public/            # Assets estáticos (ícones, manifest.json, service worker)
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Backend dependencies
└── docs/                  # Documentação (COMECE_AQUI.md, START_HERE.md, etc.)
```

### Fluxo de Dados em Tempo Real

```
Cliente Web (Next.js)
    ↓ [Socket.io WebSocket]
Backend Server (Express)
    ├── Session Management (Map)
    ├── Tradução (Gemini API)
    └── Cache de Traduções (Map)
    ↓ [Broadcast Socket.io]
Outro Cliente Web
```

### Session Management (In-Memory)

O backend mantém sessões em memória:
- `sessions: Map<sessionId, ChatSession>` - Armazena todas as sessões ativas
- `userSessions: Map<socketId, sessionId>` - Mapeia usuários para sessões
- Sessões são deletadas quando ambos usuários desconectam
- Limite de 2 usuários por sessão

---

## 🛠️ Comandos Essenciais

### Backend

```bash
# Instalar dependências
npm install

# Desenvolvimento (ts-node, reloading automático)
npm run dev
# → Roda em http://localhost:3001

# Compilar TypeScript
npm run build
# → Gera /dist com JavaScript compilado

# Produção
npm start
# → Roda /dist/server.js
```

### Frontend (Web App)

```bash
cd web

# Instalar dependências
npm install

# Desenvolvimento (Next.js dev server com hot reload)
npm run dev
# → Roda em http://localhost:3000

# Build para produção
npm run build

# Rodar build de produção
npm start
```

### Testar Localmente (Simples)

```bash
# Terminal 1: Backend
npm install
npm run dev

# Terminal 2: Frontend
cd web
npm install
npm run dev

# Abrir em navegador:
# http://localhost:3000
```

---

## 📚 Estrutura de Código Backend

### server.ts - Pontos Principais

**Interfaces (Linhas 28-42):**
```typescript
interface SessionUser {
  id: string;
  socketId: string;
  username: string;
  language: string;
  connected: boolean;
}

interface ChatSession {
  id: string;
  users: SessionUser[];
  createdAt: number;
  status: 'waiting' | 'both-confirmed' | 'active';
  messages: any[];
}
```

**Seções Principais:**
1. **Session Management (L26-50)** - Gerencia sessões, gera IDs
2. **Translation (L52-83)** - Função `translateText()` com cache, usa Gemini API
3. **Socket.io Events (L86-316)**
   - `create_session` - User A cria sessão
   - `join_session` - User B entra com código
   - `confirm_connection` - Ambos confirmam conectados
   - `send_message` - Envia mensagem (traduz automaticamente)
   - `disconnect` - Lida com desconexão
4. **REST Endpoints (L319-334)**
   - `GET /health` - Health check
   - `GET /api/sessions` - Lista sessões ativas

**Porta:** 3001 (pode ser alterada com `PORT` env var)

### Variáveis de Ambiente

```bash
# Obrigatórias
GEMINI_API_KEY=AIzaSy...        # Google Gemini API key
TWILIO_ACCOUNT_SID=AC...        # Twilio account
TWILIO_AUTH_TOKEN=...           # Twilio token
TWILIO_PHONE_NUMBER=+1234...    # Número Twilio

# Opcionais
PORT=3001                        # Default: 3001
NODE_ENV=development             # development|production
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
```

---

## 🎨 Estrutura de Código Frontend

### Next.js App Directory (web/)

- **app/layout.tsx** - Layout raiz, providers globais
- **app/page.tsx** - Home page
- **app/debug.tsx** - Página de debug/teste
- **components/** - Componentes reutilizáveis
- **public/** - Service Worker (sw.js), manifest.json, ícones

### PWA Features

- **Service Worker** (`public/sw.js`) - Caching para offline
- **manifest.json** - Metadados PWA
- **Tailwind CSS** - Utility-first styling
- **Mobile-First** - Responsivo por padrão

### Comunicação com Backend

Frontend conecta ao backend via Socket.io:
```typescript
// Cliente se conecta a ws://localhost:3001
socket.emit('create_session', { username, language }, callback)
socket.emit('join_session', { sessionId, username, language }, callback)
socket.emit('send_message', { text }, callback)
socket.on('message_received', (message) => { /* handle */ })
```

---

## 🔄 Fluxo de uma Conversão

1. **User A (interface web):**
   - Clica "Criar Sessão" → `create_session` event
   - Backend gera sessionId (ex: "ABC12345")
   - User A entra em sala Socket.io

2. **User B (interface web):**
   - Entra sessionId "ABC12345" → `join_session` event
   - Backend adiciona User B à sessão
   - Ambos recebem `user_joined` event

3. **Confirmação:**
   - Ambos clicam "Confirmar" → `confirm_connection` event
   - Backend marca como `status: 'both-confirmed'`
   - Ambos recebem `both_ready` event

4. **Mensagem:**
   - User A envia texto em português
   - Backend: `translateText(texto, 'português', 'inglês')`
   - Usa Gemini API → resultado cacheado
   - Backend emite `message_received` com original + tradução
   - Ambos recebem a mensagem

---

## 🧪 Debug & Testing

### Testar Backend Localmente

```bash
# Terminal 1
npm run dev

# Terminal 2 - Testar health
curl http://localhost:3001/health

# Terminal 2 - Listar sessões
curl http://localhost:3001/api/sessions
```

### Usar test-client.ts

```bash
# Compilar e rodar cliente de teste
npx ts-node test-client.ts

# Vai conectar, criar sessão, enviar mensagens
# Útil para debug sem interface web
```

### Modo Desenvolvimento Frontend

```bash
cd web
npm run dev

# DevTools: Ctrl+Shift+I
# Network tab: Veja comunicação Socket.io
# Console: Veja logs da aplicação
```

### Checklist de Debug

- [ ] Backend rodando em `localhost:3001`? → `curl http://localhost:3001/health`
- [ ] Frontend rodando em `localhost:3000`?
- [ ] Socket.io conectado? → DevTools → Network → WS connections
- [ ] Env vars carregadas? → Verificar `console.log` no server.ts
- [ ] Mensagens traduzindo? → Verificar Gemini API key
- [ ] Cache funcionando? → Enviar mesma mensagem 2x (segunda é mais rápida)

---

## 📤 Deploy

### Pré-requisitos de Credenciais

**Twilio:**
- https://www.twilio.com/console
- Account SID, Auth Token, Número de telefone

**Google Cloud (Speech-to-Text/Text-to-Speech):**
- https://console.cloud.google.com
- Service Account JSON key
- APIs ativadas: Cloud Speech-to-Text, Cloud Text-to-Speech

**Google Gemini:**
- https://makersuite.google.com/app/apikey
- API Key para Gemini

### Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy backend
vercel --prod

# Deploy frontend
cd web
vercel --prod

# Adicionar env vars no Vercel Dashboard:
# - GEMINI_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_PHONE_NUMBER
# - GOOGLE_APPLICATION_CREDENTIALS (como secret)
```

### Railway

Ver `DEPLOY_RAILWAY.md` para instruções específicas.

---

## ⚙️ Considerações Técnicas

### TypeScript Strict Mode

- `strict: true` em tsconfig.json
- Sem `any` implícito
- Null checks obrigatórios
- Respeitar tipos ao modificar código

### Session Management

- **Em-memória:** Sessões perdidas se servidor reiniciar
- **Para produção:** Considerar Redis ou database para persistência
- **Limite:** 2 usuários por sessão (hardcoded em L142)

### Translation Caching

- Cache em `Map<string, string>` (em-memória)
- Chave: `"${fromLang}-${toLang}-${text}"`
- **Para produção:** Considerar Redis com TTL
- Reduz chamadas à Gemini API (economiza custo)

### Socket.io Multiplexing

- Default: namespace `/`
- CORS habilitado com `origin: '*'` (ajustar em produção)
- Reconexão automática do cliente

### Performance

- Gemini API: ~1-2 segundos por tradução
- Cache reduz isso para <1ms
- Escalabilidade: Session storage em memória limita a 1 servidor
  - Para múltiplos servidores: usar Redis + Socket.io adapter

---

## 📝 Padrões de Código

### Event Naming

Socket.io events usam `snake_case`:
- `create_session`
- `user_joined`
- `message_received`
- `connection_status`

### Error Handling

```typescript
// Padrão usado no projeto
socket.on('event', (data, callback) => {
  try {
    // lógica
    callback({ success: true, data });
  } catch (error) {
    console.error('Event error:', error);
    callback({ success: false, error: 'message' });
  }
});
```

### Logging

Formato padrão:
```typescript
console.log(`[${new Date().toISOString()}] [SEÇÃO] mensagem`);
// Exemplos:
// [CREATE] Session ABC12345 created by João
// [MESSAGE] João (português): "Olá" -> "Hello"
// [DISCONNECT] User left session
```

---

## 🚀 Próximas Melhorias (Futuras)

1. **Persistência:** Migrar Session Storage para Redis
2. **Escalabilidade:** Adicionar Socket.io Redis adapter para múltiplos servidores
3. **Testes:** Setup de testes automatizados (Jest/Vitest)
4. **Monitoring:** Adicionar observabilidade (Sentry, DataDog)
5. **Auth:** Sistema de autenticação (NextAuth.js já importado)

---

## 📚 Arquivos de Documentação

- **COMECE_AQUI.md** - Quick start em português
- **START_HERE.md** - Quick start em inglês
- **BIDIRECTIONAL_GUIDE.md** - API endpoints detalhados
- **DEPLOYMENT.md** - Guia de deploy completo
- **DEPLOY_RAILWAY.md** - Deploy específico para Railway
- **STATUS_DEPLOYMENT.md** - Status de deployment atual

---

## 🎯 Dicas para Produtividade

1. **Mantenha backend e frontend rodando em terminais separados** - Use `npm run dev` nos dois
2. **Use DevTools do navegador** - Network tab mostra Socket.io mensagens
3. **Teste mensagens duplicadas** - Valida que o cache está funcionando
4. **Logs no console** - Frontend loga eventos, backend faz logging estruturado
5. **Variar idiomas** - Teste com português + inglês, português + espanhol, etc.

---

## 🔗 Referências Rápidas

- **Express Docs:** https://expressjs.com/
- **Socket.io Docs:** https://socket.io/docs/v4/
- **Next.js Docs:** https://nextjs.org/docs
- **Google Gemini API:** https://ai.google.dev/
- **Twilio Docs:** https://www.twilio.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

---

**Última atualização:** 2026-03-27
**Atualizado por:** Claude Code Haiku 4.5
