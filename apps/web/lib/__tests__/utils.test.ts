import { describe, expect, test } from 'bun:test'
import { sanitizeName } from '../utils'

describe('sanitizeName', () => {
  test('lowercases, strips whitespace, and caps at 15 characters', () => {
    expect(sanitizeName('Nova')).toBe('nova')
    expect(sanitizeName('John Doe')).toBe('johndoe')
    expect(sanitizeName('  Ada  Lovelace  ')).toBe('adalovelace')
    expect(sanitizeName('Someone With A Very Long Name')).toBe('someonewithaver')
  })
})
