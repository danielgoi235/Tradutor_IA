# Configuração Internacional: Europa e EUA 🌍

Guia completo para usar o Tradutor IA Real-Time em chamadas entre Brasil, Europa e EUA.

## Números de Telefone Internacionais 📞

### Formatos Corretos

| Região | Código | Exemplo | Formato |
|--------|--------|---------|---------|
| 🇧🇷 Brasil | +55 | +5511987654321 | +55(DDD)9NNNNN-NNNN |
| 🇺🇸 EUA | +1 | +14155552671 | +1(XXX)NNN-NNNN |
| 🇬🇧 UK | +44 | +442071838750 | +44(0)XXX XXX XXXX |
| 🇩🇪 Alemanha | +49 | +491234567890 | +49(0)XXX XXXXXXX |
| 🇫🇷 França | +33 | +33123456789 | +33(0)X XXXX XXXX |
| 🇮🇹 Itália | +39 | +39611234567 | +39 XXXX XXXXX |
| 🇪🇸 Espanha | +34 | +34911234567 | +34 XXX XX XX XX |

## Pares de Idiomas Recomendados

### Brasil ↔ USA
```json
{
  "sourceLanguage": "pt-BR",
  "targetLanguage": "en-US"
}
```

### Brasil ↔ Europa (Português)
```json
{
  "sourceLanguage": "pt-BR",
  "targetLanguage": "pt-PT"  // Portugal - requer config adicional
}
```

### Brasil ↔ Espanha
```json
{
  "sourceLanguage": "pt-BR",
  "targetLanguage": "es-ES"
}
```

### EUA ↔ Europa
```json
{
  "sourceLanguage": "en-US",
  "targetLanguage": "fr-FR"  // ou de-DE, it-IT
}
```

## Configuração Regional com Twilio

### 1. Números Twilio por Região

#### Conta Twilio USA
```env
TWILIO_PHONE_NUMBER=+1-800-TRANSLATE  # Número USA
TWILIO_REGION=us-east-1
```

#### Expandir para Europa
```bash
# Adicionar números locais na Dashboard do Twilio
# Vá para: Phone Numbers > Buy a Number
# Selecione país: UK, Alemanha, França, Itália, Espanha
```

### 2. Configurar Webhook Base URL

Para chamadas internacionais, você precisa de um IP/domínio acessível globalmente:

```env
# Desenvolvimento (local)
WEBHOOK_BASE_URL=http://localhost:3000

# Produção (recomendado)
WEBHOOK_BASE_URL=https://seu-dominio.com
# ou
WEBHOOK_BASE_URL=https://seu-app.ngrok.io  # Para testes rápidos
```

#### Usar ngrok para Testes Rápidos
```bash
# Instale ngrok
brew install ngrok  # macOS
# ou
choco install ngrok  # Windows

# Exponha seu servidor localmente
ngrok http 3000

# Copie o URL fornecido (ex: https://abc123.ngrok.io)
export WEBHOOK_BASE_URL=https://abc123.ngrok.io
npm run dev
```

### 3. Configurar Regiões de Latência Baixa

```env
# Para chamadas Brasil → EUA
TWILIO_REGION=us-east-1
GOOGLE_REGION=us-central1

# Para chamadas Brasil → Europa
# Você pode rotear via múltiplos provedores ou usar CDN
```

## Exemplo: Chamada Brasil → EUA

### 1. Setup Inicial

```bash
# Clone e configure
git clone ...
cd tradutor-ia-real
npm install
npm run build

# Configure .env para EUA
echo "
TWILIO_PHONE_NUMBER=+1234567890
WEBHOOK_BASE_URL=https://seu-dominio.com
GEMINI_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=...
" > .env

npm start
```

### 2. Iniciar Chamada PT-BR → EN-US

```bash
curl -X POST https://seu-dominio.com/api/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "toNumber": "+14155552671",           # Telefone nos EUA
    "fromNumber": "+5511987654321",       # Seu telefone no Brasil
    "sourceLanguage": "pt-BR",
    "targetLanguage": "en-US"
  }'
```

### 3. Resultado

```json
{
  "success": true,
  "data": {
    "callSid": "CA1234567890...",
    "sessionId": "uuid-here"
  }
}
```

## Exemplo: Chamada EUA → Europa

### 1. Suportar Múltiplos Idiomas Europeus

```env
# Adicione suporte para francês
SUPPORTED_LANGUAGES=pt-BR,en-US,es-ES,fr-FR,de-DE,it-IT
```

