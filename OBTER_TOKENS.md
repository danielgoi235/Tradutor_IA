# 🔐 Obter Tokens Necessários

Siga estes passos para obter os 3 tokens que você vai precisar.

---

## 1️⃣ GitHub Personal Access Token (5 min)

### Passo 1: Ir para GitHub Settings

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"

### Passo 2: Criar Token

```
Name: tradutor-ia-setup
Expiration: 90 days (ou mais)

Permissions (marque):
☑ repo (full control of private repositories)
☑ workflow
☑ admin:public_key
```

### Passo 3: Copiar

- Clique "Generate token"
- **COPIE IMEDIATAMENTE** (só aparece uma vez!)
- Salve em um arquivo de texto seguro

**Resultado:** `ghp_xxxxxxxxxxxxxxxxxxxxx`

---

## 2️⃣ Vercel API Token (3 min)

### Passo 1: Ir para Vercel Settings

1. Acesse: https://vercel.com/account/tokens
2. Clique "Create Token"

### Passo 2: Criar Token

```
Name: tradutor-ia-setup
Expiration: 7 days (mínimo)
Scope: Full Account
```

### Passo 3: Copiar

- Clique "Create"
- **COPIE IMEDIATAMENTE** (só aparece uma vez!)
- Salve em arquivo seguro

**Resultado:** `vercel_xxxxxxxxxxxxxxxxxxxxx`

---

## 3️⃣ Credenciais que Você Já Tem

Se já criou anteriormente (Twilio, Google Cloud, Gemini), reúna:

```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER = +14155552671

GOOGLE_CLOUD_PROJECT_ID = seu-projeto-id
GEMINI_API_KEY = AIzaSyxxxxxxxxxxxx
```

Se NÃO tem, crie rapidamente:

### Twilio (2 min)
- https://www.twilio.com/console
- Account SID + Auth Token já aparecem
- Compre número de telefone

### Google Cloud (3 min)
- https://console.cloud.google.com
- Crie Service Account
- Download JSON
- Copie `project_id`

### Gemini API (1 min)
- https://makersuite.google.com/app/apikey
- Clique "Create API Key"
- Copie

---

## ✅ Checklist

```
☐ GitHub Personal Access Token (ghp_...)
☐ Vercel API Token (vercel_...)
☐ TWILIO_ACCOUNT_SID (AC...)
☐ TWILIO_AUTH_TOKEN
☐ TWILIO_PHONE_NUMBER (+1...)
☐ GOOGLE_CLOUD_PROJECT_ID
☐ GEMINI_API_KEY (AIzaSy...)
```

---

## 🚀 Quando Tiver Todos, Execute:

```bash
cd C:\Users\danie\OneDrive\Documentos\GitHub\tradutor-ia-real
node setup-vercel.js
```

O script vai pedir cada um e fazer tudo automaticamente!

---

**Pronto? Reúna os tokens e execute o script!** 🎯
