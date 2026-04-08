# 🏗️ ARQUITETURA TÉCNICA - Reunião Internacional com Tradução Simultânea

**Status:** PHASE 1 | **Data:** 2026-04-08 | **Versão:** 1.0

---

## 1. VISÃO GERAL

### Stack Tecnológico

```
┌────────────────────────────────────────┐
│           CLIENTE (Browser)            │
├────────────────────────────────────────┤
│ Frontend: React 18 + Next.js 14        │
│ Real-time: WebRTC (audio) + RTCData    │
│ Speech: Web Speech API (STT/TTS)       │
│ State: Zustand (client state)          │
│ UI: Tailwind CSS                       │
│ Deployment: Vercel/Netlify             │
└────────────────────────────────────────┘
                    ↓
        [WebRTC P2P Connection]
          (DTLS-SRTP Encrypted)
        [Firestore Signaling]
                    ↓
┌────────────────────────────────────────┐
│         BACKEND (Serverless)           │
├────────────────────────────────────────┤
│ Sinalização: Firebase Firestore        │
│ Tradução: Google Gemini API            │
│ Autenticação: Firebase Auth (v2+)      │
│ Deployment: Firebase Hosting           │
└────────────────────────────────────────┘
```

---

## 2. COMPONENTES PRINCIPAIS

### 2.1 Frontend (Next.js 14 App Directory)

**Estrutura:**
```
web/
├── app/
│   ├── layout.tsx             # Root layout + providers
│   ├── page.tsx               # Main app (meeting page)
│   ├── error.tsx              # Error boundary
│   └── loading.tsx            # Loading UI
├── components/
│   ├── ConnectionStatus.tsx   # Status indicator
│   ├── RoomCode.tsx           # Create/Join room
│   ├── LanguageSelector.tsx   # Input/Output lang
│   ├── CaptionPanel.tsx       # Closed captions (local)
│   ├── RemoteCaptions.tsx     # Captions (remote)
│   ├── Controls.tsx           # Mute/Hangup buttons
│   └── ErrorBoundary.tsx      # Error handling
├── lib/
│   ├── webrtc.ts              # WebRTC peer connection logic
│   ├── firestore.ts           # Firestore signaling
│   ├── speech.ts              # STT/TTS Web Speech API
│   ├── translate.ts           # Gemini API calls
│   ├── config.ts              # Constants
│   └── utils.ts               # Helpers
├── hooks/
│   ├── useWebRTC.ts           # WebRTC hook
│   ├── useSpeech.ts           # Speech hook
│   ├── useFirestore.ts        # Firestore hook
│   └── useAppState.ts         # Global state
├── types/
│   └── index.ts               # TypeScript interfaces
└── public/
    ├── favicon.ico
    └── manifest.json          # PWA manifest
```

**Dependencies:**
```json
{
  "react": "^18.2.0",
  "next": "^14.0.0",
  "zustand": "^4.4.0",
  "firebase": "^10.0.0",
  "@google/generative-ai": "^0.3.0",
  "tailwindcss": "^3.3.0",
  "typescript": "^5.2.0"
}
```

---

### 2.2 WebRTC Peer Connection

**Arquivo:** `lib/webrtc.ts`

```typescript
// Pseudocode
class RTCPeerManager {
  // Configuração STUN/TURN
  iceServers = [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    },
    // TURN (para fallback em redes restritas)
    // {
    //   urls: ['turn:turnserver.example.com:3478'],
    //   username: 'user',
    //   credential: 'pass'
    // }
  ];

  // Criar peer connection
  async createPeerConnection(roomId) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Data Channel para mensagens (texto)
    this.dataChannel = this.peerConnection.createDataChannel('messaging', {
      ordered: true // Garantir ordem
    });

    // Audio Track (nativo da WebRTC)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream);
    });

    // Setup event listeners
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Enviar ICE candidate para Firestore
        this.sendICECandidate(roomId, event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state: ${this.peerConnection.connectionState}`);
      // Notificar UI
    };
  }

  // Criar offer (anfitrião)
  async createOffer(roomId) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Enviar para Firestore
    await setDoc(doc(db, 'rooms', roomId), {
      offer: {
        type: offer.type,
        sdp: offer.sdp
      }
    });
  }

  // Criar answer (convidado)
  async createAnswer(roomId, remoteOffer) {
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(remoteOffer)
    );

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    await updateDoc(doc(db, 'rooms', roomId), {
      answer: {
        type: answer.type,
        sdp: answer.sdp
      }
    });
  }

  // Processar ICE candidates remotos
  async addRemoteICECandidate(iceCandidate) {
    if (iceCandidate) {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(iceCandidate)
      );
    }
  }

  // Enviar mensagem via DataChannel
  sendMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  // Cleanup
  async hangup() {
    // Parar tracks de áudio
    this.peerConnection.getSenders().forEach(sender => {
      sender.track?.stop();
    });

    // Fechar data channel
    this.dataChannel?.close();

    // Fechar peer connection
    this.peerConnection?.close();

    // Limpar Firestore
    await deleteDoc(doc(db, 'rooms', this.roomId));
  }
}
```

---

### 2.3 Firestore Signaling

**Estrutura do banco:**
```
firestore: {
  rules_version = '2';
  rules: {
    match /rooms/{roomId} {
      allow create: if true;  // Qualquer um pode criar
      allow read: if true;    // Qualquer um pode ler
      allow update: if true;  // Qualquer um pode atualizar
      allow delete: if true;  // Owner deleta
    }
  },
  collections: {
    rooms: {
      ABC123: {
        createdAt: timestamp,
        createdBy: "userA",
        status: "waiting" | "active" | "ended",
        offer: { type: "offer", sdp: "..." },
        answer: { type: "answer", sdp: "..." },
        iceCandidates: {
          from_userA: [
            { candidate: "...", sdpMLineIndex: 0 },
            { candidate: "...", sdpMLineIndex: 0 }
          ],
          from_userB: [...]
        },
        users: [
          { id: "userA", language: "pt-BR", name: "João" },
          { id: "userB", language: "en-US", name: "Jane" }
        ]
      }
    }
  }
}
```

**Arquivo:** `lib/firestore.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Criar sala
export async function createRoom(roomId: string, userId: string, language: string) {
  await setDoc(doc(db, 'rooms', roomId), {
    createdAt: new Date(),
    createdBy: userId,
    status: 'waiting',
    users: [{ id: userId, language, name: 'User' }]
  });
}

