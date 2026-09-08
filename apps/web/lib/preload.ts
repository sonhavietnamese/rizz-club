import { ABILITY_CARDS } from '@/lib/ability'
import { TRADERS_PATH } from '@/lib/traders'

export const PRELOAD_MIN_MS = 700
export const PRELOAD_TIMEOUT_MS = 8_000
export const PRELOAD_FADE_MS = 400
export const PRELOAD_REDUCED_FADE_MS = 200

export const PRELOAD_REALTIME_PATHS = ['chat', TRADERS_PATH, 'market', 'trades'] as const

export const PRELOAD_IMAGE_URLS = [
  ...ABILITY_CARDS.map((card) => card.image),
  '/background-texture.png',
  '/icon.png',
  '/mark-orange.png',
  '/mark-purple.png',
]

export type PreloadPhase = 'blocking' | 'exiting' | 'gone'

export function preloadFadeMs(reduceMotion: boolean) {
  return reduceMotion ? PRELOAD_REDUCED_FADE_MS : PRELOAD_FADE_MS
}

export function preloadCanReveal(input: {
  privyReady: boolean
  dataSettled: boolean
  minElapsed: boolean
  timedOut: boolean
}) {
  if (input.timedOut) return true
  return input.privyReady && input.dataSettled && input.minElapsed
}

export function advancePreloadPhase(phase: PreloadPhase, canReveal: boolean): PreloadPhase {
  if (phase === 'gone' || phase === 'exiting') return phase
  return canReveal ? 'exiting' : 'blocking'
}
