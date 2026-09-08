export const ABILITY_FRONT_COLOR = '#E8E4DC'
export const ABILITY_ACCENT = '#7C5CFF'

export type AbilityCard = {
  id: number
  image: string
  name: string
}

export type AbilityDrag = {
  card: AbilityCard
  revealed: boolean
  width: number
  height: number
  originIndex: number
  grabX: number
  grabY: number
}

export const ABILITY_CARDS: AbilityCard[] = [
  { id: 1, image: '/card-001.png', name: 'Double price' },
  { id: 2, image: '/card-002.png', name: 'Iron hands' },
  { id: 3, image: '/card-003.png', name: 'Fast fill' },
  { id: 4, image: '/card-004.png', name: 'Last stand' },
]

export function insertAt<T>(list: T[], index: number, item: T) {
  const next = list.slice()
  const clamped = Math.max(0, Math.min(index, next.length))
  next.splice(clamped, 0, item)
  return next
}

export function appendUnique(list: AbilityCard[], card: AbilityCard) {
  if (list.some((item) => item.id === card.id)) return list
  return [...list, card]
}

export function toggleFlippedId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

export const DRAG_LEAN_MAX_DEG = 18
export const DRAG_LEAN_FROM_LAG = 0.12

export function dragLeanFromLag(lagX: number) {
  return Math.max(-DRAG_LEAN_MAX_DEG, Math.min(DRAG_LEAN_MAX_DEG, lagX * DRAG_LEAN_FROM_LAG))
}

export function dragLeanDeg({
  vx,
  vy,
  width,
  height,
  grabX,
  grabY,
}: {
  vx: number
  vy: number
  width: number
  height: number
  grabX: number
  grabY: number
}) {
  const comX = width / 2 - grabX
  const comY = height / 2 - grabY
  const hang = Math.max(
    -6,
    Math.min(6, ((Math.atan2(comX, Math.max(comY, 24)) * 180) / Math.PI) * 0.15),
  )
  const trail = (comY * vx - comX * vy) * 0.00042
  return Math.max(-DRAG_LEAN_MAX_DEG, Math.min(DRAG_LEAN_MAX_DEG, hang + trail))
}