// Entrar em sala
export async function joinRoom(roomId: string, userId: string, language: string) {
  const roomDoc = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomDoc);

  if (!roomSnap.exists()) throw new Error('Room not found');

  await updateDoc(roomDoc, {
    users: arrayUnion({ id: userId, language, name: 'User' }),
    status: 'active'
  });
}

// Listen para mudanças (SDP/ICE)
export function listenToRoom(roomId: string, callback: (data) => void) {
  return onSnapshot(doc(db, 'rooms', roomId), (doc) => {
    callback(doc.data());
  });
}

// Enviar ICE candidate
export async function sendICECandidate(roomId: string, fromUserId: string, candidate) {
  await updateDoc(doc(db, 'rooms', roomId), {
    [`iceCandidates.from_${fromUserId}`]: arrayUnion(candidate)
  });
}

// Limpar sala
export async function deleteRoom(roomId: string) {
  await deleteDoc(doc(db, 'rooms', roomId));
}
```

---

### 2.4 Web Speech API (STT + TTS)

**Arquivo:** `lib/speech.ts`

```typescript
class SpeechManager {
  recognition: SpeechRecognition;
  synthesis: SpeechSynthesisUtterance;
  currentLanguage: string = 'pt-BR';

  // Speech-to-Text
  initializeSTT() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.language = this.currentLanguage;

    let finalTranscript = '';
    let silenceTimer: NodeJS.Timeout | null = null;

