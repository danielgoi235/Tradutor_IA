# ⚡ COMECE AQUI - Testes Rápidos

Instruções para testar tudo em 15 minutos!

## 🎯 Objetivo
- ✅ Testar backend localmente
- ✅ Testar web app localmente
- ✅ Depois fazer deploy no Vercel

---

## Teste 1: Backend Local (3 min)

### 1. Prepare credenciais (uma vez)

```bash
# Ir para pasta do projeto
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real

# Criar .env com dados fictícios (para teste)
cat > .env << 'EOF'
TWILIO_ACCOUNT_SID=ACtest123test
TWILIO_AUTH_TOKEN=testtoken123
TWILIO_PHONE_NUMBER=+1234567890
GEMINI_API_KEY=AIzaSytest_fake_key_for_testing
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
PORT=3000
NODE_ENV=development
EOF

# Nota: Credenciais fictícias funcionam para testar estrutura
```

### 2. Instalar e rodar

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Rodar servidor
npm start

# Você deve ver:
# ╔════════════════════════════════════════════════╗
# ║   Tradutor IA Real-Time Server Started         ║
# ║   Port: 3000                                   ║
# ║   Environment: development                     ║
# ╚════════════════════════════════════════════════╝
```

### 3. Testar no navegador

```bash
# Abra no navegador:
http://localhost:3000/health

# Deve retornar:
{
  "status": "healthy",
  "timestamp": "2026-03-07T...",
  "uptime": 15.234
}
```

✅ **Backend funcionando!**

---

## Teste 2: Web App Local (3 min)

### 1. Abrir novo terminal (deixar backend rodando)

```bash
# Ir para pasta web
cd web

# Instalar dependências
npm install
```

### 2. Rodar web app

```bash
# Iniciar servidor Next.js
npm run dev

# Você deve ver:
# ✓ Ready in 2.5s
# ✓ Ready on http://localhost:3000
```

### 3. Testar no navegador

```
Abrir: http://localhost:3000

Você deve ver:
✓ Logo "Tradutor IA"
✓ Cards com features
✓ Botão "Iniciar Chamada"
✓ Menu inferior com 4 abas
```

### 4. Testar navegação

```
✓ Clique em "Chamar" → Abre formulário
✓ Clique em "Estatísticas" → Carrega dados (se backend conectado)
✓ Clique em "Configurações" → Mostra opções
✓ Clique em "Início" → Volta para home
```

✅ **Web app funcionando!**

---

## Teste 3: No Seu Celular (4 min)

### Android - Chrome

1. **No celular:**
   - Abra Chrome
   - Digite: `http://seu-ip-pc:3000`

   ⚠️ **Problema?** Seu PC e celular precisam estar na mesma rede WiFi!

   **Como saber seu IP:**
   ```bash
   # Windows - abra cmd
   ipconfig
   # Procure por "IPv4 Address: 192.168.x.x"
   ```

   **Acesse:** `http://192.168.x.x:3000`

2. **Se carregou:**
   - Menu (⋮) → "Instalar app"
   - Toque "Instalar"
   - ✅ App instalada!

### iPhone - Safari

1. **No celular:**
   - Abra Safari
   - Digite: `http://192.168.x.x:3000`

2. **Se carregou:**
   - Compartilhar (↑) → "Adicionar à Tela de Início"
   - Toque "Adicionar"
   - ✅ App instalada!

### 3. Testar Offline

```
Com app aberta no celular:
1. Ative Modo Avião
2. Tente navegar
3. Deve funcionar! ✓ (está cacheada)
```

✅ **App funciona como nativa!**

---

## ✅ Checklist de Teste Local

```
Backend:
☐ npm install completado
☐ npm run build funcionou
☐ npm start rodando
☐ http://localhost:3000/health responde

Web App:
☐ npm install completado
☐ npm run dev rodando
☐ http://localhost:3000 carrega
☐ Interface bonita
☐ Menu funciona
☐ Estatísticas mostram dados

Celular:
☐ App abre no celular
☐ Interface responsiva
☐ Menu funciona
☐ Funciona offline
☐ Instalável como app
```

