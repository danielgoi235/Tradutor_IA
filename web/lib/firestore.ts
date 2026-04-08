import {
  initializeApp,
  getApps,
  FirebaseApp,
} from 'firebase/app'
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (reuse existing instance if available)
let app: FirebaseApp
let db: Firestore

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  db = getFirestore(app)
  return { app, db }
}

export interface RoomData {
  id: string
  hostUsername: string
  hostLanguage: string
  createdAt: any
  status: 'waiting' | 'active' | 'closed'
  guestUsername?: string
  guestLanguage?: string
  expiresAt?: any
  offer?: {
    type: string
    sdp: string
    createdAt?: any
  }
  answer?: {
    type: string
    sdp: string
    createdAt?: any
  }
}

/**
 * Cria uma nova sala de conversa
 */
export async function createRoom(
  roomId: string,
  hostUsername: string,
  hostLanguage: string
): Promise<RoomData> {
  try {
    const { db } = initFirebase()

    const roomData: RoomData = {
      id: roomId,
      hostUsername,
      hostLanguage,
      createdAt: serverTimestamp(),
      status: 'waiting',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h de expiração
    }

    await setDoc(doc(db, 'rooms', roomId), roomData)

    console.log(`✅ Sala criada: ${roomId}`)
    return roomData
  } catch (error) {
    console.error('❌ Erro ao criar sala:', error)
    throw new Error(`Falha ao criar sala: ${error instanceof Error ? error.message : 'desconhecido'}`)
  }
}

/**
 * Obtém dados de uma sala existente
 */
export async function getRoom(roomId: string): Promise<RoomData | null> {
  try {
    const { db } = initFirebase()

    const docSnap = await getDoc(doc(db, 'rooms', roomId))
    if (docSnap.exists()) {
      return docSnap.data() as RoomData
    }
    return null
  } catch (error) {
    console.error('❌ Erro ao buscar sala:', error)
    throw error
  }
}

/**
 * Atualiza dados de uma sala
 */
export async function updateRoom(
  roomId: string,
  updates: Partial<RoomData>
): Promise<void> {
  try {
    const { db } = initFirebase()
    await updateDoc(doc(db, 'rooms', roomId), updates)
    console.log(`✅ Sala atualizada: ${roomId}`)
  } catch (error) {
    console.error('❌ Erro ao atualizar sala:', error)
    throw error
  }
}

/**
 * Salva a oferta SDP em uma sala existente
 * Story 1.1, Tarefa 5
 */
export async function saveOffer(
  roomId: string,
  offer: RTCSessionDescriptionInit
): Promise<void> {
  try {
    const { db } = initFirebase()

    if (!offer.sdp) {
      throw new Error('SDP inválido')
    }

    await updateDoc(doc(db, 'rooms', roomId), {
      offer: {
        type: offer.type || 'offer',
        sdp: offer.sdp,
        createdAt: serverTimestamp(),
      },
    })

    console.log(`✅ Offer salvo em Firestore: ${roomId}`)
  } catch (error) {
    console.error('❌ Erro ao salvar offer:', error)
    throw error
  }
}

/**
 * Obtém a oferta de uma sala
 */
export async function getOffer(roomId: string): Promise<RTCSessionDescriptionInit | null> {
  try {
    const { db } = initFirebase()

    const docSnap = await getDoc(doc(db, 'rooms', roomId))
    if (docSnap.exists()) {
      const data = docSnap.data() as RoomData
      if (data.offer) {
        return {
          type: 'offer' as const,
          sdp: data.offer.sdp,
        }
      }
    }
    return null
  } catch (error) {
    console.error('❌ Erro ao buscar offer:', error)
    throw error
  }
}

/**
 * Salva a resposta (answer) SDP em uma sala
 */
export async function saveAnswer(
  roomId: string,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  try {
    const { db } = initFirebase()

    if (!answer.sdp) {
      throw new Error('SDP inválido')
    }

    await updateDoc(doc(db, 'rooms', roomId), {
      answer: {
        type: answer.type || 'answer',
        sdp: answer.sdp,
        createdAt: serverTimestamp(),
      },
    })

    console.log(`✅ Answer salvo em Firestore: ${roomId}`)
  } catch (error) {
    console.error('❌ Erro ao salvar answer:', error)
    throw error
  }
}

/**
 * Adiciona um ICE candidate a uma sala
 */
export async function addIceCandidate(
  roomId: string,
  candidate: RTCIceCandidate
): Promise<void> {
  try {
    const { db } = initFirebase()

    const iceCandidatesRef = collection(db, 'rooms', roomId, 'iceCandidates')
    const candidateDoc = doc(iceCandidatesRef)

    await setDoc(candidateDoc, {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      createdAt: serverTimestamp(),
    })

    console.log(`✅ ICE candidate salvo: ${roomId}`)
  } catch (error) {
    console.error('❌ Erro ao salvar ICE candidate:', error)
    // Não falhar completamente por um ICE candidate
  }
}

/**
 * Inicializa o Firebase (pode ser chamado na raiz do app para pré-aquecer)
 */
export function initFirebaseApp() {
  return initFirebase()
}