    this.recognition.onstart = () => {
      console.log('Recording...');
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Mostrar interim na UI
      this.onInterimResult?.(interimTranscript);

      // Detectar silêncio (~1.5s)
      clearTimeout(silenceTimer!);
      silenceTimer = setTimeout(() => {
        if (finalTranscript) {
          this.onFinalResult?.(finalTranscript);
          finalTranscript = '';
        }
      }, 1500);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
    };
  }

  startListening() {
    this.recognition.start();
  }

  stopListening() {
    this.recognition.stop();
  }

  // Text-to-Speech
  speak(text: string, language: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Selecionar voz nativa do idioma
    const voices = window.speechSynthesis.getVoices();
    const voiceForLang = voices.find(v => v.lang.startsWith(language));
    if (voiceForLang) {
      utterance.voice = voiceForLang;
    }

    window.speechSynthesis.speak(utterance);
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.recognition.language = lang;
  }
}
```

---

### 2.5 Tradução com Gemini API

**Arquivo:** `lib/translate.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Cache local para evitar re-traduzir
const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  fromLang: string,
  toLang: string,
  context: string[] = []
): Promise<string> {
  // Verificar cache
  const cacheKey = `${fromLang}-${toLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um tradutor profissional.

Contexto anterior (últimas mensagens):
${context.slice(-5).join('\n')}

Traduza esta frase de ${getLangName(fromLang)} para ${getLangName(toLang)}:
"${text}"

Responda APENAS com a tradução, sem explicações.`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    // Cachear resultado
    translationCache.set(cacheKey, translated);

    // Limpar cache se ficar muito grande (500 itens)
    if (translationCache.size > 500) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

function getLangName(code: string): string {
  const names: Record<string, string> = {
    'pt-BR': 'português brasileiro',
    'en-US': 'inglês',
    'es-ES': 'espanhol',
    'fr-FR': 'francês',
    'de-DE': 'alemão',
    'zh-CN': 'chinês simplificado',
    'ja-JP': 'japonês'
  };
  return names[code] || code;
}
```

---

## 3. FLUXO DE EXECUÇÃO

### 3.1 Anfitrião Cria Sala

```
1. Usuário A clica "Criar Sala"
   ↓
2. Frontend gera roomId (ex: A1B2C3D4)
   ↓
3. Firestore cria documento: rooms/A1B2C3D4
   ↓
4. WebRTC createOffer() é executado
   ↓
5. Offer SDP é salvo em Firestore
   ↓
6. UI mostra: "Aguardando Convidado... Código: A1B2C3D4"
   ↓
7. Listening para answer (User B)
```

### 3.2 Convidado Entra em Sala

```
1. Usuário B insere código A1B2C3D4
   ↓
2. Frontend valida se sala existe em Firestore
   ↓
3. WebRTC createAnswer() é executado com offer de A
   ↓
4. Answer SDP é salvo em Firestore
   ↓
5. Ambos trocam ICE candidates via Firestore
   ↓
6. WebRTC connection state → "connected"
   ↓
7. DataChannel abre (ready)
   ↓
8. UI muda para: "Conectado ✓"
```

### 3.3 Conversa em Tempo Real

```
Usuário A fala:
  ↓
Web Speech API STT transcreven "Olá"
  ↓
onFinalResult() dispara
  ↓
Emite: { from: "A", lang: "pt-BR", text: "Olá" }
  ↓
RTCDataChannel.send() → < 100ms
  ↓
Usuário B recebe JSON
  ↓
API Gemini traduz "Olá" pt-BR → en-US = "Hello"
  ↓
Web Speech API TTS sintetiza "Hello" em en-US
  ↓
Audio é reproduzido em B
  ↓
UI mostra captions:
  ["A: Olá"]  ["B: Hello"]
  ↓
Simultaneamente: B fala → A ouve
```

---

## 4. CONFIGURAÇÕES CRÍTICAS

### 4.1 Firebase Configuration

**`.env.local`:**
```bash
# Firebase Config (obter de console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tradutor-ia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tradutor-ia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tradutor-ia.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 4.2 Gemini API

**`.env.local`:**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

---

## 5. SEGURANÇA

### 5.1 WebRTC E2EE
- ✅ DTLS-SRTP: Criptografa áudio automaticamente
- ✅ SCTP-over-DTLS: DataChannel criptografado
- ✅ Certificados DTLS trocados automaticamente

### 5.2 Firestore Security Rules
```
rules_version = '2';
match /databases/{database}/documents {
  match /rooms/{roomId} {
    allow create: if true;           // Qualquer um cria
    allow read: if true;             // Qualquer um lê (código público)
    allow update: if true;           // Qualquer um atualiza (SDP/ICE)
    allow delete: if false;          // Apenas Cloud Function deleta
  }
}
```

### 5.3 API Keys
- ✅ Gemini API: `NEXT_PUBLIC_` (exposição é OK, limitado por quotas)
- ✅ Firebase: `NEXT_PUBLIC_` (seguro, limitado por regras)
- ✅ Nenhuma credencial de backend exposta (serverless puro)

---

## 6. DEPLOYMENT

### 6.1 Frontend (Vercel)

```bash
vercel deploy --prod
# Automático a cada push em main
# Variáveis de ambiente configuradas em Vercel Dashboard
```

### 6.2 Backend (Firebase Hosting)

```bash
firebase deploy --only hosting
# Incluso no Firebase (mesma conta)
# Sem custos adicionais
```

### 6.3 Database (Firestore)

```bash
firebase deploy --only firestore:rules
# Regras de segurança via CLI
```

---

## 7. MONITORAMENTO E LOGGING

### 7.1 Cliente-side Logging

```typescript
// Usar console.log estruturado
const log = (level: 'info' | 'warn' | 'error', msg: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${msg}`, data || '');
};

// Ou integrar Sentry para erros (v2+)
// import * as Sentry from "@sentry/nextjs";
// Sentry.captureException(error);
```

### 7.2 Métricas

```typescript
// Latência P2P
const latency = {
  send: Date.now(),
  receive: 0,
  get ms() { return this.receive - this.send; }
};

// Qualidade de conexão
const quality = {
  iceConnectionState: peerConnection.iceConnectionState,
  connectionState: peerConnection.connectionState,
  signalingState: peerConnection.signalingState
};
```

---

## 8. PERFORMANCE TARGETS

| Métrica | Target | Atual |
|---------|--------|-------|
| P2P Latência | < 200ms | TBD |
| STT Acurácia | > 90% | TBD |
| Tradução Latência | < 2s | TBD |
| TTS Latência | < 1s | TBD |
| Conexão Setup | < 5s | TBD |
| Memory Usage | < 150MB | TBD |
| CPU Usage | < 20% | TBD |

---

## 9. ROADMAP TÉCNICO

### Fase 1 (MVP)
- ✅ WebRTC P2P (audio + data)
- ✅ Firestore signaling
- ✅ Web Speech API (STT/TTS)
- ✅ Gemini translation
- ✅ Basic UI

### Fase 2
- ➕ Voice Activity Detection (VAD)
- ➕ TURN server fallback
- ➕ Error recovery
- ➕ Logging (Sentry)

### Fase 3
- ➕ Recording & export
- ➕ Authentication (Firebase Auth)
- ➕ Contact list
- ➕ Dark mode

### Fase 4
- ➕ SFU (3+ users)
- ➕ Screen sharing
- ➕ Message queue

---

**Próximo:** Criar Stories em formato AIOX.
