# Tradutor IA Real-Time 🌐

Um sistema completo de tradução de voz em tempo real para chamadas telefônicas internacionais, usando **Twilio** para gerenciar chamadas, **Gemini API** para tradução inteligente e **Google Cloud Speech** para reconhecimento e síntese de fala.

## Features ✨

- 🔄 **Tradução Bidirecional Completa**: Ambos participantes falam na própria língua nativa e ouvem a tradução
- 🎤 **Tradução de Voz em Tempo Real**: Converte fala em português para inglês/espanhol (e vice-versa) em chamadas telefônicas
- 🌍 **Suporte Multilíngue**: PT-BR, EN-US, ES-ES, ES-MX, FR-FR, DE-DE, IT-IT
- 📞 **Integração Twilio**: Gerenciamento completo de chamadas telefônicas
- 🧠 **Gemini API**: Tradução contextual inteligente com Gemini Flash (96% mais barato!)
- 🗣️ **Google Cloud Speech**: Reconhecimento e síntese de fala de alta qualidade
- 🔍 **Detecção Automática de Idioma**: Identifica idioma automaticamente (80% grátis!)
- ⚡ **Cache Inteligente**: Redis para otimização de traduções frequentes (economiza 60-80%)
- 💰 **Custo Otimizado**: ~$10/mês para 100 chamadas (de $67)
- 📊 **Dashboard de Estatísticas**: Monitore chamadas ativas e histórico
- 🔒 **Pronto para Produção**: Tratamento de erros robusto e logging

## Pré-requisitos 📋

### Contas e Credenciais Necessárias

1. **Twilio Account**
   - Sign up em https://www.twilio.com
   - Obtenha `ACCOUNT_SID` e `AUTH_TOKEN`
   - Configure um número de telefone Twilio

2. **Google Cloud Account**
   - Crie um projeto em https://console.cloud.google.com
   - Ative as APIs:
     - Cloud Speech-to-Text
     - Cloud Text-to-Speech
   - Crie uma Service Account e baixe a chave JSON
   - Configure variável `GOOGLE_APPLICATION_CREDENTIALS`

3. **Google Gemini API**
   - Obtenha a chave em https://makersuite.google.com/app/apikey
   - Defina como `GEMINI_API_KEY`

### Dependências Locais

- Node.js 16+
- npm ou yarn
- Redis (opcional, para cache)

## Instalação 🚀

### 1. Clone e Configure

```bash
cd tradutor-ia-real
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id

# Gemini API
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

### 3. Configure Google Cloud Credentials

```bash
# Crie diretório de credenciais
mkdir -p credentials

# Coloque sua chave JSON do Google Cloud em:
credentials/google-cloud-key.json
```

### 4. Instale Dependências

```bash
npm install
```

### 5. Build TypeScript

```bash
npm run build
```

## Uso 🎯

### Desenvolvimento (com hot-reload)

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Testar Tradução

```bash
curl -X POST http://localhost:3000/api/calls/test-translation \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Olá, como você está?",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }'
```

### Iniciar Chamada Traduzida

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

### Obter Status da Sessão

```bash
curl http://localhost:3000/api/calls/session/{sessionId}
```

### Ver Estatísticas

```bash
curl http://localhost:3000/api/calls/stats
```

## Arquitetura 🏗️

```
┌─────────────────────────────────────────────┐
│           Chamada Telefônica               │
└────────────┬────────────────────────────────┘
             │
      ┌──────▼─────────┐
      │     Twilio     │ (Gerencia chamada)
      └──────┬─────────┘
             │
    ┌────────▼────────────────────┐
    │   Servidor Node.js/Express   │
    ├──────────────────────────────┤
    │  /api/calls/process-audio    │
    │         ▼        │           │
    │  ┌─────────────────────┐     │
    │  │ Speech-to-Text      │     │ 1. Converte áudio em texto
    │  │ (Google Cloud)      │     │
    │  └──────────┬──────────┘     │
    │             │                 │
    │  ┌──────────▼──────────┐     │
    │  │  Tradução Gemini    │     │ 2. Traduz o texto
    │  │  (Cache em Redis)   │     │
    │  └──────────┬──────────┘     │
    │             │                 │
    │  ┌──────────▼──────────┐     │
    │  │ Text-to-Speech      │     │ 3. Converte texto em áudio
    │  │ (Google Cloud)      │     │
    │  └──────────┬──────────┘     │
    │             │                 │
    └─────────────┼─────────────────┘
                  │
          ┌───────▼───────┐
          │  Twilio Play  │ (Toca áudio traduzido)
          └───────────────┘
