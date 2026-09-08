import { describe, expect, test } from 'bun:test'
import { ABILITY_CARDS } from '../ability'
import {
  advancePreloadPhase,
  PRELOAD_IMAGE_URLS,
  PRELOAD_REALTIME_PATHS,
  preloadCanReveal,
  preloadFadeMs,
} from '../preload'
import { TRADERS_PATH } from '../traders'

describe('preloadCanReveal', () => {
  test('stays covered until privy, data, and the minimum hold have all landed', () => {
    expect(preloadCanReveal({ privyReady: true, dataSettled: true, minElapsed: false, timedOut: false })).toBe(false)
    expect(preloadCanReveal({ privyReady: false, dataSettled: true, minElapsed: true, timedOut: false })).toBe(false)
    expect(preloadCanReveal({ privyReady: true, dataSettled: false, minElapsed: true, timedOut: false })).toBe(false)
  })

  test('reveals once auth and data are ready after the hold', () => {
    expect(preloadCanReveal({ privyReady: true, dataSettled: true, minElapsed: true, timedOut: false })).toBe(true)
  })

  test('reveals on timeout even if auth or data is still pending', () => {
    expect(preloadCanReveal({ privyReady: false, dataSettled: false, minElapsed: false, timedOut: true })).toBe(true)
  })
})

describe('advancePreloadPhase', () => {
  test('starts exiting when it can reveal', () => {
    expect(advancePreloadPhase('blocking', false)).toBe('blocking')
    expect(advancePreloadPhase('blocking', true)).toBe('exiting')
  })

  test('does not restart after it has left the screen', () => {
    expect(advancePreloadPhase('exiting', true)).toBe('exiting')
    expect(advancePreloadPhase('exiting', false)).toBe('exiting')
    expect(advancePreloadPhase('gone', true)).toBe('gone')
    expect(advancePreloadPhase('gone', false)).toBe('gone')
  })
})

describe('preloadFadeMs', () => {
  test('keeps a short opacity fade when motion is reduced', () => {
    expect(preloadFadeMs(false)).toBe(400)
    expect(preloadFadeMs(true)).toBe(200)
  })
})

describe('preload assets', () => {
  test('warms ability art and the live firebase paths', () => {
    for (const card of ABILITY_CARDS) {
      expect(PRELOAD_IMAGE_URLS).toContain(card.image)
    }
    expect(PRELOAD_REALTIME_PATHS).toEqual(['chat', TRADERS_PATH, 'market', 'trades'])
  })
})
