import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

interface SessionUser {
  id: string;
  socketId: string;
  username: string;
  language: string;
  connected: boolean;
}

interface ChatSession {
  id: string;
  users: SessionUser[];
  createdAt: number;
  status: 'waiting' | 'both-confirmed' | 'active';
  messages: any[];
}

const sessions = new Map<string, ChatSession>();
const userSessions = new Map<string, string>(); // socketId -> sessionId

// Generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ============================================================================
// TRANSLATION
// ============================================================================

const translationCache = new Map<string, string>();

async function translateText(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  if (fromLang === toLang) return text;

  const cacheKey = `${fromLang}-${toLang}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey) || text;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Traduza este texto de ${fromLang} para ${toLang}. Responda APENAS com a tradução:\n\n"${text}"`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

// ============================================================================
// SOCKET.IO EVENTS
// ============================================================================

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);

  // ========================================================================
  // CREATE SESSION
  // ========================================================================
  socket.on('create_session', (data: { username: string; language: string }, callback) => {
    try {
      const sessionId = generateSessionId();
      const newSession: ChatSession = {
        id: sessionId,
        users: [
          {
            id: socket.id,
            socketId: socket.id,
            username: data.username,
            language: data.language,
            connected: true,
          },
        ],
        createdAt: Date.now(),
        status: 'waiting',
        messages: [],
      };

      sessions.set(sessionId, newSession);
      userSessions.set(socket.id, sessionId);
      socket.join(sessionId);

      console.log(`[CREATE] Session ${sessionId} created by ${data.username}`);

      callback({
        success: true,
        sessionId,
        message: `Sessão criada! Código: ${sessionId}`,
      });
    } catch (error) {
      console.error('Create session error:', error);
      callback({ success: false, error: 'Failed to create session' });
    }
  });

  // ========================================================================
  // JOIN SESSION
  // ========================================================================
  socket.on('join_session', (data: { sessionId: string; username: string; language: string }, callback) => {
    try {
      const session = sessions.get(data.sessionId.toUpperCase());

      if (!session) {
        return callback({ success: false, error: 'Sessão não encontrada' });
      }

      if (session.users.length >= 2) {
        return callback({ success: false, error: 'Sessão cheia (máximo 2 pessoas)' });
      }

      // Add user to session
      const newUser: SessionUser = {
        id: socket.id,
        socketId: socket.id,
        username: data.username,
        language: data.language,
        connected: true,
      };

      session.users.push(newUser);
      userSessions.set(socket.id, session.id);
      socket.join(session.id);

      console.log(`[JOIN] ${data.username} joined session ${session.id}`);

      // Notify both users
      io.to(session.id).emit('user_joined', {
        username: data.username,
        totalUsers: session.users.length,
        users: session.users.map((u) => ({
          id: u.id,
          username: u.username,
          language: u.language,
        })),
      });

      callback({
        success: true,
        sessionId: session.id,
        users: session.users.map((u) => ({
          id: u.id,
          username: u.username,
          language: u.language,
        })),
      });
    } catch (error) {
      console.error('Join session error:', error);
      callback({ success: false, error: 'Failed to join session' });
    }
  });

  // ========================================================================
  // CONFIRM CONNECTION
  // ========================================================================
  socket.on('confirm_connection', (callback) => {
    try {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) {
        return callback({ success: false, error: 'Session not found' });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return callback({ success: false, error: 'Session expired' });
      }

      // Find user and mark as confirmed
      const user = session.users.find((u) => u.id === socket.id);
      if (user) {
        user.connected = true;
      }

      // Check if both confirmed
      const allConfirmed = session.users.length === 2 && session.users.every((u) => u.connected);

      console.log(`[CONFIRM] ${user?.username} confirmed. AllConfirmed: ${allConfirmed}`);

      // Notify session
      io.to(sessionId).emit('connection_status', {
        confirmed: user?.username,
        allConfirmed,
        users: session.users.map((u) => ({
          username: u.username,
          connected: u.connected,
        })),
      });

      if (allConfirmed) {
        session.status = 'both-confirmed';
        io.to(sessionId).emit('both_ready', {
          message: 'Ambos confirmaram! Comecem a conversar!',
          users: session.users.map((u) => ({
            username: u.username,
            language: u.language,
          })),
        });
      }

      callback({ success: true, allConfirmed });
    } catch (error) {
      console.error('Confirm connection error:', error);
      callback({ success: false, error: 'Failed to confirm' });
    }
  });

  // ========================================================================
  // SEND MESSAGE WITH TRANSLATION
  // ========================================================================
  socket.on('send_message', async (data: { text: string }, callback) => {
    try {
      const sessionId = userSessions.get(socket.id);
      if (!sessionId) {
        return callback({ success: false, error: 'Session not found' });
      }

      const session = sessions.get(sessionId);
      if (!session || session.status !== 'both-confirmed') {
        return callback({ success: false, error: 'Session not ready' });
      }

      const sender = session.users.find((u) => u.id === socket.id);
      const receiver = session.users.find((u) => u.id !== socket.id);

      if (!sender || !receiver) {
        return callback({ success: false, error: 'User not found' });
      }

      // Translate message
      const translatedText = await translateText(data.text, sender.language, receiver.language);

      const message = {
        id: `${Date.now()}-${Math.random()}`,
        sender: sender.username,
        senderLanguage: sender.language,
        originalText: data.text,
        translatedText,
        receiverLanguage: receiver.language,
        timestamp: Date.now(),
      };

      session.messages.push(message);

      console.log(
        `[MESSAGE] ${sender.username} (${sender.language}): "${data.text}" -> "${translatedText}"`
      );

      // Send to receiver
      io.to(sessionId).emit('message_received', message);

      callback({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      callback({ success: false, error: 'Failed to send message' });
    }
  });

  // ========================================================================
  // DISCONNECT
  // ========================================================================
  socket.on('disconnect', () => {
    const sessionId = userSessions.get(socket.id);
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        session.users = session.users.filter((u) => u.id !== socket.id);
        console.log(`[DISCONNECT] User left session ${sessionId}. Users remaining: ${session.users.length}`);

        if (session.users.length === 0) {
          sessions.delete(sessionId);
          console.log(`[DELETE] Session ${sessionId} deleted`);
        } else {
          io.to(sessionId).emit('user_disconnected', {
            message: 'Outro usuário desconectou',
          });
        }
      }
      userSessions.delete(socket.id);
    }
    console.log(`[DISCONNECT] ${socket.id} disconnected`);
  });
});

// ============================================================================
// REST ENDPOINTS
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/sessions', (req, res) => {
  const sessionsList = Array.from(sessions.values()).map((s) => ({
    id: s.id,
    users: s.users.length,
    status: s.status,
    createdAt: new Date(s.createdAt).toISOString(),
  }));
  res.json(sessionsList);
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 TRADUTOR IA CHAT SERVER RODANDO        ║
║  📍 ws://localhost:${PORT}                  ║
║  💬 Socket.io ativo                        ║
╚════════════════════════════════════════════╝
  `);
});
