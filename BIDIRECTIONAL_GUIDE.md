# Guia Completo: Tradução Bidirecional 🔄

## Visão Geral

Seu **Tradutor IA agora é 100% bidirecional**!

```
VOCÊ (PT-BR)  ←→  AMERICANO (EN-US)

Você fala:     "Olá, tudo bem?"
Ele ouve:      "Hello, how are you?"

Ele fala:      "I'm fine, thank you!"
Você ouve:     "Estou bem, obrigado!"

Ambos falam na PRÓPRIA língua nativa ✅
Ambos ouvem a tradução do outro ✅
```

## Fluxo Técnico Bidirecional

```
┌─────────────────────────────────────────────┐
│         PARTICIPANTE 1 (PT-BR)              │
│              Você no Brasil                  │
└────────────────────┬────────────────────────┘
                     │
            Fala em português
                     │
                     ▼
        ┌────────────────────────┐
        │  1. Speech-to-Text     │
        │  (seu áudio → texto)   │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  2. Auto-Detect Lang   │
        │  Detecta: português ✓  │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  3. Tradução Gemini    │
        │  PT → EN (com cache)   │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  4. Text-to-Speech     │
        │  (texto EN → áudio EN) │
        └────────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│      PARTICIPANTE 2 (EN-US)                 │
│         Americano nos EUA                    │
│                                              │
│    Ele OUVE sua voz traduzida em INGLÊS    │
└──────────────────┬──────────────────────────┘
                   │
          Fala em inglês
                   │
                   ▼
        ┌────────────────────────┐
        │  1. Speech-to-Text     │
        │  (áudio dele → texto)  │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  2. Auto-Detect Lang   │
        │  Detecta: inglês ✓     │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  3. Tradução Gemini    │
        │  EN → PT (com cache)   │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  4. Text-to-Speech     │
        │  (texto PT → áudio PT) │
        └────────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│      VOCÊ OUVE a voz dele traduzida         │
│              em PORTUGUÊS                    │
└─────────────────────────────────────────────┘
```

## Detecção Automática de Idioma

### Como Funciona

1. **Primeiro: Pattern Matching (GRÁTIS)**
   ```typescript
   // Detecta automaticamente por caracteres especiais
   "Olá" → PT-BR (ã, ó detectados)
   "Hello" → EN-US (sem caracteres especiais)
   "¿Hola?" → ES-ES (¿ detectado)
   ```

2. **Se Pattern Falhar: Gemini API (Barato)**
   ```typescript
   // Fallback para Gemini apenas se necessário
   // Custo: ~$0.001 por detecção
   ```

## Endpoints da API Bidirecional

### 1. Iniciar Chamada Bidirecional

```bash
POST /api/bidirectional/initiate
```

**Request:**
```json
{
  "participant1Number": "+5511987654321",
  "participant2Number": "+14155552671",
  "participant1Name": "João",
  "participant2Name": "John"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-session-id",
    "callSid": "CA1234567890...",
    "instructions": {
      "participant1": "João - Fale em português, você ouvirá inglês",
      "participant2": "John - Speak in English, você ouvirá em português"
    }
  }
}
```

### 2. Processar Áudio Bidirecional

```bash
POST /api/bidirectional/process-audio/{sessionId}/{fromParticipant}
```

**fromParticipant:** `1` ou `2`

**Request:**
```
Body: Buffer de áudio (raw WAV)
Content-Type: audio/wav
```

**Response:**
```
Body: Áudio traduzido (WAV)
Content-Type: audio/wav
```

**Exemplo:**
```bash
# Participante 1 fala - gera áudio para participante 2 ouvir
curl -X POST http://localhost:3000/api/bidirectional/process-audio/session-123/1 \
  --data-binary @audio-p1.wav \
  -H "Content-Type: audio/wav" \
  > audio-para-p2.wav

# Participante 2 fala - gera áudio para participante 1 ouvir
curl -X POST http://localhost:3000/api/bidirectional/process-audio/session-123/2 \
  --data-binary @audio-p2.wav \
  -H "Content-Type: audio/wav" \
  > audio-para-p1.wav
```

### 3. Obter Detalhes da Chamada

```bash
GET /api/bidirectional/call/{sessionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "status": "active",
    "participants": {
      "participant1": {
        "number": "+5511987654321",
        "name": "João",
        "language": "pt-BR"
      },
      "participant2": {
        "number": "+14155552671",
        "name": "John",
        "language": "en-US"
      }
    },
    "duration": {
      "durationSeconds": 125,
      "startTime": "2026-03-07T10:30:00Z"
    },
    "statistics": {
      "translations": 15,
      "errors": 0,
      "averageLatencyMs": 1200,
      "dataProcessedKB": "245.50"
    },
    "recentTranslations": {
      "p1ToP2": [
        {
          "original": "Olá, tudo bem?",
          "translated": "Hello, how are you?",
          "latency": 1250
        }
      ],
      "p2ToP1": [
        {
          "original": "I'm fine, thank you!",
          "translated": "Estou bem, obrigado!",
          "latency": 1180
        }
      ]
    }
  }
}
```

### 4. Completar Chamada

```bash
POST /api/bidirectional/call/{sessionId}/complete
```

**Response:**
```json
{
  "success": true,
  "message": "Call completed",
  "data": {
    "sessionId": "uuid-here",
    "status": "completed",
    "duration": "125.45",
    "statistics": {
      "translationsExecuted": 15,
      "translationErrors": 0,
      "averageLatency": 1200,
      "audioProcessed": 251392
    }
  }
}
```

