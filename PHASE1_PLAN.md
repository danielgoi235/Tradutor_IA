# 🚀 PHASE 1 - Plano de Execução (MVP WebRTC)

**Status:** 🟢 APPROVED | **Data:** 2026-04-08 | **Duration:** 2 semanas

---

## 📌 Visão Geral

Construir um **MVP funcional** de reunião internacional com tradução simultânea em voz usando **WebRTC P2P + Serverless (Firebase)**.

**Objetivo:** Dois usuários em redes diferentes conseguem falar naturalmente, com áudio transmitido P2P e tradução automática em tempo real.

---

## 🎯 Meta da Fase 1

```
✅ FEATURE COMPLETE (todos os FRs)
✅ PERFORMANCE OK (latência < 2.5s)
✅ SEGURANÇA OK (E2EE)
✅ PRONTO PARA FASE 2
```

---

## 📊 Breakdown de Stories

### EPIC 1: Sinalização e Acesso (4 stories, 20 pontos)

| Story | Título | Pontos | Dificuldade | Dependências |
|-------|--------|--------|-------------|--------------|
| **1.1** | Anfitrião cria sala | 5 | 🟡 MÉDIA | Firebase setup |
| **1.2** | Convidado entra em sala | 5 | 🟡 MÉDIA | Story 1.1 |
| **1.3** | Gerenciar expiração de sala | 3 | 🟢 FÁCIL | Story 1.1 |
| **1.4** | Hangup gracioso | 7 | 🟠 DIFÍCIL | Story 1.2 |

**Saída esperada:** Dois usuários conseguem conectar via WebRTC em < 5 segundos.

---

### EPIC 2: Configuração de Idioma (2 stories, 8 pontos)

| Story | Título | Pontos | Dificuldade | Dependências |
|-------|--------|--------|-------------|--------------|
| **2.1** | Selecionar idiomas (input + output) | 5 | 🟢 FÁCIL | UI base |
| **2.2** | Mudar idioma durante chamada | 3 | 🟡 MÉDIA | Story 2.1 |

**Saída esperada:** Usuário consegue selecionar idioma nativo e idioma de saída independentemente.

---

### EPIC 3: Comunicação via Voz (4 stories, 25 pontos)

| Story | Título | Pontos | Dificuldade | Dependências |
|-------|--------|--------|-------------|--------------|
| **3.1** | Capturar e transcrever voz (STT) | 7 | 🟠 DIFÍCIL | Web Speech API |
| **3.2** | Enviar transcrição via P2P | 5 | 🟡 MÉDIA | Story 3.1, 1.2 |
| **3.3** | Traduzir com Gemini | 6 | 🟡 MÉDIA | Story 3.2, API key |
| **3.4** | Sintetizar áudio (TTS) | 7 | 🟠 DIFÍCIL | Story 3.3, TTS API |

**Saída esperada:** Full loop: A fala pt-BR → B recebe em en-US em < 3 segundos.

---

### EPIC 4: User Experience (3 stories, 15 pontos)

| Story | Título | Pontos | Dificuldade | Dependências |
|-------|--------|--------|-------------|--------------|
| **4.1** | Status de conexão (indicadores) | 5 | 🟢 FÁCIL | Epic 1 |
| **4.2** | Closed captions (local + remoto) | 6 | 🟡 MÉDIA | Epic 3 |
| **4.3** | Controles (mute, hangup, etc) | 4 | 🟡 MÉDIA | Epic 3 |

**Saída esperada:** UI clara, feedback visual em tempo real.

---

## 📈 Cronograma Proposto

```
SEMANA 1
├─ Dia 1 (Segunda): Epic 1 Stories (1.1, 1.2)
├─ Dia 2 (Terça): Epic 2 + Epic 1.3
├─ Dia 3 (Quarta): Epic 3 Stories (3.1, 3.2)
├─ Dia 4 (Quinta): Epic 3 Stories (3.3, 3.4)
└─ Dia 5 (Sexta): Epic 4 + Integration tests

SEMANA 2
├─ Dia 1 (Segunda): Bug fixes + Performance
├─ Dia 2 (Terça): E2E tests + Security audit
├─ Dia 3 (Quarta): Documentation + Demo
├─ Dia 4 (Quinta): UAT (User Acceptance Testing)
└─ Dia 5 (Sexta): Deploy + Monitoring setup
```

---

## 🛠️ Setup Inicial Necessário

### 1. Firebase Project
```bash
# Criar projeto em console.firebase.google.com
# Nome: tradutor-ia
# Region: us-central1

# Habilitar:
✅ Cloud Firestore (Database)
✅ Cloud Functions (para expiração de salas)
✅ Cloud Hosting

# Configurar auth (simples, sem login por enquanto)
# Autenticação anônima habilitada
```

