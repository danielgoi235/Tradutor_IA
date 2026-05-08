# Setup Completo: Backend + Web App 🚀

Instruções passo-a-passo para colocar tudo rodando.

## Visão Geral da Arquitetura

```
╔═══════════════════════════════════════════════════════════════╗
║                     SEU CELULAR 📱                            ║
║  https://tradutor-ia.vercel.app (Progressive Web App)        ║
║                                                               ║
║  - Interface mobile bonita                                    ║
║  - Funciona offline                                           ║
║  - Instalável como app                                       ║
║  - Push notifications                                        ║
╚══════════════════════════════════════════════════════════════╝
                           ↓ HTTPS
                    (Vercel Global CDN)
                           ↓
╔═══════════════════════════════════════════════════════════════╗
║                  SEU BACKEND 🖥️                              ║
║  http://seu-backend.vercel.app ou seu-servidor.com           ║
║                                                               ║
║  - API de Tradução Bidirecional                              ║
║  - Integração Twilio                                         ║
║  - Gemini API + Cache Redis                                  ║
║  - Speech-to-Text / Text-to-Speech                           ║
╚═══════════════════════════════════════════════════════════════╝
                           ↓
        ┌─────────┬──────────┬─────────┐
        ↓         ↓          ↓         ↓
    ┌────────┐ ┌──────┐ ┌─────────┐ ┌──────┐
    │ Twilio │ │Gemini│ │Google   │ │Redis │
    │  API   │ │ API  │ │ Cloud   │ │Cache │
    └────────┘ └──────┘ └─────────┘ └──────┘
```

## Fase 1: Setup Backend (Node.js)

### 1.1 Clonar e Configurar

```bash
# 1. Navegar para o diretório
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real

# 2. Criar arquivo .env com credenciais
cat > .env << 'EOF'
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id

# Gemini API
GEMINI_API_KEY=AIzaSyxxxxxxxx

# Redis (opcional mas recomendado)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=production
WEBHOOK_BASE_URL=https://seu-backend.com
EOF

# 3. Adicionar credenciais Google Cloud
mkdir -p credentials
# Copie seu arquivo JSON do Google Cloud para credentials/google-cloud-key.json
```

### 1.2 Instalar e Testar Localmente

```bash
# Instalar dependências
npm install

# Build TypeScript
npm run build

# Testar localmente
npm start

# Você deve ver:
# ╔════════════════════════════════════════════════╗
# ║   Tradutor IA Real-Time Server Started         ║
# ║   Port: 3000                                   ║
# ║   Environment: production                      ║
# ╚════════════════════════════════════════════════╝

# Testar health check
curl http://localhost:3000/health
# Response: { status: "healthy", ... }
```

### 1.3 Deploy Backend no Vercel

#### Opção A: Via CLI

```bash
# Instalar Vercel CLI (se ainda não tem)
npm i -g vercel

# Fazer login
vercel login

# Deploy do backend
vercel --prod

# Responder as perguntas:
# - Set up and deploy? Yes
# - Which scope? Seu nome
# - Link to existing project? No
# - Project name? tradutor-ia-backend
# - In which directory? .
# - Want to override settings? No

# Anote a URL: https://tradutor-ia-backend.vercel.app
```

#### Opção B: Via GitHub

1. Push código para GitHub
2. Ir para https://vercel.com
3. New Project → Selecionar repo
4. Framework: Node.js
5. Build Command: `npm run build`
6. Start Command: `npm start`
7. Deploy!

### 1.4 Adicionar Credenciais no Vercel

```bash
# No dashboard do Vercel:
# Settings → Environment Variables

# Adicionar:
TWILIO_ACCOUNT_SID = ACxxxxxxxx
TWILIO_AUTH_TOKEN = seu_token
TWILIO_PHONE_NUMBER = +1234567890
GEMINI_API_KEY = AIzaSyxxxxxxx
GOOGLE_APPLICATION_CREDENTIALS = ./credentials/google-cloud-key.json
WEBHOOK_BASE_URL = https://seu-backend.vercel.app
REDIS_URL = redis://redis-url-from-upstash.com:port
NODE_ENV = production

# Vercel redeploy automaticamente após adicionar env vars
```

