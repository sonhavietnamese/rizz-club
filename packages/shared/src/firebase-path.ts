const firebaseKeyForbidden = new Set(['.', '#', '$', '[', ']', '/'])

export const TRADERS_PATH = 'traders'
export const ANONYMOUS_FIELD = 'anonymous'
export const PRESENCE_HEARTBEAT_MS = 15_000
export const PRESENCE_TTL_MS = 45_000

export function firebaseKey(id: string) {
  let key = ''
  for (let i = 0; i < id.length; i++) {
    const char = id[i] ?? ''
    key += firebaseKeyForbidden.has(char) ? '_' : char
  }
  return key
}

export function traderKey(id: string) {
  return firebaseKey(id.toLowerCase())
}
