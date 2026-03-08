# Quick Start ⚡

Comece em 5 minutos!

## 1️⃣ Obtenha Credenciais

### Twilio
1. Acesse https://www.twilio.com/console
2. Copie `ACCOUNT SID` e `AUTH TOKEN`
3. Compre um número de telefone

### Google Cloud
1. Vá para https://console.cloud.google.com
2. Crie um novo projeto
3. Ative: Cloud Speech-to-Text, Cloud Text-to-Speech
4. Crie Service Account → baixe chave JSON

### Gemini API
1. Visite https://makersuite.google.com/app/apikey
2. Crie uma nova chave API

## 2️⃣ Setup Rápido

```bash
# Clone
cd tradutor-ia-real

# Instale dependências
npm install

# Configure o arquivo .env
# COPIE suas credenciais aqui ⬇️

cat > .env << 'EOF'
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
GEMINI_API_KEY=AIzaSyxxxxxxx
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
GOOGLE_CLOUD_PROJECT_ID=seu-projeto
PORT=3000
NODE_ENV=development
EOF

# Coloque a chave Google Cloud
mkdir -p credentials
cp ~/Downloads/sua-chave.json credentials/google-cloud-key.json

# Build
npm run build

# Inicie!
npm start
```

## 3️⃣ Teste a API

### Health Check
```bash
curl http://localhost:3000/health
```

### Testar Tradução (PT-BR → EN-US)
```bash
curl -X POST http://localhost:3000/api/calls/test-translation \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Olá, tudo bem?",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }'
```

### Resposta Esperada
```json
{
  "success": true,
  "data": {
    "originalText": "Olá, tudo bem?",
    "translatedText": "Hello, how are you?",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }
}
```

## 4️⃣ Fazer Uma Chamada Real

```bash
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "toNumber": "+551199999999",
    "fromNumber": "+1234567890",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }'
```

### Resposta
```json
{
  "success": true,
  "data": {
    "callSid": "CA1234567890...",
    "sessionId": "uuid-session-id"
  }
}
```

## 5️⃣ Monitorar Chamadas

```bash
# Status da sessão
curl http://localhost:3000/api/calls/session/{sessionId}

# Estatísticas do servidor
curl http://localhost:3000/api/calls/stats
```

## Próximos Passos 🚀

### Para Desenvolvimento
- Ver [README.md](./README.md) para documentação completa
- Ver [INTERNATIONAL_SETUP.md](./INTERNATIONAL_SETUP.md) para Europa/EUA

### Para Produção
- Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para deploy
- Configurar SSL/TLS
- Setup de monitoramento
- Configurar auto-scaling

## Troubleshooting Rápido

### "Credentials not found"
```bash
# Verifique o arquivo
ls -la credentials/google-cloud-key.json

# E verifique a variável no .env
grep GOOGLE_APPLICATION_CREDENTIALS .env
```

### "Port already in use"
```bash
# Mude a porta no .env
echo "PORT=3001" >> .env

# Ou mate o processo
lsof -ti:3000 | xargs kill -9
```

### "Translation timeout"
```bash
# Aumente o timeout no config.ts
translationTimeout: 5000, // de 3000
```

## Exemplos de Uso

### Cliente Node.js

```typescript
import TranslatorClient from './examples/client';

const client = new TranslatorClient('http://localhost:3000');

// Testar tradução
await client.testTranslation({
  text: 'Olá mundo',
  sourceLanguage: 'pt-BR',
  targetLanguage: 'en-US',
});

// Iniciar chamada
const call = await client.initiateCall({
  toNumber: '+14155552671',
  fromNumber: '+5511987654321',
  sourceLanguage: 'pt-BR',
  targetLanguage: 'en-US',
});

console.log(`Call SID: ${call.callSid}`);
```

### cURL Script

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Testar saúde
echo "🏥 Verificando saúde do servidor..."
curl -s $BASE_URL/health | jq .

# Testar tradução
echo "🌐 Testando tradução..."
curl -s -X POST $BASE_URL/api/calls/test-translation \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bem-vindo!",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }' | jq .

# Ver estatísticas
echo "📊 Estatísticas..."
curl -s $BASE_URL/api/calls/stats | jq .
```

---

**Parabéns! 🎉 Seu tradutor de voz está rodando!**

Próximas perguntas? Veja a [FAQ](#) ou abra uma issue!
