import { describe, expect, test } from 'bun:test'
import { holdLastValue, normalizePoints } from './market-series.ts'

/** Same window math Liveline uses for multi-series (badge off). */
function livelineVisible(points: { time: number; value: number }[], now: number, windowSecs = 60) {
  const buffer = 0.015
  const rightEdge = now + windowSecs * buffer
  const leftEdge = rightEdge - windowSecs
  return points.filter((point) => point.time >= leftEdge - 2 && point.time <= now)
}

function liveTipOnly(history: { time: number; value: number }[], now: number) {
  const liveValue = history.at(-1)?.value
  if (liveValue === undefined) return history
  return normalizePoints([
    ...history,
    { time: now - 1, value: liveValue },
    { time: now, value: liveValue },
  ])
}

describe('1m window last-value holes', () => {
  const now = 1_000_000
  const history = [
    { time: now - 90, value: 0.55 },
    { time: now - 20, value: 0.8 },
  ]

  test('repro: live tip only starts the 1m stroke mid-window', () => {
    const visible = livelineVisible(liveTipOnly(history, now), now)
    expect(visible[0]?.time).toBeGreaterThan(now - 40)
  })

  test('holdLastValue carries 0.55 from the left edge then steps to 0.80', () => {
    const visible = livelineVisible(holdLastValue(history, now), now)

    expect(visible[0]?.time).toBeLessThanOrEqual(now - 58)
    expect(visible[0]?.value).toBe(0.55)

    const held = visible.filter((point) => point.time < now - 20)
    expect(held.at(-1)?.value).toBe(0.55)
    expect(visible.find((point) => point.time === now - 20)?.value).toBe(0.8)
    expect(visible.at(-1)?.value).toBe(0.8)
    expect(visible.at(-1)?.time).toBe(now)
  })
})