## Fase 2: Setup Web App (Next.js)

### 2.1 Preparar Web App

```bash
# Navegar para pasta web
cd web

# Instalar dependências
npm install

# Criar .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
EOF

# Testar localmente
npm run dev

# Abrir http://localhost:3000
# Você deve ver a interface da app
```

### 2.2 Testar Conectividade

```bash
# Na app (http://localhost:3000):
# 1. Ir para "Estatísticas"
# 2. Se aparecer dados → API está conectada ✓
# 3. Se erro → Verificar NEXT_PUBLIC_API_URL
```

### 2.3 Fazer Build

```bash
# Build para produção
npm run build

# Testar build localmente
npm start

# Abrir http://localhost:3000 e testar
```

### 2.4 Deploy Web App no Vercel

#### Opção A: Via GitHub

```bash
# 1. Push para GitHub (da pasta raiz do projeto)
cd ..
git add .
git commit -m "feat: deploy translator app v2"
git push origin main

# 2. No Vercel:
# - New Project
# - Selecionar repo
# - Root Directory: web
# - Build: npm run build
# - Deploy!
```

#### Opção B: Via CLI

```bash
# Da pasta web
cd web
vercel --prod

# Responder:
# - Set up and deploy? Yes
# - Project name? tradutor-ia-web
# - In which directory? .
# - Want to override settings? No
```

### 2.5 Configurar Environment Variables da Web App

```bash
# No dashboard do Vercel (projeto web):
# Settings → Environment Variables

NEXT_PUBLIC_API_URL = https://seu-backend.vercel.app
NEXT_PUBLIC_APP_NAME = Tradutor IA

# Redeploy após adicionar
```

## Fase 3: Testar Tudo Junto

### 3.1 Testar no Navegador Desktop

```bash
# Abrir sua app web
https://seu-app.vercel.app

# Verificar:
✓ Página carrega rápido
✓ Interface está bonita
✓ Menu de navegação funciona
✓ Estatísticas carregam (backend está conectado)
```

### 3.2 Testar no Celular

#### Android - Chrome

1. Abra https://seu-app.vercel.app no Chrome
2. Menu (⋮) → "Instalar app"
3. Toque em "Instalar"
4. Ícone aparece na home screen
5. Toque para abrir como app nativa

#### iPhone - Safari

1. Abra https://seu-app.vercel.app no Safari
2. Compartilhar (↑) → "Adicionar à Tela de Início"
3. Toque "Adicionar"
4. Ícone aparece como app no home screen

### 3.3 Testar Offline

1. Com a app aberta no celular
2. Ative Modo Avião
3. App continua funcionando! ✓
4. Dados ficarão em cache

### 3.4 Testar Chamada Real (Opcional)

```bash
# Se quiser testar a chamada real:
# Abra a app → Chamar
# Preencha:
# - Seu número: +5511987654321 (seu celular)
# - Contato: +14155552671 (contato nos EUA)
# - Seus idiomas: PT-BR, EN-US
# - Toque "Iniciar Chamada"

# Twilio vai conectar a chamada
# Você ouvirá tradução em tempo real!
```

## Fase 4: Domínio Customizado (Opcional)

### 4.1 Adicionar Domínio à Web App

```bash
# No Vercel Dashboard da web app:
# Settings → Domains
# Add Domain

# Opções:
# 1. Comprar via Vercel (mais fácil)
# 2. Usar domínio próprio (GoDaddy, Namecheap, etc)

# Exemplo: seu-tradutor.com → app
# API: api.seu-tradutor.com → backend
```

### 4.2 Configurar DNS (se domínio próprio)