### 2. Google Cloud APIs
```bash
# Habilitar no console.cloud.google.com:
✅ Gemini API (Text generation)
✅ (Opcional) Google Cloud Speech-to-Text (v2 fallback)
✅ (Opcional) Google Cloud Text-to-Speech (v2 fallback)

# Criar API keys
GEMINI_API_KEY=AIzaSy...
```

### 3. Variáveis de Ambiente
```bash
# .env.local (frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tradutor-ia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tradutor-ia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tradutor-ia.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...

# Deploy
FIREBASE_TOKEN=...
```

---

## ✅ Checklist Pré-Desenvolvimento

- [ ] Firebase project criado
- [ ] APIs habilitadas (Gemini)
- [ ] .env.local preenchido
- [ ] `npm install` (dependencies)
- [ ] `firebase init` (local setup)
- [ ] Git branch: `feat/phase1-webrtc`
- [ ] Stories criadas em `docs/stories/`

---

## 🎯 Success Metrics (Fase 1)

| Métrica | Target | Método |
|---------|--------|--------|
| **P2P Latência** | < 200ms | Wireshark |
| **STT Acurácia** | > 90% | Manual testing |
| **Tradução Acurácia** | > 95% | Manual testing |
| **TTS Latência** | < 1s | Timestamp logs |
| **Conexão Setup** | < 5s | UI timer |
| **Uptime** | > 99% | Firestore logs |
| **Code Coverage** | > 80% | Jest coverage |
| **Test Pass Rate** | 100% | CI/CD |

---

## 🚨 Riscos Identificados

| Risco | Severidade | Mitigation |
|-------|-----------|------------|
| Web Speech API não funciona Chrome/Firefox | 🔴 ALTA | Google Cloud Speech-to-Text fallback (v2) |
| Firestore hit rate limit em teste de carga | 🟡 MÉDIA | Batching de ICE candidates, índices |
| Latência Gemini > 2s | 🟡 MÉDIA | Cache agressivo, queue local |
| WebRTC falha em NAT restritivo | 🔴 ALTA | TURN server (v2) |
| Navegador fecha conexão ao mudar aba | 🟡 MÉDIA | Service Worker + background persistence (v2) |

---

## 📦 Deliverables

### Semana 1
- ✅ Code (todas as stories implementadas)
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests

### Semana 2
- ✅ E2E tests (Cypress/Playwright)
- ✅ Performance audit (Lighthouse)
- ✅ Security audit (OWASP)
- ✅ Documentation (README, API docs)
- ✅ Demo video (5 min)
- ✅ Deployment guide

### Resultado Final
- 🎥 **MVP funcional**
- 📊 **Performance documentada**
- 🔒 **Segurança validada**
- 🧪 **100% teste coverage**
- 📖 **Documentação completa**

---

## 🚀 Go-Live Plan (Fim da Fase 1)

```
1. Final UAT (User Acceptance Testing)
2. Performance testing em múltiplas redes
3. Security review
4. Deploy para Firebase Hosting
5. Monitoring + alerting ativo
6. Demo ao stakeholder
```

---

## 📝 Developer Notes

### Coding Standards
- TypeScript strict mode (sem `any`)
- ESLint + Prettier (auto-format)
- Components em functional + hooks
- Zustand para state management
- Fiber library para async

### Testing
- Jest para unit tests
- React Testing Library para component tests
- Cypress para E2E tests
- Minimum: 80% coverage

### Git Workflow
- Branch: `feat/phase1-webrtc`
- Commits: Conventional commits (`feat:`, `fix:`, `test:`)
- PRs com: tests, docs, CHANGELOG entry
- Merge only quando tudo passa (CI/CD)

### Review Process
- [ ] Code review (peer)
- [ ] Tests passing (CI)
- [ ] Performance benchmarks
- [ ] Security scan
- [ ] Documentation update

---

## 📚 Resources

- 📖 [Firebase Docs](https://firebase.google.com/docs)
- 🎥 [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- 🔊 [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- 🤖 [Gemini API](https://ai.google.dev/)
- 🧪 [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## ✋ Review & Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| **Product Owner** | Daniel Lima | ✅ APPROVED | 2026-04-08 |
| **Tech Lead** | Orion (AIOX) | ✅ APPROVED | 2026-04-08 |
| **QA Lead** | - | ⏳ PENDING | - |

---

**Próximo passo:** Iniciar Story 1.1 (Anfitrião cria sala)

**Comando para começar:**
```bash
cd /c/Users/danie/OneDrive/Documentos/GitHub/tradutor-ia-real
git checkout -b feat/phase1-webrtc main
npm install
firebase init
# Seguir Step-by-step em ARCHITECTURE.md
```
