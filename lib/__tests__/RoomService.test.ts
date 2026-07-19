import { describe, it, expect } from 'vitest'

describe('Room Code Format', () => {
  it('matches XXX-XXX pattern', () => {
    const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
    expect(codeRegex.test('ABC-123')).toBe(true)
    expect(codeRegex.test('XYZ-999')).toBe(true)
    expect(codeRegex.test('abc-123')).toBe(false)
    expect(codeRegex.test('ABC-12')).toBe(false)
    expect(codeRegex.test('ABCD-123')).toBe(false)
  })

  it('generates valid room codes from crypto getRandomValues', () => {
    const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    for (let i = 0; i < 100; i++) {
      const array = new Uint8Array(6)
      crypto.getRandomValues(array)
      const part1 = Array.from(array.slice(0, 3)).map(b => chars[b % 36]).join('')
      const part2 = Array.from(array.slice(3, 6)).map(b => chars[b % 36]).join('')
      const code = `${part1}-${part2}`
      expect(codeRegex.test(code)).toBe(true)
    }
  })
})
