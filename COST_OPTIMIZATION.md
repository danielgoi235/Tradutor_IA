# Otimização de Custo-Benefício 💰

Estratégias para reduzir custos mantendo qualidade máxima.

## Análise de Custos Atuais

### Sem Otimização (Baseline)
```
1 chamada de 10 minutos com tradução bidirecional:

- Twilio:           $0.10 (10 min × $0.01/min)
- Google Speech:    $0.12 (120s ÷ 15s × $0.006 × 2 directions)
- Google TTS:       $0.40 (4000 chars ÷ 1000 × $0.004 × 2 directions)
- Gemini API:       $0.05 (50 requests × $0.001/request)
─────────────────────────────────
Total por chamada:  ~$0.67
Custo mensal (100 chamadas): ~$67
```

## Estratégias de Otimização

### 1️⃣ Cache Agressivo (SALVA 60-80% em Tradução)

```env
# .env
REDIS_ENABLED=true
REDIS_TTL=604800  # 7 dias
CACHE_STRATEGY=aggressive  # Cachear tudo
```

**Economia:**
- Mesmas frases = $0 (cache hit)
- 70% repetição típica = -70% Gemini costs
- 100 chamadas/mês: -$35 em custos Gemini

### 2️⃣ Detecção de Idioma Livre (SALVA 100% na Detecção)

```typescript
// Usar pattern matching ANTES de chamar Gemini API
await detectLanguageByPattern(text); // GRÁTIS
// Fallback para Gemini APENAS se pattern falhar
```

**Economia:**
- 80% de textos detectados por padrão (sem custos)
- 20% require Gemini (~$0.001 cada)
- 100 chamadas: -$16 em custos de detecção

### 3️⃣ Agrupar Traduções (SALVA 30% em API Calls)

```typescript
// Ao invés de 10 frases = 10 chamadas Gemini
// Agrupe em 2-3 chamadas
const batchTranslate = [
  "Olá",
  "Como você está?",
  "Tudo bem?"
].join(" | ");

await translatorService.translate({
  text: batchTranslate,
  sourceLanguage: "pt-BR",
  targetLanguage: "en-US"
});
```

**Economia:**
- Reduz chamadas API de 100 para 30-40 por mês
- Custo Gemini: ~$20 em vez de ~$50
- **Economia: -$30/mês**

### 4️⃣ Usar Google Cloud Lite (SALVA 50% em Speech)

```env
# Usar opus-mini do Google ao invés de padrão
SPEECH_MODEL=google-cloud-lite
TTS_BITRATE=8000  # ao invés de 16000
```

**Economia:**
- Speech-to-Text: de $0.006 para $0.003 (50% off)
- 10 chamadas: -$0.06
- 100 chamadas/mês: -$6

### 5️⃣ Compressão de Áudio (SALVA 40% em Upload)

```typescript
// Comprimir áudio ANTES de enviar ao Twilio
import { compress } from 'audio-compression-lib';

const compressed = await compress(audioBuffer, {
  codec: 'opus',     // Melhor taxa de compressão
  bitrate: 32000,
});
```

**Economia:**
- Reduz uso de bandwidth (não há limite direto, mas otimiza)
- Acelera processamento (menos bytes = mais rápido)

### 6️⃣ Usar Gemini Flash (SALVA 80% em Tradução)

```env
# Usar Gemini Flash ao invés de Pro
GEMINI_MODEL=gemini-2.0-flash  # 80% mais barato que Pro
GEMINI_TEMPERATURE=0.3  # Menos variação = menos retentativas
```

**Comparação:**
```
Gemini Pro:   $0.0005/1k tokens
Gemini Flash: $0.00001875/1k tokens = 96% desconto! 🎉
```

**Economia:**
- 100 chamadas × 1000 tokens = -$49/mês
- **Maior economia disponível!**

## Plano Otimizado para 100 Chamadas/Mês

### Combinando Estratégias

```
Baseline:                          $67.00
─────────────────────────────────
- Cache agressivo (60% hit):     -$35.00
- Detecção sem API (80%):        -$16.00
- Batch translate (30% reduction): -$15.00
- Google Cloud Lite:              -$6.00
- Gemini Flash model:            -$49.00
─────────────────────────────────
Total Otimizado:                  $-54.00 ← IMPOSSÍVEL ❌
```

### Plano Realista