```bash
# No seu registrador de domínio:
# Adicionar CNAME:
# seu-tradutor.com  CNAME  seu-app.vercel.app
# api.seu-tradutor.com  CNAME  seu-backend.vercel.app

# Esperar propagação (até 48h)
```

## Fase 5: Monitoramento Contínuo

### 5.1 Ver Logs Backend

```bash
# Via Vercel CLI
vercel logs seu-backend --follow

# Ver todas as requisições em tempo real
```

### 5.2 Monitorar Performance

```bash
# No Vercel Dashboard:
# Analytics → Ver métricas
# - Requisições/min
# - Tempo médio de resposta
# - Taxa de erro
# - Regiões
```

### 5.3 Alertas

```bash
# No Vercel Dashboard:
# Settings → Alerts
# Configurar webhook para Slack/Discord
# Receber notificações de erros
```

## Troubleshooting

### "API call error" na web app

```bash
# Verificar:
1. Backend está rodando?
   curl https://seu-backend.vercel.app/health

2. NEXT_PUBLIC_API_URL está correto?
   Deve ser: https://seu-backend.vercel.app

3. CORS habilitado no backend?
   Verificar next.config.js
```

### "Service Worker not working"

```bash
# Solução:
1. DevTools → Application → Service Workers
2. Verificar se está ativo
3. Se não: Limpar cache (Ctrl+Shift+Delete)
4. Recarregar página
```

### "Offline não funciona"

```bash
# Verificar:
1. /public/sw.js existe?
2. /public/manifest.json existe?
3. App está em HTTPS?
4. Service Worker registrou com sucesso?
```

### App lenta

```bash
# Otimizar:
1. Vercel → Settings → Edge Functions → Regiões
   (Selecionar regiões mais próximas do usuário)

2. Ativar Image Optimization

3. Usar next/image para imagens

4. Minificar CSS/JS
```

## Checklist Final

```
Backend (Node.js + Express):
✓ .env configurado com todas as chaves
✓ npm install completado
✓ npm run build funcionou
✓ npm start rodando localmente
✓ Health check respondendo
✓ Deployado no Vercel
✓ Env vars adicionadas no Vercel
✓ WEBHOOK_BASE_URL apontando para Vercel

Web App (Next.js):
✓ npm install completado
✓ .env.local configurado com API_URL
✓ npm run dev rodando
✓ Interface carrega corretamente
✓ Estatísticas mostram dados do backend
✓ npm run build funcionou
✓ Deployado no Vercel
✓ NEXT_PUBLIC_API_URL apontando para backend

Testing:
✓ Desktop: https://seu-app.vercel.app funciona
✓ Celular: App instalada e roda como app nativa
✓ Offline: Funciona sem internet
✓ Backend health: https://seu-backend.vercel.app/health responde

Pronto para usar! 🎉
```

## URLs Finais

```
Web App:    https://seu-app.vercel.app
Backend:    https://seu-backend.vercel.app
Health:     https://seu-backend.vercel.app/health
API:        https://seu-backend.vercel.app/api/bidirectional/*
```

## Próximos Passos

1. ✅ Testar no celular com a app instalada
2. ✅ Fazer uma chamada real (se quiser)
3. ✅ Monitorar performance no Vercel Analytics
4. ✅ Compartilhar link com amigos
5. ✅ Coletar feedback e melhorar

## Suporte

Documentação:
- [README.md](./README.md) - Overview
- [BIDIRECTIONAL_GUIDE.md](./BIDIRECTIONAL_GUIDE.md) - Como usar
- [WEB_DEPLOYMENT.md](./WEB_DEPLOYMENT.md) - Deploy detalhado
- [COST_OPTIMIZATION.md](./COST_OPTIMIZATION.md) - Economizar custos

---

**Parabéns! Seu tradutor está no ar!** 🌍🎉

Acesse via celular: https://seu-app.vercel.app
