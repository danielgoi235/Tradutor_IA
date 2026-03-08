# 🚀 Deploy no Railway

## Passo 1: Acesse Railway

1. Vá para: https://railway.app
2. Clique "Start New Project"
3. Selecione "Deploy from GitHub"

## Passo 2: Conecte seu GitHub

1. Clique "GitHub"
2. Autorize Railway a acessar sua conta GitHub
3. Procure por: `Tradutor_IA`
4. Selecione e clique "Deploy Now"

## Passo 3: Configure as variáveis de ambiente

Railway vai criar automaticamente. Edite as seguintes:

```
GEMINI_API_KEY=<sua chave do Gemini>
PORT=3000
NODE_ENV=production
```

## Passo 4: Obtenha a URL do Backend

Após deploy, você verá uma URL como:
```
https://seu-projeto-backend.railway.app
```

## Passo 5: Atualize o Vercel

1. Vá para Vercel Dashboard
2. Projeto `tradutor-ia-web`
3. Settings → Environment Variables
4. Configure:
```
NEXT_PUBLIC_SOCKET_URL=https://seu-projeto-backend.railway.app
```

## Pronto! ✅

- Backend rodando em Railway
- Frontend rodando em Vercel
- Socket.io conectado entre eles
