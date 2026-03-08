# 🚀 Deploy no Vercel - Passo a Passo CORRETO

Guia EXATO para colocar o Tradutor funcionando no Vercel.

## ⚠️ IMPORTANTE

Você vai fazer **2 deploys** no Vercel:
1. **Backend** (API de tradução)
2. **Web App** (Interface do celular)

Eles vão se comunicar via HTTPS.

---

## PARTE 1: Preparar Credenciais Reais

### Step 1: Obter Twilio

1. Vá para: https://www.twilio.com/console
2. Sign up (grátis - $15 crédito inicial)
3. Vá para Account → API Keys & tokens
4. Copie:
   - `ACCOUNT SID` (ex: `ACxxxxxxxxxxxxxxxx`)
   - `AUTH TOKEN` (ex: `abc123xyz...`)
5. Compre um número de telefone:
   - Phone Numbers → Manage → Buy a Number
   - Escolha país (ex: EUA)
   - Complete compra
   - Copie número (ex: `+14155552671`)

**Salve em um arquivo de texto:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=abc123xyz...
TWILIO_PHONE_NUMBER=+14155552671
```

### Step 2: Obter Google Cloud

1. Vá para: https://console.cloud.google.com
2. Sign up com seu Google
3. Crie novo projeto:
   - Clique "Select a project" → "New Project"
   - Name: "tradutor-ia"
   - Create

4. Ative APIs:
   - Procure por "Cloud Speech-to-Text"
   - Clique → Enable
   - Procure por "Cloud Text-to-Speech"
   - Clique → Enable
   - Procure por "Cloud Translation API"
   - Clique → Enable

5. Crie Service Account:
   - Menu (☰) → APIs & Services → Credentials
   - Create Credentials → Service Account
   - Name: "tradutor-ia"
   - Create and Continue
   - Skip steps (Grant roles, etc)
   - Create Key (JSON)
   - **Faça download do JSON!**

6. Copie o `project_id` do JSON:
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id-aqui",  ← COPIE ISSO
  ...
}
```

**Salve também:**
```
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id-aqui
GOOGLE_CREDENTIALS_JSON=<todo conteúdo do arquivo JSON>
```

### Step 3: Obter Gemini API

1. Vá para: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy a chave (ex: `AIzaSyxxxxxxxxxxxxxxx`)

**Salve:**
```
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxx
```

---

## PARTE 2: Deploy Backend no Vercel

### Step 1: Preparar GitHub

```bash
# 1. Ir para pasta do projeto
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real

# 2. Criar .env.production (com credenciais reais!)
cat > .env.production << 'EOF'
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_PHONE_NUMBER=+14155552671
GEMINI_API_KEY=AIzaSyxxxxxxx
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
PORT=3000
NODE_ENV=production
EOF

# 3. Criar pasta credentials
mkdir -p credentials

# 4. Colocar JSON do Google Cloud
# Copie o arquivo JSON que baixou para:
# credentials/google-cloud-key.json
```

### Step 2: Push para GitHub

```bash
# 1. Inicializar git (se não tiver)
git init
git remote add origin https://github.com/seu-usuario/seu-repo.git

# 2. Add files
git add -A

# 3. Commit
git commit -m "feat: translator app with bidirectional translation"

# 4. Push
git push -u origin main

# Sua repo está no GitHub!
```

### Step 3: Deploy Backend no Vercel

1. **Ir para:** https://vercel.com
2. **Sign up** com GitHub
3. **Import Project:**
   - Clique "New Project"
   - Clique "Import Git Repository"
   - Selecione seu repo `tradutor-ia-real`
   - Clique "Import"

4. **Configure Build:**
   ```
   Framework Preset: Node.js
   Root Directory: .
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Start Command: node dist/index.js
   ```

5. **Add Environment Variables:**
   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN = seu_token
   TWILIO_PHONE_NUMBER = +14155552671
   GEMINI_API_KEY = AIzaSyxxxxxxx
   GOOGLE_CLOUD_PROJECT_ID = seu-projeto-id
   GOOGLE_APPLICATION_CREDENTIALS = ./credentials/google-cloud-key.json
   NODE_ENV = production
   ```

6. **Deploy!**
   - Clique "Deploy"
   - Aguarde ~3 minutos
   - Você verá: ✅ Production
   - **Copie a URL:** https://seu-backend.vercel.app

---

## PARTE 3: Deploy Web App no Vercel

### Step 1: Criar novo projeto Vercel

1. **Ir para:** https://vercel.com
2. **New Project**
3. **Import Git Repository**
4. **Selecione o mesmo repo** (`tradutor-ia-real`)
5. **Clique "Import"**

### Step 2: Configure Web App

1. **Root Directory:** `web` ← IMPORTANTE!

2. **Build:**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://seu-backend.vercel.app
   NEXT_PUBLIC_APP_NAME = Tradutor IA
   ```

