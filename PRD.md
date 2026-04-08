# 📋 PRD - Reunião Internacional com Tradução Simultânea

**Status:** APROVADO | **Versão:** 1.0 | **Data:** 2026-04-08

---

## 1. VISÃO & OBJETIVOS

### O que é?
Uma aplicação web **Serverless** de comunicação **Peer-to-Peer (P2P)** focada na **tradução simultânea de voz em tempo real**.

Utiliza:
- **WebRTC** para transmissão de áudio e dados descentralizada
- **Web Speech API** para transcrição (Speech-to-Text) e síntese (Text-to-Speech) nativas do navegador
- **LLM (Google Gemini)** para tradução contextual
- **Firebase Firestore** para sinalização e troca de ofertas SDP/ICE

### Para quem?
Profissionais, gestores de negócios, engenheiros e equipes distribuídas globalmente que precisam conduzir reuniões técnicas ou comerciais ultrapassando a barreira do idioma.

### Por quê?
- 💰 Reduzir custos operacionais com intérpretes
- ⚡ Eliminar atrasos em negociações internacionais
- 🔒 Comunicação privada (P2P descentralizado, sem servidor de áudio)
- 🌐 Sem dependência de backend em Node.js alocado

---

## 2. REQUISITOS FUNCIONAIS (FR)

### FR-1: Sinalização e Gestão de Salas (Handshake)
O sistema deve permitir:
- ✅ Criar salas seguras gerando códigos alfanuméricos únicos (ex: `A1B2C3D4`)
- ✅ Troca de ofertas (SDP) e candidatos ICE via **Firebase Firestore em tempo real**
- ✅ Isolamento total entre salas (sem cruzamento de dados)
- ✅ Limpeza automática de salas vazias após 30 minutos

**Aceita quando:**
- [ ] Dois navegadores em redes distintas trocam SDP com sucesso
- [ ] Firestore propaga mudanças em < 500ms
- [ ] Código de sala é único e reusável por nova sessão

---

### FR-2: Controle de Idiomas Independente
O usuário deve poder:
- ✅ Selecionar seu **idioma de fala** (entrada) - como ele fala
- ✅ Selecionar seu **idioma de saída** - como deseja ouvir a tradução
- ✅ Não depender da configuração da outra ponta
- ✅ Mudar idiomas durante a chamada

**Suporta idiomas:**
```
pt-BR (Português Brasil)
en-US (English USA)
es-ES (Español)
fr-FR (Français)
de-DE (Deutsch)
zh-CN (中文)
ja-JP (日本語)
```

**Aceita quando:**
- [ ] Usuário A fala português, usuário B ouve em inglês (simultaneamente o oposto)
- [ ] Trocar idioma durante chamada ativa sem reset de conexão

---

### FR-3: Captura e Transcrição Contínua (STT)
O sistema deve:
- ✅ Capturar áudio do microfone do usuário via `navigator.mediaDevices.getUserMedia()`
- ✅ Transcrever frases em tempo real usando **Web Speech API** (com fallback para Google Cloud Speech-to-Text se necessário)
- ✅ Emitir gatilhos **ao final de cada sentença completa** (detecção de silêncio ~1.5 segundos)
- ✅ Exibir feedback visual de "gravando..." vs. "processando..."

**Aceita quando:**
- [ ] Usuário fala 5 frases diferentes, todas são transcritas com acurácia > 90%
- [ ] Silêncios entre frases são detectados corretamente (não corta no meio)
- [ ] Transcrição aparece na UI em < 200ms

---

### FR-4: Transmissão P2P de Dados
O sistema deve:
- ✅ Empacotar texto transcrito localmente em JSON com metadados
- ✅ Enviar **instantaneamente** via **WebRTC RTCDataChannel** (não Socket.io)
- ✅ Garantir entrega ordenada (não perder pacotes)
- ✅ Suportar múltiplos data channels para áudio e dados separados

**Payload exemplo:**
```json
{
  "from": "usuario_A",
  "lang": "pt-BR",
  "text": "Olá, tudo bem?",
  "timestamp": 1712600000000,
  "sequence": 1
}
```

