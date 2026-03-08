# 🚀 Execute o Setup Automático

Instruções para rodar o script que faz tudo automaticamente.

---

## Pré-requisito: Obter Tokens

Primeiro, siga: **`OBTER_TOKENS.md`**

Você vai ter:
```
✅ GitHub Personal Access Token
✅ Vercel API Token
✅ Credenciais: Twilio, Google Cloud, Gemini
```

---

## ⚡ Executar o Script

### Passo 1: Abrir Terminal

```bash
# Windows: Pressione Win + R, digite cmd
# Mac/Linux: Abra Terminal
```

### Passo 2: Navegar para pasta do projeto

```bash
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real
```

### Passo 3: Rodar Script

```bash
node setup-vercel.js
```

---

## 📝 O Script vai Pedir

```
? TWILIO_ACCOUNT_SID: [COPIE E COLE]
? TWILIO_AUTH_TOKEN: [COPIE E COLE] (fica escondido com *)
? TWILIO_PHONE_NUMBER: [COPIE E COLE]
? GOOGLE_CLOUD_PROJECT_ID: [COPIE E COLE]
? GEMINI_API_KEY: [COPIE E COLE] (fica escondido com *)
? GitHub repo (seu-usuario/seu-repo): [COPIE E COLE]
? GitHub Personal Access Token: [COPIE E COLE] (fica escondido com *)
? Vercel API Token: [COPIE E COLE] (fica escondido com *)
```

---

## ✅ O Script Vai Fazer

```
✓ Validar todas as credenciais
✓ Criar arquivo .env.production
✓ Fazer push para GitHub (automático)
✓ Mostrar comandos vercel para você copiar
✓ Salvar configuração
```

---

## 🎯 Depois que Terminar

O script vai mostrar 2 comandos para você copiar no terminal:

### Comando 1: Deploy Backend

```bash
vercel --prod --env TWILIO_ACCOUNT_SID=... --env TWILIO_AUTH_TOKEN=... ...
```

**Copie e cole no terminal** (vai fazer deploy do backend)

### Comando 2: Deploy Web App

```bash
cd web && vercel --prod --env NEXT_PUBLIC_API_URL=... --env NEXT_PUBLIC_APP_NAME=...
```

**Copie e cole no terminal** (vai fazer deploy da web app)

---

## 🌐 URLs Finais

Após os deploys, você vai ter:

```
🌐 Web App: https://seu-app.vercel.app
🖥️ Backend: https://seu-backend.vercel.app
```

---

## 🧪 Testar

1. **Abra no navegador:**
   ```
   https://seu-app.vercel.app
   ```

2. **No celular:**
   - Abra a URL
   - Menu (⋮) → "Instalar app"
   - Pronto! App instalada!

---

## ✨ Fluxo Completo

```
1. Obter tokens (OBTER_TOKENS.md)
                ↓
2. Executar script (RUN_SETUP.md) ← VOCÊ ESTÁ AQUI
                ↓
3. Copiar/colar comandos vercel
                ↓
4. Aguardar deploy (2-3 min)
                ↓
5. Teste em https://seu-app.vercel.app
                ↓
6. Instale no celular
                ↓
7. 🎉 Pronto!
```

---

## 🆘 Se Algo Deu Errado

### "Command not found: node"
```bash
# Instale Node.js: https://nodejs.org
# Depois tente novamente
```

### "Credenciais inválidas"
```bash
# Verificar se copiar/colar corretamente
# Sem espaços ou caracteres extras
```

### "GitHub token rejected"
```bash
# Token pode estar expirado
# Gere um novo em: https://github.com/settings/tokens
```

### "Vercel CLI not found"
```bash
# Instale: npm install -g vercel
# Depois tente novamente
```

---

## 💡 Dicas

1. **Copie os tokens com cuidado** - Sem espaços extras
2. **Deixe o terminal aberto** - Vercel pode demorar 2-3 min
3. **Não feche a janela** - Aguarde o fim
4. **Guarde os tokens** - Pode precisar depois

---

## 🎯 Resumão

```bash
# 1. Prepare tokens (5 min)
# OBTER_TOKENS.md

# 2. Execute script (1 min)
node setup-vercel.js

# 3. Copie comandos vercel (3 min)
# Você recebe 2 comandos, copie ambos

# 4. Deploy finaliza (2 min)
# Vercel faz tudo sozinho

# 5. Teste (1 min)
# https://seu-app.vercel.app

# Total: 12 minutos! ⚡
```

---

**Pronto para começar?** 🚀

```bash
node setup-vercel.js
```