---

## 🚀 Próximo: Deploy no Vercel

Quando quiser fazer deploy para o mundo:

### Passo 1: Obter Credenciais Reais

```
1. Twilio: https://www.twilio.com/console
   - Copie: Account SID + Auth Token
   - Compre número de telefone

2. Google Cloud: https://console.cloud.google.com
   - Crie Service Account
   - Download JSON key
   - Ative Speech-to-Text + Text-to-Speech

3. Gemini: https://makersuite.google.com/app/apikey
   - Copie sua API Key
```

### Passo 2: Deploy Backend

```bash
# Na pasta raiz (tradutor-ia-real)
npm install -g vercel
vercel login

# Deploy
vercel --prod

# Anote a URL que aparecer!
```

### Passo 3: Deploy Web App

```bash
# Na pasta web
vercel --prod

# Anote a URL que aparecer!
```

### Passo 4: Conectar URLs

No Vercel dashboard (web app):
- Settings → Environment Variables
- Adicionar: `NEXT_PUBLIC_API_URL = https://seu-backend.vercel.app`
- Redeploy

### Passo 5: Testar no Celular Real

```
Abra: https://seu-app.vercel.app
→ Funciona perfeito!
→ Instale como app
→ Funciona offline
→ Compartilhe com amigos!
```

---

## 🆘 Troubleshooting Rápido

### "npm install falha"
```bash
# Limpar cache
npm cache clean --force
npm install
```

### "Port 3000 já está em uso"
```bash
# Mude a porta
npm run dev -- -p 3001
```

### "Web app não conecta com backend"
```bash
# Verificar se backend está rodando
curl http://localhost:3000/health

# Se falhar, backend não está rodando
# (volte ao Teste 1)
```

### "Celular não consegue acessar PC"
```bash
# Certifique-se:
1. PC e celular na MESMA WiFi
2. Firewall não está bloqueando
3. Use IP correto: ipconfig → IPv4 Address
```

---

## 📊 O Que Você Vai Ver

### Backend
```
✓ Server rodando na porta 3000
✓ Endpoints /health, /api/bidirectional/*
✓ Logs de requisições
```

### Web App
```
✓ Interface com 4 abas (Início, Chamar, Stats, Config)
✓ Design mobile-first responsivo
✓ Funciona offline (Service Worker)
✓ Instalável como app nativa
```

### No Celular
```
✓ Parece um app nativo (não tem URL bar)
✓ Rápido e fluido
✓ Ícone na home screen
✓ Funciona sem internet
```

---

## 💡 Dicas

1. **Deixe terminal aberto** - Backend precisa estar rodando enquanto testa
2. **Recarregue página** - Se algo não atualiza, F5
3. **DevTools** - Ctrl+Shift+I para debug no navegador
4. **Logs** - Terminal mostra o que está acontecendo

---

## 📹 Ordem Recomendada

```
1. Backend local → http://localhost:3000/health ✓
2. Web app local → http://localhost:3000 ✓
3. Teste navegação na web ✓
4. Celular na mesma WiFi → http://192.168.x.x:3000 ✓
5. Instale como app no celular ✓
6. Teste offline (modo avião) ✓
7. Depois, faça deploy no Vercel (com credenciais reais)
```

---

## 🎉 Quando Tudo Funcionar

Você terá:
- ✅ Backend rodando localmente
- ✅ Web app bonita no navegador
- ✅ App instalável no celular
- ✅ Funciona offline

**Pronto para fazer deploy no Vercel!** 🚀

---

**Começar agora?**

```bash
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real
npm install
npm run build
npm start
```

Depois, em outro terminal:
```bash
cd web
npm install
npm run dev
```

**Boa sorte!** 🍀