**Aceita quando:**
- [ ] Pacote viaja de A para B em < 100ms
- [ ] Nenhum pacote é perdido (verificação de sequence)
- [ ] Ordem é mantida mesmo com latência alta

---

### FR-5: Tradução por Inteligência Artificial
O sistema deve:
- ✅ Ao receber texto via DataChannel, solicitar **tradução assíncrona** para Google Gemini API
- ✅ Incluir contexto da conversa anterior (últimas 5 mensagens)
- ✅ Traduzir respeitando formatação original (pontuação, maiúsculas)
- ✅ Implementar cache local para evitar re-traduzir mesmas frases

**Prompt de exemplo:**
```
Contexto anterior:
[mensagens das últimas 30s]

Traduz de pt-BR para en-US:
"Olá, tudo bem?"

Responde apenas com a tradução.
```

**Aceita quando:**
- [ ] Tradução tem acurácia > 95% em 5 frases teste
- [ ] Latência Gemini < 2 segundos (incluindo rede)
- [ ] Cache reduz latência para < 100ms em repeats

---

### FR-6: Síntese de Voz (TTS)
O sistema deve:
- ✅ Após tradução, sintetizar áudio usando **Web Speech API** (SpeechSynthesis API nativa)
- ✅ Usar vozes nativas do navegador no idioma correto
- ✅ Reproduzir automaticamente sem clique do usuário
- ✅ Suportar pausas naturais em pontuação

**Aceita quando:**
- [ ] Áudio sintetizado é reproduzido em < 1 segundo após tradução
- [ ] Qualidade é inteligível (não robótica, natural)
- [ ] Simultaneamente: Usuário A fala → B traduz e ouve, enquanto A ouve tradução de B

---

### FR-7: Closed Captions (UI)
A interface deve:
- ✅ Exibir **transcrição local** do usuário (lado esquerdo)
- ✅ Exibir **tradução remota** recebida (lado direito)
- ✅ Funcionarem como log da reunião
- ✅ Permitir copiar/exportar histórico

**Layout:**
```
┌──────────────────────────────────────┐
│      VOCÊ                 │  ELE     │
├──────────────────────────────────────┤
│ Olá, tudo bem?     │ Hi, how are you? │
│ Como está?        │ I'm fine, thanks   │
└──────────────────────────────────────┘
```

**Aceita quando:**
- [ ] Captions aparecem em < 500ms após fala
- [ ] Histórico é exportável como PDF/TXT

---

### FR-8: Gerenciamento de Mídia
O sistema deve suportar:
- ✅ **Mute/Unmute** - silenciar microfone sem desconectar
- ✅ **Ativar/Desativar Tradução** - pausar processamento de IA
- ✅ **Hangup Gracioso** - encerrar chamada limpa
  - Destruir instâncias WebRTC
  - Remover listeners do Firestore
  - Liberar dispositivos de áudio
- ✅ **Reconexão automática** se houver queda temporária

**Aceita quando:**
- [ ] Clicar "Desligar" encerra chamada em < 1 segundo
- [ ] Dispositivos de áudio são liberados (pode usar em outra aba)
- [ ] Reconexão automática em < 5 segundos se rede falhar

---

## 3. REQUISITOS NÃO-FUNCIONAIS (NFR)

### NFR-1: Latência
- **P2P Audio/Data:** Atraso < **200ms** entre captura em A e recebimento em B
- **Processamento IA:** Transmissão → Tradução LLM → Síntese TTS ≤ **2-3 segundos** por frase curta
- **Total User-facing:** Usuário fala → outro ouve: **< 3 segundos**

**Métrica de sucesso:**
- [ ] Teste de latência com 10 pares mostra média < 200ms P2P
- [ ] Teste de ponta-a-ponta mostra < 3s para frase completa

---

### NFR-2: Arquitetura Serverless & Custo
- ✅ **Zero backend em Node.js alocado** - apenas Firebase Functions (pay-per-use)
- ✅ WebRTC roda 100% no cliente (Browser)
- ✅ STT/TTS rodam no navegador (Web Speech API grátis)
- ✅ Apenas sinalização (SDP/ICE) passa por Firestore

