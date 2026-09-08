import { describe, expect, test } from 'bun:test'
import { ABILITY_CARDS, appendUnique, dragLeanDeg, insertAt, toggleFlippedId } from './ability'

describe('appendUnique', () => {
  test('appends a card that is not already in the rack', () => {
    const [first, second] = ABILITY_CARDS
    expect(appendUnique([first], second)).toEqual([first, second])
  })

  test('does not duplicate a card already in the rack', () => {
    const [first, second] = ABILITY_CARDS
    expect(appendUnique([first, second], first)).toEqual([first, second])
  })
})

describe('insertAt', () => {
  test('reinserts at the original index', () => {
    const [first, second, third] = ABILITY_CARDS
    expect(insertAt([second, third], 0, first)).toEqual([first, second, third])
  })
})

describe('dragLeanDeg', () => {
  const topGrab = { width: 115, height: 164, grabX: 57.5, grabY: 24 }

  test('trails opposite a rightward swipe when held near the top', () => {
    expect(dragLeanDeg({ ...topGrab, vx: 500, vy: 0 })).toBeLessThan(0)
  })

  test('hangs near upright when held still at the top center', () => {
    expect(dragLeanDeg({ ...topGrab, vx: 0, vy: 0 })).toBeCloseTo(0, 0)
  })

  test('clamps extreme flicks', () => {
    expect(dragLeanDeg({ ...topGrab, vx: 20000, vy: 0 })).toBe(-18)
    expect(dragLeanDeg({ ...topGrab, vx: -20000, vy: 0 })).toBe(18)
  })
})

describe('toggleFlippedId', () => {
  test('adds and removes an id', () => {
    expect(toggleFlippedId([], 1)).toEqual([1])
    expect(toggleFlippedId([1, 2], 1)).toEqual([2])
  })
})