### 2. Iniciar Chamada EN-US → FR-FR

```bash
curl -X POST https://seu-dominio.com/api/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "toNumber": "+33123456789",           # Telefone na França
    "fromNumber": "+14155552671",         # Telefone nos EUA
    "sourceLanguage": "en-US",
    "targetLanguage": "fr-FR"
  }'
```

## Otimizações para Chamadas Internacionais

### 1. Reduzir Latência

```typescript
// No arquivo config.ts, adicione:
export const latencyOptimization = {
  // Cache global de traduções
  cacheEnabled: true,
  cacheTTL: 86400, // 24 horas

  // Usar CDN mais próximo
  speechRegion: 'auto', // Google Cloud seleciona automaticamente

  // Timeout agressivo
  speechToTextTimeout: 5000,
  translationTimeout: 3000,
  textToSpeechTimeout: 5000,
};
```

### 2. Melhorar Qualidade de Áudio

```env
# Adicione ao .env
AUDIO_ENCODING=LINEAR16
SAMPLE_RATE=16000
CHANNELS=1
BIT_RATE=128000
```

### 3. Roteamento Inteligente

```typescript
// Use este código para rotear automaticamente
async function getOptimalRegion(fromCountry: string, toCountry: string): Promise<string> {
  const regionMap: {[key: string]: string} = {
    "BR-US": "us-east-1",
    "BR-EU": "europe-west1",
    "US-EU": "europe-west1",
    "EU-EU": "europe-west1",
  };

  const key = `${fromCountry}-${toCountry}`;
  return regionMap[key] || "auto";
}
```

## Custos e Limitações 💰

### Twilio
- **Chamadas internacionais:** ~$0.05-$0.50/min (varia por país)
- **SMS:** ~$0.05-$0.10 por mensagem
- **Limite gratuito:** $15/mês com free tier

### Google Cloud
- **Speech-to-Text:** $0.006 por 15 segundos de áudio
- **Text-to-Speech:** $0.004 por 1.000 caracteres
- **Free tier:** 60 minutos/mês

### Gemini API
- **Chamadas:** ~$0.00035 por 1K entrada / $0.0105 por 1K saída
- **Free tier:** 15 requisições por minuto

## Troubleshooting Internacional 🔧

### Problema: Números não reconhecidos

```bash
# Valide o formato antes de enviar
# Use biblioteca: libphonenumber-js
npm install libphonenumber-js

# Validar
import { parsePhoneNumber } from 'libphonenumber-js';
const phone = parsePhoneNumber('+5511987654321', 'BR');
console.log(phone.isValid()); // true
```

### Problema: Latência alta

```bash
# 1. Use ngrok premium para conexão mais estável
ngrok http --region eu 3000  # Para Europa

# 2. Implemente fila de processamento
npm install bull
# Ver docs em: src/services/queueService.ts (não incluído)

# 3. Use cache Redis agressivo
REDIS_URL=redis://seu-redis-cloud.com:port
```

### Problema: Áudio entrecortado

```env
# Aumentar buffer de áudio
AUDIO_BUFFER_SIZE=4096
AUDIO_SAMPLE_RATE=44100  # Aumentar de 16000
```

## Monitoramento de Chamadas Globais 📊

```bash
# Endpoint para monitorar chamadas por região
curl https://seu-dominio.com/api/calls/stats

# Resposta incluirá:
{
  "stats": {
    "activeCalls": 5,
    "totalSessions": 1250
  },
  "activeSessions": [
    {
      "sessionId": "...",
      "from": "+5511987654321",
      "to": "+14155552671",
      "duration": 120000,
      "languages": "pt-BR → en-US"
    }
  ]
}
```

## Dashboard Web (Próximo Passo)

Para melhor visualização global:

```bash
# Crie um dashboard React/Vue
npm install express-static-serve
# Configurar em: src/middleware/static.ts

# Rota para frontend
app.use(express.static('public'));
```

## Resumo: Passo a Passo Brasil → EUA

1. ✅ Clone o repositório
2. ✅ Configure credenciais (Twilio, Google Cloud, Gemini)
3. ✅ Configure webhook URL (ngrok ou domínio)
4. ✅ Instale dependências: `npm install`
5. ✅ Build: `npm run build`
6. ✅ Inicie: `npm start`
7. ✅ Teste: `curl /api/calls/test-translation`
8. ✅ Faça uma chamada: `POST /api/calls/initiate`
9. ✅ Monitore: `GET /api/calls/stats`

---

**Pronto para conectar globalmente!** 🌐