**Modelo de custo:**
```
Firebase Firestore: $0.06 por 100k leituras (~$2/mês para 3M sessões)
Gemini API: $0.05/M input tokens (~$5/mês para 100h conversa)
TOTAL: < $10/mês para startup, escalável
```

**Aceita quando:**
- [ ] Zero custos com servidor Node.js
- [ ] Deploy no Firebase Hosting (grátis até 10GB)

---

### NFR-3: Segurança (E2EE)
- ✅ **DTLS-SRTP nativa:** Audio stream criptografado via protocolo WebRTC
- ✅ **RTCDataChannel:** Usa SCTP-over-DTLS (ponta-a-ponta criptografado)
- ✅ **Sem intermediário:** Nenhum servidor vê áudio/dados (apenas sinalização em texto)
- ✅ **Certificados**: Verificação automática via DTLS handshake

**Aceita quando:**
- [ ] Wireshark packet capture não pode ler áudio (criptografado)
- [ ] DTLS handshake bem-sucedido em teste

---

### NFR-4: Resiliência de Rede (NAT Traversal)
- ✅ **Servidores STUN públicos:** Google, Cloudflare, OpenStun
- ✅ **Fallback TURN:** Twilio/Metered.ca para redes corporativas restritas
- ✅ **Détection de IP local + IP público** (host candidates)
- ✅ **Suportar VPN, Proxy corporativo, redes 4G instáveis**

**Configuração STUN/TURN:**
```javascript
const iceServers = [
  // STUN (grátis, funciona 80% dos casos)
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  // TURN (pago, para casos especiais)
  {
    urls: ['turn:turnserver.example.com:3478'],
    username: 'user',
    credential: 'pass'
  }
];
```

**Aceita quando:**
- [ ] Teste: Usuário em rede corporativa VPN consegue conectar
- [ ] Teste: Usuário em 4G consegue conectar
- [ ] Teste: Sim fallback TURN é usado quando necessário

---

### NFR-5: Concorrência e Isolamento
- ✅ Múltiplas sessões simultâneas **sem cruzamento de dados**
- ✅ Cada sala tem seu próprio documento Firestore
- ✅ ICE Candidates isolados por `roomId`
- ✅ Suportar **100+ salas ativas simultâneas** sem degradação

**Estrutura Firestore:**
```
rooms/
  ├── ABC123/
  │   ├── users: [user1, user2]
  │   ├── offer: {...SDP...}
  │   ├── answer: {...SDP...}
  │   └── iceCandidates/
  │       ├── from_userA: [...]
  │       └── from_userB: [...]
  ├── XYZ789/
  │   └── ...
```

**Aceita quando:**
- [ ] 10 salas ativas simultâneas, cada uma com 2 usuários
- [ ] Firestore não cruza dados entre salas
- [ ] Cada sala é independente

---

## 4. USER STORIES (Derivadas do PRD)

### **EPIC 1: Sinalização e Acesso**

**Story 1.1: Anfitrião cria Sala**
```
Como ANFITRIÃO
Quero CRIAR uma sala com um clique
Para que meu CONVIDADO receba um código único

AC:
- [ ] Clico "Criar Sala"
- [ ] Código alfanumérico (8 caracteres) é gerado
- [ ] Código é copiável (botão copy)
- [ ] Firestore cria documento da sala
- [ ] Aguardando conexão (UI mostra "Aguardando convidado...")
```

**Story 1.2: Convidado entra em Sala**
```
Como CONVIDADO
Quero ENTRAR em sala com código
Para que CONECTE ao anfitrião via WebRTC

AC:
- [ ] Insiro código (ex: A1B2C3D4)
- [ ] Clico "Entrar"
- [ ] Firestore valida código (existe? não expirou?)
- [ ] SDP Offer é criado e enviado
- [ ] Aguardando resposta (UI: "Conectando...")
- [ ] Conexão estabelecida (ICE candidates trocados)
- [ ] Estado muda para "Conectado"
```

