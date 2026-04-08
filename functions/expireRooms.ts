/**
 * Cloud Function: Expiração de Salas
 * Story 1.1, Tarefa 6
 *
 * Função agendada que:
 * - Roda a cada 5 minutos
 * - Deleta salas que expiraram (expiresAt < now)
 * - Status "waiting" (sem convidado entrou)
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

/**
 * Cloud Function - Scheduled
 * Executa a cada 5 minutos (*/5 * * * *)
 */
export const expireRooms = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      const now = new Date()
      console.log(`[${now.toISOString()}] 🧹 Iniciando limpeza de salas expiradas`)

      // Buscar todas as salas com status "waiting" que expiraram
      const query = db
        .collection('rooms')
        .where('status', '==', 'waiting')
        .where('expiresAt', '<', now)

      const snapshot = await query.get()

      if (snapshot.empty) {
        console.log('✅ Nenhuma sala para expirar')
        return {
          success: true,
          expired: 0,
        }
      }

      // Deletar salas expiradas
      let deletedCount = 0
      const batch = db.batch()

      snapshot.forEach((doc) => {
        const room = doc.data()
        console.log(`🗑️ Deletando sala: ${doc.id} (expirou em ${room.expiresAt})`)
        batch.delete(doc.ref)
        deletedCount++
      })

      await batch.commit()

      console.log(`✅ ${deletedCount} sala(s) deletada(s)`)
      return {
        success: true,
        expired: deletedCount,
      }
    } catch (error) {
      console.error('❌ Erro ao expirar salas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  })

/**
 * Cloud Function - On Demand
 * Endpoint HTTP para testar expiração manualmente
 * POST /expireRooms
 */
export const expireRoomsHttp = functions.https.onRequest(async (req, res) => {
  // Verificar autenticação (pode usar secret token)
  const token = req.headers.authorization
  if (token !== `Bearer ${process.env.EXPIRE_ROOMS_SECRET}`) {
    res.status(401).json({ error: 'Não autorizado' })
    return
  }

  try {
    const now = new Date()
    console.log(`[${now.toISOString()}] 🧹 Limpeza manual de salas`)

    const query = db
      .collection('rooms')
      .where('status', '==', 'waiting')
      .where('expiresAt', '<', now)

    const snapshot = await query.get()
    let deletedCount = 0

    const batch = db.batch()
    snapshot.forEach((doc) => {
      batch.delete(doc.ref)
      deletedCount++
    })

    if (deletedCount > 0) {
      await batch.commit()
    }

    res.json({
      success: true,
      expired: deletedCount,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('❌ Erro:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })
  }
})