### 5. Estatísticas do Servidor

```bash
GET /api/bidirectional/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "activeCalls": 3,
    "totalCompleted": 27,
    "totalTranslations": 450,
    "averageCallDuration": 180
  },
  "activeCalls": [
    {
      "sessionId": "uuid1",
      "participant1": "João",
      "participant2": "John",
      "duration": 45000,
      "languages": "pt-BR ↔ en-US",
      "translations": 12,
      "latency": 1150
    }
  ]
}
```

## Exemplo Completo: Chamada Brasil → EUA

### Step 1: Iniciar Chamada

```bash
curl -X POST http://localhost:3000/api/bidirectional/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "participant1Number": "+5511987654321",
    "participant2Number": "+14155552671",
    "participant1Name": "João",
    "participant2Name": "John"
  }'

# Response:
# {
#   "sessionId": "abc-123-def",
#   "callSid": "CA1234567890"
# }
```

### Step 2: João fala em Português

```bash
# Gravar áudio de João em português
# Arquivo: joao-audio.wav

# Enviar ao servidor
curl -X POST http://localhost:3000/api/bidirectional/process-audio/abc-123-def/1 \
  --data-binary @joao-audio.wav \
  -H "Content-Type: audio/wav" \
  -o john-ouve.wav

# john-ouve.wav contém a voz de João traduzida para INGLÊS
# John recebe: "Hello, how are you?" (sua voz em inglês)
```

### Step 3: John responde em Inglês

```bash
# Gravar resposta de John em inglês
# Arquivo: john-audio.wav

# Enviar ao servidor
curl -X POST http://localhost:3000/api/bidirectional/process-audio/abc-123-def/2 \
  --data-binary @john-audio.wav \
  -H "Content-Type: audio/wav" \
  -o joao-ouve.wav

# joao-ouve.wav contém a voz de John traduzida para PORTUGUÊS
# João recebe: "Estou bem, obrigado!" (voz dele em português)
```

### Step 4: Monitorar Chamada

```bash
# Ver detalhes em tempo real
curl http://localhost:3000/api/bidirectional/call/abc-123-def

# Output mostra:
# - Ambas as línguas detectadas
# - Histórico de traduções
# - Latência média
# - Erros (se houver)
```

### Step 5: Completar Chamada

```bash
curl -X POST http://localhost:3000/api/bidirectional/call/abc-123-def/complete

# Retorna estatísticas finais da chamada
```

## Idiomas Suportados Automaticamente

A **detecção automática** funciona para:

| Idioma | Código | Exemplo |
|--------|--------|---------|
| 🇧🇷 Português (Brasil) | `pt-BR` | "Olá, tudo bem?" |
| 🇺🇸 Inglês (EUA) | `en-US` | "Hello, how are you?" |
| 🇪🇸 Espanhol | `es-ES` | "¿Hola, qué tal?" |
| 🇲🇽 Espanhol (México) | `es-MX` | "¿Hola, qué tal?" |
| 🇫🇷 Francês | `fr-FR` | "Bonjour, comment allez-vous?" |
| 🇩🇪 Alemão | `de-DE` | "Hallo, wie geht es dir?" |
| 🇮🇹 Italiano | `it-IT` | "Ciao, come stai?" |

## Latência Esperada

Por chamada bidirecional:

```
P1 fala (João em PT-BR):
├─ Speech-to-Text:      300-500ms
├─ Auto-detect lang:    50-100ms (cache) ou 200ms (Gemini)
├─ Tradução:            400-800ms (cache) ou 800-1500ms (API)
├─ Text-to-Speech:      500-800ms
└─ Total:               ~1200-2800ms (melhor com cache)

P2 ouve em EN-US:       ~1500-3000ms após P1 falar
```

## Otimizações Ativas

O sistema automaticamente:

✅ **Cacheia traduções** - evita API calls duplicadas
✅ **Detecta idioma por padrão** - 80% grátis
✅ **Usa Gemini Flash** - 96% mais barato que Pro
✅ **Monitora latência** - reajusta automaticamente
✅ **Armazena histórico** - para análise pós-chamada

## Troubleshooting

### "Language not detected"
```json
{
  "error": "Language detection failed",
  "suggestion": "Specify languages manually or use longer text samples"
}
```

**Solução:** Enviar mais texto para detecção melhorar

### "Translation timeout"
```json
{
  "error": "Translation took too long (>3s)"
}
```

**Solução:** Verificar conexão com Gemini API

### "Audio processing error"
```json
{
  "error": "Failed to process audio",
  "details": "Invalid audio format"
}
```

**Solução:** Enviar áudio em formato WAV/PCM

## Performance Tips

1. **Use cache agressivo** para frases comuns
2. **Envie áudio em stereo** para melhor detecção de voz
3. **Limpe sessões** após conclusão (`POST .../complete`)
4. **Monitore latência** via `/stats`
5. **Use conexão HTTPS** para segurança

## Próximas Melhorias

- [ ] Suporte para mais de 2 participantes
- [ ] Conference calling (3+ pessoas)
- [ ] Recording e playback de chamadas
- [ ] Análise de sentimento
- [ ] Dicionário customizado por usuário
- [ ] Histórico persistente em banco de dados

---

**Seu sistema bidirecional está PRONTO! 🎉**

Comece uma chamada Portugal ↔ Brasil agora!