---

### **EPIC 2: Configuração de Idioma**

**Story 2.1: Selecionar Idiomas**
```
Como USUÁRIO
Quero SELECIONAR meu idioma de fala e idioma de saída
Para que SISTEMA saiba como transcrever e traduzir

AC:
- [ ] Dropdown "Meu idioma" mostra 8 opções
- [ ] Dropdown "Traduzir para" mostra 8 opções
- [ ] Seleção é feita PRÉ-chamada e pode ser alterada durante
- [ ] Seleção é persistida em localStorage
- [ ] Ambos usuários têm configs independentes
```

---

### **EPIC 3: Comunicação via Voz**

**Story 3.1: Capturar e Transcrever Voz**
```
Como USUÁRIO
Quero FALAR normalmente
Para que SISTEMA TRANSCREVA minha fala em tempo real

AC:
- [ ] Microfone é solicitado (permissão)
- [ ] Ícone do microfone mostra "gravando" (onda animada)
- [ ] Após silêncio ~1.5s, frase é transcrita
- [ ] Transcrição aparece no painel esquerdo em < 200ms
- [ ] Erros de transcrição são raros (>90% acurácia)
```

**Story 3.2: Enviar Transcrição via P2P**
```
Como SISTEMA
Quero ENVIAR texto transcrito via WebRTC DataChannel
Para que CHEGUE ao par em < 100ms

AC:
- [ ] RTCDataChannel está aberto (estado: open)
- [ ] JSON com metadados é enviado (from, lang, text, timestamp)
- [ ] Entrega é garantida (sequence number)
- [ ] Sem pacotes perdidos (verificar 100 envios)
```

**Story 3.3: Traduzir Texto com IA**
```
Como SISTEMA
Quero TRADUZIR texto recebido via Gemini API
Para que USUÁRIO compreenda em seu idioma

AC:
- [ ] Chamada Gemini leva < 2s
- [ ] Tradução mantém contexto (últimas 5 mensagens)
- [ ] Cache evita re-traduzir (< 100ms para repeat)
- [ ] Acurácia > 95% em testes (5 frases de cada idioma)
```

**Story 3.4: Sintetizar e Reproduzir Áudio**
```
Como SISTEMA
Quero SINTETIZAR tradução em áudio
Para que USUÁRIO OUÇA resposta traduzida

AC:
- [ ] SpeechSynthesis API é usada (nativa do navegador)
- [ ] Áudio é reproduzido automaticamente (sem clique)
- [ ] Latência: < 1s entre tradução recebida e áudio iniciado
- [ ] Qualidade: voz natural, inteligível (não robótica)
- [ ] Simultaneidade: A fala + B ouve trad, enquanto B fala + A ouve trad
```

---

### **EPIC 4: User Experience**

**Story 4.1: Mostrar Status de Conexão**
```
Como USUÁRIO
Quero VER indicadores visuais de status
Para que TENHA certeza técnica de que chamada está ativa

AC:
- [ ] "Criando Sala..." (animação)
- [ ] "Aguardando Convidado..." (em criador)
- [ ] "Negociando Rede..." (ICE gathering)
- [ ] "Conectado ✓" (WebRTC connected)
- [ ] Indicador de atividade do microfone (ondas)
- [ ] Indicador de latência (ms)
```

**Story 4.2: Exibir Closed Captions**
```
Como USUÁRIO
Quero VER transcrição local e tradução remota lado-a-lado
Para que TENHA registro visual da reunião

AC:
- [ ] Painel esquerdo: Minha fala (original, pt-BR)
- [ ] Painel direito: Fala dele (tradução, en-US)
- [ ] Cada linha mostra: timestamp, texto
- [ ] Histórico é scrollável
- [ ] Botão "Exportar" gera PDF/TXT
```

