/**
 * Gera um ID único para a sala
 * Formato: 8 caracteres alfanuméricos (A-Z, 2-9)
 * Excluídos: I, O, 1, l (para evitar confusão visual)
 */
export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Valida se um ID de sala possui o formato correto
 */
export function isValidRoomId(roomId: string): boolean {
  return /^[A-Z2-9]{8}$/.test(roomId)
}
