# Firestore Schema - Tradutor IA

## 📊 Estrutura de Coleções

```
Firestore Database (traductor-ia-21aee)
└── rooms/ (Coleção principal)
    └── {roomId}/ (Documento)
        ├── hostUsername: string
        ├── hostLanguage: "pt-BR" | "en-US" | "es-ES" | "fr-FR" | "de-DE"
        ├── guestUsername?: string
        ├── guestLanguage?: "pt-BR" | "en-US" | "es-ES" | "fr-FR" | "de-DE"
        ├── createdAt: timestamp
        ├── expiresAt: timestamp (30 minutos depois)
        ├── status: "waiting" | "active" | "closed"
        ├── offer?: { type, sdp, createdAt }
        ├── answer?: { type, sdp, createdAt }
        └── iceCandidates/ (Subcoleção)
            └── {candidateId}/ (Documento)
                ├── candidate: string (RTCIceCandidate)
                ├── sdpMLineIndex?: number
                ├── sdpMid?: string
                └── createdAt: timestamp
```

---

## 📝 Detalhes de Campos

### Coleção: `rooms`

#### Documento Exemplo
```json
{
  "hostUsername": "João",
  "hostLanguage": "pt-BR",
  "guestUsername": "Maria",
  "guestLanguage": "en-US",
  "createdAt": "2026-04-08T14:30:00Z",
  "expiresAt": "2026-04-08T15:00:00Z",
  "status": "active",
  "offer": {
    "type": "offer",
    "sdp": "v=0\no=- ...",
    "createdAt": "2026-04-08T14:31:00Z"
  },
  "answer": {
    "type": "answer",
    "sdp": "v=0\no=- ...",
    "createdAt": "2026-04-08T14:31:05Z"
  }
}
```

#### Campos Obrigatórios (CREATE)
| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|-----------|
| `hostUsername` | string | Nome do anfitrião | 1-50 chars |
| `hostLanguage` | enum | Idioma do anfitrião | pt-BR, en-US, es-ES, fr-FR, de-DE |
| `createdAt` | timestamp | Momento de criação | serverTimestamp() |
| `status` | string | Estado da sala | "waiting" (inicial) |

#### Campos Opcionais (UPDATE)
| Campo | Tipo | Descrição | Quando |
|-------|------|-----------|--------|
| `guestUsername` | string | Nome do convidado | Quando convidado entra |
| `guestLanguage` | enum | Idioma do convidado | Quando convidado entra |
| `offer` | object | SDP Offer (WebRTC) | Após criar peer connection |
| `answer` | object | SDP Answer (WebRTC) | Quando convidado responde |
| `status` | string | Estado atual | "waiting" → "active" → "closed" |

#### Índices Criados

1. **status + expiresAt** (Story 1.1, Cloud Function)
   - Query: Encontrar salas expiradas para limpeza
   - Usado em: `expireRooms()` Cloud Function

2. **hostLanguage + createdAt** (Story 1.2)
   - Query: Encontrar salas disponíveis por idioma
   - Usado em: "Salas disponíveis" list

3. **status + createdAt** (Story 1.2)
   - Query: Salas ativas mais recentes
   - Usado em: Sorting/paginação

---

### Subcoleção: `iceCandidates`

#### Documento Exemplo
```json
{
  "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
  "sdpMLineIndex": 0,
  "sdpMid": "0",
  "createdAt": "2026-04-08T14:31:02Z"
}
```

#### Campos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `candidate` | string | Candidato ICE (RFC) |
| `sdpMLineIndex` | number | Índice da linha M no SDP |
| `sdpMid` | string | Media ID |
| `createdAt` | timestamp | Quando foi descoberto |

---

## 🔐 Firestore Rules (Segurança)

### CREATE (Criar Sala)
```firestore
allow create: if
  request.resource.data.keys().hasAll(['hostUsername', 'hostLanguage', 'createdAt', 'status']) &&
  request.resource.data.status == 'waiting' &&
  request.resource.data.hostUsername.size() > 0 &&
  request.resource.data.hostUsername.size() <= 50
```

### READ (Ler Sala)
```firestore
allow read: if true  // Qualquer um pode ler (anônimo)
```

### UPDATE (Atualizar Sala)
```firestore
allow update: if
  (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['guestUsername', 'guestLanguage', 'offer', 'answer', 'status'])) &&
  request.resource.data.status in ['waiting', 'active', 'closed']
```

### DELETE (Deletar Sala)
```firestore
allow delete: if false  // Apenas Cloud Function pode deletar
```

---

## 📋 Operações Firestore por Story

### Story 1.1: Anfitrião Cria Sala

```typescript
// CREATE
await createRoom(roomId, hostUsername, hostLanguage)

// UPDATE (salvar offer)
await saveOffer(roomId, offer)

// UPDATE (adicionar candidate)
await addIceCandidate(roomId, candidate)
```

### Story 1.2: Convidado Entra (a implementar)

```typescript
// READ (buscar salas disponíveis)
const available = await db
  .collection('rooms')
  .where('status', '==', 'waiting')
  .where('hostLanguage', '==', userLanguage)
  .limit(10)
  .get()

// READ (obter sala específica)
const room = await getRoom(roomId)

// READ (get offer)
const offer = await getOffer(roomId)

// UPDATE (adicionar guest)
await updateRoom(roomId, {
  guestUsername,
  guestLanguage,
  status: 'active'
})

// UPDATE (salvar answer)
await saveAnswer(roomId, answer)
```

### Cloud Function: expireRooms (Tarefa 6)

```typescript
// READ + DELETE
const expired = await db
  .collection('rooms')
  .where('status', '==', 'waiting')
  .where('expiresAt', '<', new Date())
  .get()

// Deletar cada doc expirado
```

---

## 📊 Capacidade & Quotas

### MVP (Primeira semana)
- Salas simultâneas: ~10-50
- Reads/writes: ~100/min
- Armazenamento: < 1MB

### Escala (Após validação)
- **Firestore Quota padrão:**
  - 50K reads/dia (gratuito)
  - 20K writes/dia (gratuito)
  - 1GB armazenamento (gratuito)

- **Para crescer:**
  - Otimizar índices
  - Implementar cache no cliente
  - Considerar Realtime Database para ICE candidates (mais rápido)

---

## ✅ Checklist de Validação

- [x] Schema definido
- [x] Firestore Rules configuradas
- [x] Índices criados
- [x] firebase.json aponta para regras e índices
- [ ] Deploy das regras: `firebase deploy --only firestore:rules`
- [ ] Deploy dos índices: `firebase deploy --only firestore:indexes`
- [ ] Teste de permissões
- [ ] Teste de índices na Cloud Function

---

**Status:** 🟢 Ready for deploy

Próximo: @devops deploy rules + indexes