**Story 4.3: Controlar Chamada (Mute, Hangup)**
```
Como USUÁRIO
Quero MUDAR mudar configurações durante a chamada
Para que TER controle total

AC:
- [ ] Botão "Mute" silencia microfone (sem desconectar)
- [ ] Botão "Pausar Tradução" para de processar IA
- [ ] Botão "Desligar" encerra graciosamente
- [ ] Hangup libera dispositivos em < 1s
- [ ] Reconexão automática se rede cai (< 5s)
```

---

## 5. ROADMAP DE PRODUTO

### **FASE 1: MVP WebRTC + IA (ATUAL - 2 semanas)**
- ✅ Comunicação 1:1 via WebRTC
- ✅ Sinalização por Firestore (SDP/ICE)
- ✅ STT nativa (Web Speech API)
- ✅ Tradução Gemini
- ✅ TTS nativa
- ✅ Interface reativa (React)
- ✅ Closed Captions
- ✅ STUN servers públicos

**Saída:** MVP funcional, ambientes com boa latência (~200ms P2P)

---

### **FASE 2: Estabilidade e NAT Traversal (Curto Prazo - 1 semana)**
- ➕ Voice Activity Detection (VAD) para evitar sobreposição
- ➕ Servidor TURN corporativo (Twilio/Metered)
- ➕ Retry automático de conexão
- ➕ Testes em redes VPN/corporativas
- ➕ Logging detalhado para debug
- ➕ Notificações de erro claras

**Saída:** Funciona em 99% das redes (inclusive corporativas)

---

### **FASE 3: Features Corporativas (Médio Prazo - 2 semanas)**
- ➕ Exportação de transcrição em PDF ("Ata Automática")
- ➕ Autenticação (Google OAuth)
- ➕ Histórico de contatos
- ➕ Histórico de salas recentes
- ➕ Temas (dark/light mode)
- ➕ Suporte a mais idiomas (20+)

**Saída:** Pronto para uso corporativo/SaaS

---

### **FASE 4: Multi-usuário (Longo Prazo - 3+ semanas)**
- ➕ Topologia SFU (Selective Forwarding Unit)
- ➕ Suporte para 3+ usuários simultâneos
- ➕ Tradução multicast
- ➕ Screen sharing com tradução de texto
- ➕ Recording & replay com legendas

**Saída:** Plataforma corporativa completa

---

## 6. CRITÉRIOS DE SUCESSO (ACCEPTANCE CRITERIA)

### **Teste 1: Sinalização e Conectividade**
```
[ ] Firestore propaga Offers, Answers e ICE candidates sem race conditions
[ ] Dois navegadores em redes fisicamente distintas estabelecem WebRTC
[ ] Estado WebRTC muda para "connected" em < 5 segundos
[ ] Sala é criada e limpa corretamente após disconnect
```

### **Teste 2: Latência P2P**
```
[ ] Mensagem de A para B viaja em < 100ms (média de 10 envios)
[ ] Áudio P2P é transmitido em < 200ms (Wireshark verification)
[ ] Não há perda de pacotes (100 mensagens, 0 perdidas)
```

### **Teste 3: Speech-to-Text**
```
[ ] 5 frases testadas, todas transcritas com > 90% acurácia
[ ] Silêncio é detectado corretamente (~1.5s)
[ ] Transcrição aparece na UI em < 200ms
```

### **Teste 4: Tradução**
```
[ ] Gemini API traduz com > 95% acurácia (testes com 5 idiomas)
[ ] Latência < 2 segundos (rede + processamento)
[ ] Cache funciona (repeat reduz para < 100ms)
```

### **Teste 5: Text-to-Speech**
```
[ ] Áudio sintetizado é reproduzido em < 1s após tradução
[ ] Voz é inteligível e natural (não robótica)
[ ] Suporta múltiplos idiomas simultaneamente
```

### **Teste 6: UI/UX**
```
[ ] Closed captions aparecem em < 500ms
[ ] Status de conexão é claro (Criando → Aguardando → Conectado)
[ ] Mute/Hangup funcionam sem latência
[ ] Exportar captions gera PDF válido
```

### **Teste 7: Segurança**
```
[ ] DTLS handshake bem-sucedido
[ ] Wireshark não consegue ler áudio (criptografado)
[ ] DataChannel usa SCTP-DTLS (E2EE)
```