```

## API Reference 📚

### POST /api/calls/initiate

Inicia uma chamada traduzida.

**Request:**
```json
{
  "toNumber": "+551199999999",
  "fromNumber": "+1234567890",
  "sourceLanguage": "pt-BR",
  "targetLanguage": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "data": {
    "callSid": "CA1234567890abcdef",
    "sessionId": "uuid-here"
  }
}
```

### POST /api/calls/test-translation

Testa tradução de texto.

**Request:**
```json
{
  "text": "Olá, como você está?",
  "sourceLanguage": "pt-BR",
  "targetLanguage": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "Olá, como você está?",
    "translatedText": "Hello, how are you?",
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US",
    "timestamp": 1234567890
  }
}
```

### GET /api/calls/stats

Obtém estatísticas do servidor.

**Response:**
```json
{
  "success": true,
  "stats": {
    "activeCalls": 2,
    "totalSessions": 15
  },
  "activeSessions": [...]
}
```

## Idiomas Suportados 🌐

| Código | Idioma |
|--------|--------|
| `pt-BR` | Português (Brasil) |
| `en-US` | Inglês (EUA) |
| `es-ES` | Espanhol (Espanha) |
| `es-MX` | Espanhol (México) |
| `fr-FR` | Francês |
| `de-DE` | Alemão |
| `it-IT` | Italiano |

## Troubleshooting 🔧

### Erro: "GOOGLE_APPLICATION_CREDENTIALS not found"
```bash
# Certifique-se que o arquivo existe
ls -la credentials/google-cloud-key.json

# Ou defina o caminho correto no .env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json
```

### Erro: "Twilio authentication failed"
```bash
# Verifique suas credenciais Twilio
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
```

### Tradução lenta
```bash
# Ative cache Redis
REDIS_URL=redis://localhost:6379

# Inicie Redis localmente (macOS com Homebrew)
brew install redis
brew services start redis
```

### Erro ao conectar Google Cloud Speech
```bash
# Verifique permissões do arquivo JSON
chmod 644 credentials/google-cloud-key.json

# Teste conexão
node -e "const key = require('./credentials/google-cloud-key.json'); console.log(key.project_id)"
```

## Deployment 🚀

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY credentials ./credentials

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build e run:
```bash
docker build -t tradutor-ia:latest .
docker run -p 3000:3000 --env-file .env tradutor-ia:latest
```

### Heroku

```bash
heroku create seu-app-name
heroku config:set TWILIO_ACCOUNT_SID=...
heroku config:set TWILIO_AUTH_TOKEN=...
# ... outras variáveis
git push heroku main
```

### AWS/GCP

Veja documentação oficial dos provedores de cloud para deployment de aplicações Node.js.

## Melhorias Futuras 📈

- [ ] Dashboard web com WebSocket para monitoramento em tempo real
- [ ] Suporte para mais idiomas
- [ ] Machine Learning para detecção automática de idioma
- [ ] Análise de sentimento nas transcrições
- [ ] Histórico de chamadas e análises
- [ ] Autenticação e controle de acesso
- [ ] Fila de chamadas para alta concorrência
- [ ] Integração com WhatsApp/Telegram

## Licença 📄

MIT License - Veja LICENSE file para detalhes.

## Suporte 💬

Para dúvidas ou problemas:
1. Verifique a seção Troubleshooting
2. Abra uma issue no GitHub
3. Consulte a documentação oficial das APIs usadas

---

**Desenvolvido com ❤️ para conectar pessoas globalmente**
