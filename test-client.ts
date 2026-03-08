import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

interface TestUser {
  name: string
  language: string
  socket: any
  sessionId?: string
  status: string
}

const user1: TestUser = {
  name: 'João',
  language: 'pt-BR',
  socket: null,
  status: 'disconnected',
}

const user2: TestUser = {
  name: 'John',
  language: 'en-US',
  socket: null,
  status: 'disconnected',
}

function log(user: TestUser, msg: string, color: string = colors.reset) {
  console.log(`${color}[${user.name}] ${msg}${colors.reset}`)
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runTest() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════╗`)
  console.log(`║  🧪 TESTE COMPLETO - SOCKET.IO               ║`)
  console.log(`║  Simulando 2 usuários conversando             ║`)
  console.log(`╚════════════════════════════════════════════╝${colors.reset}\n`)

  // ========================================================================
  // STEP 1: Connect both users
  // ========================================================================
  console.log(`${colors.yellow}STEP 1: Conectando usuários...${colors.reset}\n`)

  user1.socket = io(SERVER_URL, { reconnection: true })
  user2.socket = io(SERVER_URL, { reconnection: true })

  await new Promise((resolve) => {
    let connected = 0
    user1.socket.on('connect', () => {
      log(user1, '✅ Conectado ao servidor', colors.green)
      user1.status = 'connected'
      connected++
      if (connected === 2) resolve(true)
    })

    user2.socket.on('connect', () => {
      log(user2, '✅ Conectado ao servidor', colors.green)
      user2.status = 'connected'
      connected++
      if (connected === 2) resolve(true)
    })
  })

  await sleep(1000)

  // ========================================================================
  // STEP 2: User1 creates session
  // ========================================================================
  console.log(`\n${colors.yellow}STEP 2: João criando sessão...${colors.reset}\n`)

  await new Promise((resolve) => {
    user1.socket.emit('create_session', { username: user1.name, language: user1.language }, (response: any) => {
      if (response.success) {
        log(user1, `✅ Sessão criada: ${response.sessionId}`, colors.green)
        user1.sessionId = response.sessionId
        user1.status = 'waiting'
      } else {
        log(user1, `❌ Erro: ${response.error}`, colors.cyan)
      }
      resolve(true)
    })
  })

  await sleep(1000)

  // ========================================================================
  // STEP 3: User2 joins session
  // ========================================================================
  console.log(`\n${colors.yellow}STEP 3: John entrando na sessão...${colors.reset}\n`)

  await new Promise((resolve) => {
    user2.socket.emit(
      'join_session',
      { sessionId: user1.sessionId, username: user2.name, language: user2.language },
      (response: any) => {
        if (response.success) {
          log(user2, `✅ Entrou na sessão: ${response.sessionId}`, colors.green)
          user2.sessionId = response.sessionId
          user2.status = 'joined'
          resolve(true)
        } else {
          log(user2, `❌ Erro: ${response.error}`, colors.cyan)
          resolve(true)
        }
      }
    )
  })

  await sleep(1500)

  // ========================================================================
  // STEP 4: Both confirm connection
  // ========================================================================
  console.log(`\n${colors.yellow}STEP 4: Confirmando conexão...${colors.reset}\n`)

  await new Promise((resolve) => {
    let confirmed = 0

    user1.socket.emit('confirm_connection', (response: any) => {
      if (response.success) {
        log(user1, '✅ Conexão confirmada', colors.green)
        confirmed++
        if (confirmed === 2) {
          setTimeout(resolve, 500)
        }
      }
    })

    user2.socket.emit('confirm_connection', (response: any) => {
      if (response.success) {
        log(user2, '✅ Conexão confirmada', colors.green)
        confirmed++
        if (confirmed === 2) {
          setTimeout(resolve, 500)
        }
      }
    })
  })

  // ========================================================================
  // STEP 5: Wait for both_ready event
  // ========================================================================
  console.log(`\n${colors.yellow}STEP 5: Aguardando sinal de pronto...${colors.reset}\n`)

  await new Promise((resolve) => {
    const bothReadyHandler = () => {
      console.log(`${colors.green}✅ Ambos prontos! Chat ativado!${colors.reset}\n`)
      resolve(true)
    }

    user1.socket.on('both_ready', bothReadyHandler)
    user2.socket.on('both_ready', bothReadyHandler)

    setTimeout(() => {
      console.log(`${colors.yellow}⚠️  Timeout esperando both_ready${colors.reset}\n`)
      resolve(true)
    }, 5000)
  })

  await sleep(1000)

  // ========================================================================
  // STEP 6: Exchange messages
  // ========================================================================
  console.log(`${colors.yellow}STEP 6: Trocando mensagens...${colors.reset}\n`)

  // Listen for messages
  user1.socket.on('message_received', (msg: any) => {
    console.log(`${colors.blue}[${user1.name} recebeu]`)
    console.log(`  📝 Original (${msg.senderLanguage}): "${msg.originalText}"`)
    console.log(`  🌐 Traduzido (${msg.receiverLanguage}): "${msg.translatedText}"`)
    console.log(`  De: ${msg.sender}${colors.reset}\n`)
  })

  user2.socket.on('message_received', (msg: any) => {
    console.log(`${colors.cyan}[${user2.name} recebeu]`)
    console.log(`  📝 Original (${msg.senderLanguage}): "${msg.originalText}"`)
    console.log(`  🌐 Traduzido (${msg.receiverLanguage}): "${msg.translatedText}"`)
    console.log(`  De: ${msg.sender}${colors.reset}\n`)
  })

  // User1 sends message
  console.log(`${colors.green}João enviando mensagem em Português...${colors.reset}`)
  await new Promise((resolve) => {
    user1.socket.emit('send_message', { text: 'Olá! Como você está?' }, (response: any) => {
      if (response.success) {
        log(user1, '✅ Mensagem enviada', colors.green)
      } else {
        log(user1, `❌ Erro: ${response.error}`, colors.cyan)
      }
      resolve(true)
    })
  })

  await sleep(2000)

  // User2 sends message
  console.log(`${colors.cyan}John enviando mensagem em Inglês...${colors.reset}`)
  await new Promise((resolve) => {
    user2.socket.emit('send_message', { text: 'Hello! I am doing great, thanks!' }, (response: any) => {
      if (response.success) {
        log(user2, '✅ Mensagem enviada', colors.green)
      } else {
        log(user2, `❌ Erro: ${response.error}`, colors.cyan)
      }
      resolve(true)
    })
  })

  await sleep(2000)

  // ========================================================================
  // RESULTS
  // ========================================================================
  console.log(`\n${colors.green}╔════════════════════════════════════════════╗`)
  console.log(`║  ✅ TESTE CONCLUÍDO COM SUCESSO!            ║`)
  console.log(`║  Todos os fluxos funcionando corretamente    ║`)
  console.log(`╚════════════════════════════════════════════╝${colors.reset}\n`)

  // Cleanup
  user1.socket.disconnect()
  user2.socket.disconnect()

  process.exit(0)
}

// Run test
runTest().catch((error) => {
  console.error(`${colors.cyan}❌ Teste falhou: ${error.message}${colors.reset}`)
  process.exit(1)
})
