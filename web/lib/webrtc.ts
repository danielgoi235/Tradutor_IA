/**
 * WebRTC Peer Connection Management
 * Story 1.1, Tarefa 4: Iniciar WebRTC P2P
 */

export interface RTCConfig {
  iceServers?: RTCIceServer[]
  signalingUrl?: string
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302'] },
  { urls: ['stun:stun1.l.google.com:19302'] },
  { urls: ['stun:stun2.l.google.com:19302'] },
]

/**
 * Gerencia a conexão WebRTC P2P entre dois peers
 */
export class RTCPeerManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private dataChannel: RTCDataChannel | null = null
  private config: RTCConfig

  constructor(config?: RTCConfig) {
    this.config = {
      iceServers: config?.iceServers || DEFAULT_ICE_SERVERS,
      ...config,
    }
  }

  /**
   * Cria a peer connection e inicia o fluxo de oferecimento
   * Chamado pelo ANFITRIÃO para criar a sala
   */
  async createPeerConnection(roomId: string, userId: string): Promise<RTCSessionDescriptionInit> {
    try {
      console.log(`🚀 [${roomId}] Criando peer connection para ${userId}`)

      // 1. Criar RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
      })

      // 2. Adicionar audio track (solicitar permissão do usuário)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false, // Apenas áudio para tradução de voz
      })

      // Adicionar tracks ao peer connection
      for (const track of this.localStream.getTracks()) {
        this.peerConnection.addTrack(track, this.localStream)
      }

      console.log(`✅ [${roomId}] Audio track adicionado`)

      // 3. Criar data channel para mensagens de sinalização
      this.dataChannel = this.peerConnection.createDataChannel('messages', {
        ordered: true,
      })
      this.setupDataChannelListeners(this.dataChannel)

      // 4. Setup event listeners
      this.setupPeerConnectionListeners(roomId, userId)

      // 5. Gerar SDP Offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      // Setar a oferta como descrição local
      await this.peerConnection.setLocalDescription(offer)

      console.log(`✅ [${roomId}] Offer SDP criado:`, offer.type)

      return offer
    } catch (error) {
      console.error(`❌ [${roomId}] Erro ao criar peer connection:`, error)
      this.cleanup()
      throw error
    }
  }

  /**
   * Processa a resposta (answer) do convidado
   * Chamado quando o CONVIDADO se conecta
   */
  async handleAnswer(answer: RTCSessionDescriptionInit, roomId: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection não foi inicializado')
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      console.log(`✅ [${roomId}] Answer recebido e processado`)
    } catch (error) {
      console.error(`❌ [${roomId}] Erro ao processar answer:`, error)
      throw error
    }
  }

  /**
   * Adiciona um ICE candidate recebido do outro peer
   */
  async addIceCandidate(candidate: RTCIceCandidate, roomId: string): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection não foi inicializado')
      }

      await this.peerConnection.addIceCandidate(candidate)
      console.log(`✅ [${roomId}] ICE candidate adicionado`)
    } catch (error) {
      console.error(`❌ [${roomId}] Erro ao adicionar ICE candidate:`, error)
      // Não falhar completamente por erro de ICE candidate individual
    }
  }

  /**
   * Configura listeners da peer connection
   */
  private setupPeerConnectionListeners(roomId: string, userId: string): void {
    if (!this.peerConnection) return

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`📡 [${roomId}] ICE candidate gerado:`, event.candidate.candidate)
        // Evento será disparado para salvar em Firestore
        window.dispatchEvent(
          new CustomEvent('ice-candidate', {
            detail: { roomId, candidate: event.candidate },
          })
        )
      }
    }

    // Estado da conexão
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log(`🔗 [${roomId}] Estado da conexão: ${state}`)

      window.dispatchEvent(
        new CustomEvent('connection-state-change', {
          detail: { roomId, state },
        })
      )

      if (state === 'connected') {
        console.log(`✅ [${roomId}] Conexão estabelecida!`)
      } else if (state === 'failed') {
        console.error(`❌ [${roomId}] Falha na conexão`)
      }
    }

    // ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(`❄️ [${roomId}] ICE state: ${this.peerConnection?.iceConnectionState}`)
    }

    // Receber remote stream
    this.peerConnection.ontrack = (event) => {
      console.log(`📹 [${roomId}] Remote track recebido:`, event.track.kind)
      window.dispatchEvent(
        new CustomEvent('remote-stream', {
          detail: { roomId, stream: event.streams[0] },
        })
      )
    }

    // Receber data channel do outro peer
    this.peerConnection.ondatachannel = (event) => {
      console.log(`📨 [${roomId}] Data channel recebido`)
      this.dataChannel = event.channel
      this.setupDataChannelListeners(this.dataChannel)
    }
  }

  /**
   * Configura listeners do data channel para mensagens
   */
  private setupDataChannelListeners(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('📨 Data channel aberto')
      window.dispatchEvent(new CustomEvent('datachannel-open'))
    }

    channel.onclose = () => {
      console.log('📨 Data channel fechado')
      window.dispatchEvent(new CustomEvent('datachannel-close'))
    }

    channel.onmessage = (event) => {
      console.log('📨 Mensagem recebida:', event.data)
      window.dispatchEvent(
        new CustomEvent('datachannel-message', {
          detail: { message: event.data },
        })
      )
    }

    channel.onerror = (error) => {
      console.error('❌ Erro no data channel:', error)
    }
  }

  /**
   * Envia mensagem através do data channel
   */
  sendMessage(message: string): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('❌ Data channel não está aberto')
      return
    }

    this.dataChannel.send(message)
    console.log('📨 Mensagem enviada:', message)
  }

  /**
   * Obtém o estado atual da conexão
   */
  getConnectionState(): string {
    return this.peerConnection?.connectionState || 'disconnected'
  }

  /**
   * Obtém o estado do ICE
   */
  getIceConnectionState(): string {
    return this.peerConnection?.iceConnectionState || 'disconnected'
  }

  /**
   * Limpa recursos (chamado ao sair ou com erro)
   */
  cleanup(): void {
    console.log('🧹 Limpando recursos WebRTC')

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
  }

  /**
   * Obtém o local stream (para visualização no frontend)
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }
}

// Singleton para gerenciar a peer connection globalmente
let globalPeerManager: RTCPeerManager | null = null

export function getPeerManager(config?: RTCConfig): RTCPeerManager {
  if (!globalPeerManager) {
    globalPeerManager = new RTCPeerManager(config)
  }
  return globalPeerManager
}

export function resetPeerManager(): void {
  if (globalPeerManager) {
    globalPeerManager.cleanup()
    globalPeerManager = null
  }
}
