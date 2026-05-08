/**
 * Testes para geração de Room IDs
 * Story 1.1, Tarefa 2
 */

import { generateRoomId, isValidRoomId } from '@/lib/roomId'

describe('generateRoomId', () => {
  it('deve gerar IDs com 8 caracteres', () => {
    const roomId = generateRoomId()
    expect(roomId).toHaveLength(8)
  })

  it('deve usar apenas caracteres válidos (A-Z, 2-9)', () => {
    const validChars = /^[A-Z2-9]{8}$/
    for (let i = 0; i < 100; i++) {
      const roomId = generateRoomId()
      expect(roomId).toMatch(validChars)
    }
  })

  it('deve gerar IDs únicos (não sequenciais)', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const roomId = generateRoomId()
      expect(ids.has(roomId)).toBe(false) // Nenhuma duplicata
      ids.add(roomId)
    }
    expect(ids.size).toBe(1000)
  })

  it('não deve usar caracteres confusos (I, O, 1, l)', () => {
    for (let i = 0; i < 100; i++) {
      const roomId = generateRoomId()
      expect(roomId).not.toMatch(/[IOl1]/)
    }
  })

  it('deve ser performático (< 10ms para 100 gerações)', () => {
    const start = performance.now()
    for (let i = 0; i < 100; i++) {
      generateRoomId()
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10) // 10ms para 100 IDs = 0.1ms cada
  })
})

describe('isValidRoomId', () => {
  it('deve aceitar IDs válidos', () => {
    expect(isValidRoomId('ABCD2345')).toBe(true)
    expect(isValidRoomId('ZZZZZZZ2')).toBe(true)
    expect(isValidRoomId('A2B3C4D5')).toBe(true)
  })

  it('deve rejeitar IDs com comprimento incorreto', () => {
    expect(isValidRoomId('ABCD123')).toBe(false) // 7 chars
    expect(isValidRoomId('ABCD12345')).toBe(false) // 9 chars
  })

  it('deve rejeitar IDs com caracteres inválidos', () => {
    expect(isValidRoomId('ABCD123I')).toBe(false) // I
    expect(isValidRoomId('ABCD123O')).toBe(false) // O
    expect(isValidRoomId('ABCD123l')).toBe(false) // l (lowercase)
    expect(isValidRoomId('ABCD1231')).toBe(false) // 1
  })

  it('deve rejeitar IDs em minúsculas', () => {
    expect(isValidRoomId('abcd1234')).toBe(false)
  })
})
