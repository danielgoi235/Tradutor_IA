# 🚀 DEPLOY NO RAILWAY - GUIA COMPLETO

## Status: ✅ PRONTO PARA DEPLOY

- Backend compilando: ✅
- Environment vars: ✅ (Gemini API Key configurada)
- Código em GitHub: ✅

---

## PASSO 1: Acesse Railway

1. Abra: **https://railway.app**
2. Clique **"Start New Project"** (canto superior direito)
3. Selecione **"Deploy from GitHub"**

---

## PASSO 2: Autorize Railway no GitHub

1. Clique em **"GitHub"**
2. Autorize Railway (vai abrir popup)
3. Selecione sua conta: `danielgoi235`
4. Clique **"Authorize"**

---

## PASSO 3: Selecione o Repositório

1. Procure por: **`Tradutor_IA`**
2. Clique no repositório
3. Clique **"Deploy Now"**

Railway vai começar o build automaticamente (leva 2-5 minutos)

---

## PASSO 4: Configure as Variáveis de Ambiente

Enquanto Railway faz o build, adicione as env vars:

1. No dashboard Railway, acesse **"Variables"** (aba cinza)
2. Adicione:

```
GEMINI_API_KEY=AIzaSyBP6zGJL1bNNU7OZfc_R7lkBNlpTuGXxFQ
NODE_ENV=production
PORT=3000
```

3. Clique **"Save"**
4. Railway vai redeploy automaticamente

---

## PASSO 5: Obtenha a URL do Backend

1. Na aba **"Deployments"**, aguarde completar (verde: "Deployed")
2. Clique na URL gerada (exemplo: `https://tradutor-ia-backend-production.up.railway.app`)
3. **COPIE esta URL** - você vai usar no Vercel

---

## PASSO 6: Atualize o Vercel

1. Vá para: **https://vercel.com/dashboard**
2. Clique no projeto **`tradutor-ia-web`**
3. Vá em **Settings → Environment Variables**
4. Procure ou crie: `NEXT_PUBLIC_SOCKET_URL`
5. **Cole a URL do Railway** (exemplo: `https://tradutor-ia-backend-production.up.railway.app`)
6. Clique **"Save"**

Vercel vai redeploy automaticamente.

---

## PASSO 7: Teste o Sistema

1. Abra seu app Vercel: **https://seu-app.vercel.app**
2. Vá em **"/debug"** para verificar conexão Socket.io
3. Você deve ver: **✅ CONECTADO**

---

## 🎉 PRONTO!

Quando tudo estiver verde em Railway e Vercel:

- **Backend rodando**: Railway.app ✅
- **Frontend rodando**: Vercel.app ✅
- **Socket.io conectado**: Entre dois ✅
- **Tradução**: Gemini API ✅

Compartilhe o link Vercel com alguém para testar!

---

## ⚠️ Se houver erro de conexão:

1. Verifique se a **URL do Railway** está correta no Vercel
2. Abra DevTools (F12) e procure por erros
3. Vá em `/debug` para ver logs em tempo real

---

## 📞 Suporte

Se algo der errado:
1. Verifique logs no Railway dashboard
2. Verifique logs no Vercel dashboard
3. Abra DevTools no navegador (F12) e procure por erros
