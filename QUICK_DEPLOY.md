# ⚡ DEPLOY RÁPIDO - 5 MINUTOS

## PASSO 1: Railway (manual - 2 min)

1. Abra: https://railway.app/new
2. Selecione: **"Deploy from GitHub"**
3. Autorize Railway
4. Procure: **`Tradutor_IA`**
5. Clique: **"Deploy Now"**

**Enquanto Railway faz build, siga para PASSO 2**

---

## PASSO 2: Adicione Variáveis no Railway

1. No Railway dashboard, clique: **"Variables"**
2. Adicione:
   ```
   GEMINI_API_KEY = AIzaSyBP6zGJL1bNNU7OZfc_R7lkBNlpTuGXxFQ
   NODE_ENV = production
   PORT = 3000
   ```
3. Salve

---

## PASSO 3: Obtenha a URL

Quando ficar **verde** (Deployed), você verá uma URL como:
```
https://seu-projeto-production.up.railway.app
```

**COPIE esta URL**

---

## PASSO 4: Configure Vercel (automático aqui)

Cole a URL que copiou:
```
https://seu-projeto-production.up.railway.app
```

Eu configuro o resto no Vercel automaticamente.

---

## PASSO 5: Teste

Acesse:
```
https://seu-app-vercel.vercel.app/debug
```

Deve mostrar: **✅ CONECTADO**

---

**Quanto tempo leva:**
- Railway deploy: 2-3 min
- Vercel redeploy: 1 min
- Total: ~5 min

**Você está no PASSO 1 agora!**
Clique no link e comece o deploy.