4. **Deploy!**
   - Clique "Deploy"
   - Aguarde ~2 minutos
   - **Copie a URL:** https://seu-webapp.vercel.app

---

## PARTE 4: Conectar Backend + Web App

### No Backend (se necessário)

1. **Vercel Dashboard** → Seu projeto backend
2. **Settings** → **Environment Variables**
3. Adicione:
   ```
   WEBHOOK_BASE_URL = https://seu-backend.vercel.app
   ```
4. **Redeploy** (Deployments → Click one → Redeploy)

### Na Web App

1. **Vercel Dashboard** → Seu projeto web
2. **Settings** → **Environment Variables**
3. Verifique:
   ```
   NEXT_PUBLIC_API_URL = https://seu-backend.vercel.app
   ```
4. Se mudar, **Redeploy**

---

## PARTE 5: Testar no Navegador

### Desktop

1. Abra: **https://seu-webapp.vercel.app**
2. Você deve ver:
   ```
   ✓ Logo "Tradutor IA"
   ✓ Cards com features
   ✓ Botão "Iniciar Chamada"
   ✓ Menu com 4 abas
   ```

3. Clique em "Estatísticas"
4. Se aparecer dados = **BACKEND CONECTADO!** ✅

### Celular

1. **Android Chrome:**
   - Abra: https://seu-webapp.vercel.app
   - Menu (⋮) → "Instalar app"
   - Toque "Instalar"
   - ✅ App instalada!

2. **iPhone Safari:**
   - Abra: https://seu-webapp.vercel.app
   - Compartilhar (↑) → "Adicionar à Tela de Início"
   - Toque "Adicionar"
   - ✅ App instalada!

3. **Teste Offline:**
   - Modo Avião = ON
   - App continua funcionando! ✓

---

## ✅ Checklist Final

```
Backend:
☐ Credenciais Twilio, Google, Gemini obtidas
☐ JSON do Google Cloud salvo em credentials/
☐ GitHub repo criado com código
☐ Backend deployado no Vercel
☐ Health check funciona: https://seu-backend.vercel.app/health
☐ Env vars adicionadas no Vercel

Web App:
☐ NEXT_PUBLIC_API_URL aponta para backend
☐ Web app deployada no Vercel
☐ Interface carrega: https://seu-webapp.vercel.app
☐ Menu funciona (4 abas)
☐ Estatísticas carregam (prova que backend conectado)

Celular:
☐ App abre no celular
☐ Interface responsiva
☐ Funciona offline
☐ Instalável como app
☐ Todos os menus funcionam
```

---

## 🆘 Troubleshooting

### "Deploy falha no Backend"

**Causa:** Credenciais faltando

**Solução:**
1. Voltar para Vercel Dashboard
2. Settings → Environment Variables
3. Verificar se TODAS as vars estão lá
4. Redeploy

### "Health check 404"

**Causa:** Backend não está respondendo

**Solução:**
```bash
# Verificar logs:
1. Vercel Dashboard
2. Seu projeto backend
3. Deployments
4. Clique no deploy
5. Veja os logs
```

### "Web app não conecta com Backend"

**Causa:** NEXT_PUBLIC_API_URL errado

**Solução:**
```
1. Web app settings
2. Environment Variables
3. NEXT_PUBLIC_API_URL deve ser:
   https://seu-backend.vercel.app
4. (não http://, HTTPS!)
5. Redeploy
```

### "Estatísticas mostram erro"

**Causa:** Backend não consegue conectar com APIs

**Solução:**
1. Verificar se credenciais estão corretas
2. Verificar se APIs estão ativadas no Google Cloud
3. Verificar se Twilio está ativo
4. Ver logs do backend

---

## 📚 URLs Finais

Depois de tudo pronto:

```
🌐 Web App:
   https://seu-webapp.vercel.app

🖥️ Backend:
   https://seu-backend.vercel.app

🔍 Health Check:
   https://seu-backend.vercel.app/health

📱 No Celular:
   Instale como app e use!
```

---

## 🎉 Pronto para Usar!

Agora você tem:
- ✅ Backend rodando em produção
- ✅ Web app rodando em produção
- ✅ Ambos conectados via HTTPS
- ✅ PWA instalável no celular
- ✅ Funciona offline
- ✅ Tradução bidirecional pronta

**Compartilhe o link:** https://seu-webapp.vercel.app

---

## 💡 Dicas Importantes

1. **Sempre use HTTPS** - Vercel fornece SSL grátis
2. **Env vars são secretas** - Não faça commit do .env
3. **Redeploy se mudar env vars** - Vercel não auto-redeploy
4. **Verifique logs se erro** - Vercel Dashboard → Logs
5. **Teste offline** - Grande feature das PWAs!

---

**Tudo pronto para o mundo! 🌍**