```
Baseline:                         $67.00
─────────────────────────────────
- Cache agressivo (60%):        -$21.00  ✅
- Detecção padrão:              -$2.00   ✅
- Gemini Flash model:           -$45.00  ✅
- Google Cloud Lite:            -$3.00   ✅
─────────────────────────────────
Total Otimizado:                 $-4.00
Custo Final:                      ~$10/mês! 🎉
```

## Implementação das Otimizações

### 1. Configurar Gemini Flash

```env
# .env
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your_key_here
GEMINI_TEMPERATURE=0.2  # Mais determinístico
GEMINI_MAX_TOKENS=200   # Limite output para economizar
```

### 2. Ativar Cache Agressivo

```typescript
// src/config.ts
export const cacheConfig = {
  enabled: true,
  strategy: 'aggressive',  // Cachear TUDO
  ttl: 604800,            // 7 dias
  compressionEnabled: true, // Comprimir cache
};
```

### 3. Detecção Inteligente

```typescript
// src/services/translator.ts
// Usar detectLanguageByPattern PRIMEIRO
const detected = await detectLanguageByPattern(text);
if (!detected) {
  // Fallback para Gemini (custo apenas se necessário)
  return await geminiDetect(text);
}
```

### 4. Batch Requests

```typescript
// Agrupar múltiplas traduções
async translateBatch(phrases: string[]) {
  const combined = phrases.join(" | ");
  const result = await translate(combined);
  return result.split(" | ");
}
```

## Monitoramento de Custos

### Dashboard de Custos (TODO)

```bash
# Adicionar endpoint para trackear custos
GET /api/costs/dashboard

{
  "currentMonth": {
    "gemini": $12.50,
    "google_cloud": $8.30,
    "twilio": $25.00,
    "total": $45.80
  },
  "projectedMonth": $45.80,
  "dailyAverage": $1.53,
  "estimatedSavings": {
    "from_cache": $21.00,
    "from_batch": $5.50,
    "total": $26.50
  }
}
```

## Alternativas Mais Baratas

Se custos ainda forem altos, considere:

### Para Tradução
| Serviço | Custo | Qualidade | Suporte |
|---------|-------|-----------|---------|
| Gemini Flash | $0.04/1M | ⭐⭐⭐⭐⭐ | Excelente |
| OpenAI GPT-3.5 | $0.50/1M | ⭐⭐⭐⭐ | Bom |
| LibreTranslate | GRÁTIS | ⭐⭐⭐ | Comunitário |
| Google Cloud Translate | $20/1M | ⭐⭐⭐⭐ | Excelente |

### Para Speech-to-Text
| Serviço | Custo | Qualidade |
|---------|-------|-----------|
| Google Cloud | $0.006/15s | ⭐⭐⭐⭐⭐ |
| Azure Speech | $0.004/10s | ⭐⭐⭐⭐ |
| Deepgram | $0.0059/min | ⭐⭐⭐⭐ |
| Whisper (OpenAI) | $0.02/min | ⭐⭐⭐⭐ |

## Free Tier Máximo

Se usar APENAS free tiers:

```
- Twilio:         15 USD/mês free
- Google Cloud:   $300/mês free (1º ano)
- Gemini API:     60 reqs/min free
- Azure Cognitive: $0.50 free (limitado)
─────────────────────────────────
Total possível com free tier: ~100+ chamadas/mês
Custo: GRÁTIS! 🎉
```

## Recomendação Final

### Para Volume Pequeno (<10 chamadas/dia)

1. ✅ Use **free tiers** enquanto durar
2. ✅ Ative **cache agressivo** (economiza 60-80%)
3. ✅ Use **Gemini Flash** (quando sair do free tier)
4. ✅ Implemente **detecção padrão** (80% grátis)

**Custo estimado: $5-15/mês**

### Para Volume Médio (10-100 chamadas/dia)

1. ✅ Usar **Gemini Flash** (mais barato)
2. ✅ **Cache Redis** (crítico)
3. ✅ **Batch requests** (importante)
4. ✅ **Google Cloud Lite**

**Custo estimado: $50-150/mês**

### Para Volume Alto (100+ chamadas/dia)

1. ✅ Contatar **Google Cloud Sales** para desconto corporativo
2. ✅ **Twilio Enterprise** (desconto em volume)
3. ✅ Implementar **load balancing** multi-região
4. ✅ **CDN + Edge computing** para latência baixa

**Custo estimado: $500-2000+/mês (com descontos)**

---

**Com as otimizações acima, você pode rodar o tradutor por ~$10-50/mês em vez de $60+!** 💰