### **Teste 8: NAT Traversal**
```
[ ] Usuário em VPN corporativa consegue conectar
[ ] Usuário em 4G consegue conectar
[ ] TURN server é usado quando necessário (log)
[ ] Funcionamento em 100+ combinações de rede
```

---

## 7. ARQUITETURA TÉCNICA RESUMIDA

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente A)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Web Speech   │  │ WebRTC       │  │ React UI        │   │
│  │ API (STT)    │──│ RTCPeer      │──│ (Captions)      │   │
│  │ (TTS)        │  │ Connection   │  │ (Controls)      │   │
│  └──────┬───────┘  └──────┬───────┘  └─────────────────┘   │
│         │                 │                                  │
│         └─────────────────┼──────────────────┬──────────────┤
│                           │                  │               │
│                    ┌──────▼──────┐  ┌────────▼──────┐       │
│                    │ Firestore   │  │ Gemini API    │       │
│                    │ (Signal)    │  │ (Translate)   │       │
│                    └─────────────┘  └───────────────┘       │
│                           ▲                  ▲               │
└───────────────────────────┼──────────────────┼───────────────┘
                            │                  │
┌───────────────────────────┼──────────────────┼───────────────┐
│                    NAVEGADOR (Cliente B)                     │
│         [Espelhado de Cliente A]                             │
└─────────────────────────────────────────────────────────────┘

Fluxo de Mensagem:
  1. Cliente A fala → Web Speech API STT → Texto
  2. Texto → Firestore SDP/ICE setup
  3. RTCDataChannel abre (P2P)
  4. Texto A → RTCDataChannel → Cliente B (< 100ms)
  5. Cliente B recebe → Gemini Translate → en-US
  6. en-US → Web Speech API TTS → Áudio B
  7. Simultaneamente: Cliente B fala → Cliente A ouve

Segurança:
  • DTLS-SRTP: Áudio criptografado
  • SCTP-over-DTLS: DataChannel E2EE
  • Firestore: Apenas sinalização (texto), sem áudio
```

---

## 8. MÉTRICAS E KPIs

| Métrica | Target | Método |
|---------|--------|--------|
| **Latência P2P** | < 200ms | Wireshark + Chrome DevTools |
| **Acurácia STT** | > 90% | Manual testing 5 frases/idioma |
| **Acurácia Tradução** | > 95% | Manual testing 5 frases/idioma |
| **Latência TTS** | < 1s | Timestamp diff |
| **Uptime Firestore** | > 99.9% | Cloud Console logs |
| **Taxa de Conexão** | > 95% | Teste em 20 redes distintas |
| **Taxa de Erro** | < 1% | Error tracking (Sentry) |
| **Tempo Deploy** | < 5min | Firebase Hosting |

---

## 9. RISCOS E MITIGAÇÕES

| Risco | Severidade | Mitigation |
|-------|-----------|------------|
| Web Speech API não funciona em alguns navegadores | 🔴 ALTA | Usar Google Cloud Speech-to-Text API como fallback |
| Latência Gemini > 2s em picos | 🟡 MÉDIA | Cache agressivo, queue local para mensagens |
| NAT Traversal falha em redes corporativas | 🔴 ALTA | Integrar servidor TURN (Twilio/Metered) |
| Firestore hit rate limit (1M writes/dia) | 🟢 BAIXA | Batching, índices otimizados, pricing plan |
| Navegador fecha conexão ao mudar aba | 🟡 MÉDIA | Usar Service Worker para background persistence |

---

## 10. APROVAÇÃO

| Role | Name | Assinatura | Data |
|------|------|-----------|------|
| **Product Owner** | Daniel Lima | ✅ | 2026-04-08 |
| **Tech Lead** | Orion (AIOX) | ✅ | 2026-04-08 |
| **Status** | APROVADO | ✅ | READY FOR DEVELOPMENT |

---

**Próximo passo:** Começar FASE 1 com Stories estruturadas em AIOX.
