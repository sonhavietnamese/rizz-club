'use client'

import AbilityDragLayer from '@/components/ability-drag-layer'
import { ABILITY_CARDS, appendUnique, dragLeanDeg, insertAt, type AbilityCard, type AbilityDrag } from '@/lib/ability'
import { useAbilityFlippedStore } from '@/stores/ability'
import { animate, type AnimationPlaybackControls } from 'motion'
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const RETURN_SPRING = { type: 'spring' as const, duration: 0.5, bounce: 0.15 }
const LEAN_SPRING = { stiffness: 150, damping: 9, mass: 1 }
const APPLY_DURATION_S = 0.2
const VELOCITY_SMOOTH = 0.45

type AbilityContextValue = {
  rack: AbilityCard[]
  applied: AbilityCard | null
  drag: AbilityDrag | null
  overIsland: boolean
  returning: boolean
  islandRef: React.RefObject<HTMLElement | null>
  slotRefs: React.RefObject<Map<number, HTMLElement>>
  beginDrag: (input: {
    card: AbilityCard
    revealed: boolean
    rect: DOMRect
    clientX: number
    clientY: number
    originIndex: number
  }) => void
  clearApplied: () => void
}

const AbilityContext = createContext<AbilityContextValue | null>(null)

function hitIsland(el: HTMLElement | null, clientX: number, clientY: number) {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
}

export function AbilityProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false
  const islandRef = useRef<HTMLElement | null>(null)
  const slotRefs = useRef(new Map<number, HTMLElement>())
  const grabRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ t: 0, x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0 })
  const playbackRef = useRef<AnimationPlaybackControls[]>([])
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const lift = useMotionValue(1)
  const fade = useMotionValue(1)
  const lean = useMotionValue(0)
  const rotate = useSpring(lean, LEAN_SPRING)
  const [rack, setRack] = useState(ABILITY_CARDS)
  const [applied, setApplied] = useState<AbilityCard | null>(null)
  const [drag, setDrag] = useState<AbilityDrag | null>(null)
  const [overIsland, setOverIsland] = useState(false)
  const [returning, setReturning] = useState(false)

  const dragRef = useRef<AbilityDrag | null>(null)
  const appliedRef = useRef<AbilityCard | null>(null)
  const returningRef = useRef(false)
  const unbindRef = useRef<(() => void) | null>(null)

  const stopPlayback = useCallback(() => {
    for (const playback of playbackRef.current) playback.stop()
    playbackRef.current = []
  }, [])

  const resetOverlay = useCallback(() => {
    lift.set(1)
    fade.set(1)
    lean.jump(0)
    rotate.jump(0)
  }, [fade, lean, lift, rotate])

  const unbindPointer = useCallback(() => {
    unbindRef.current?.()
    unbindRef.current = null
  }, [])

  const finishApply = useCallback(
    (card: AbilityCard) => {
      unbindPointer()
      const previous = appliedRef.current
      appliedRef.current = card
      setApplied(card)
      if (previous && previous.id !== card.id) {
        setRack((rackNow) => appendUnique(rackNow, previous))
      }
      dragRef.current = null
      returningRef.current = false
      setDrag(null)
      setReturning(false)
      setOverIsland(false)
      resetOverlay()
    },
    [resetOverlay, unbindPointer],
  )

  const finishReturn = useCallback(
    (card: AbilityCard, originIndex: number) => {
      unbindPointer()
      setRack((current) => {
        if (current.some((item) => item.id === card.id)) return current
        return insertAt(current, originIndex, card)
      })
      dragRef.current = null
      returningRef.current = false
      setDrag(null)
      setReturning(false)
      setOverIsland(false)
      resetOverlay()
    },
    [resetOverlay, unbindPointer],
  )

  const beginDrag = useCallback(
    (input: {
      card: AbilityCard
      revealed: boolean
      rect: DOMRect
      clientX: number
      clientY: number
      originIndex: number
    }) => {
      if (!input.revealed) return
      stopPlayback()
      unbindPointer()
      grabRef.current = { x: input.clientX - input.rect.left, y: input.clientY - input.rect.top }
      velocityRef.current = { t: performance.now(), x: input.clientX, y: input.clientY, vx: 0, vy: 0, svx: 0, svy: 0 }
      x.set(input.clientX - grabRef.current.x)
      y.set(input.clientY - grabRef.current.y)
      lift.set(reduceMotion ? 1 : 1.06)
      fade.set(1)
      lean.jump(0)
      rotate.jump(0)
      returningRef.current = false
      setReturning(false)
      setOverIsland(hitIsland(islandRef.current, input.clientX, input.clientY))
      const session: AbilityDrag = {
        card: input.card,
        revealed: input.revealed,
        width: input.rect.width,
        height: input.rect.height,
        originIndex: input.originIndex,
        grabX: grabRef.current.x,
        grabY: grabRef.current.y,
      }
      dragRef.current = session
      setDrag(session)
      setRack((current) => current.filter((item) => item.id !== input.card.id))

      const applyLean = (svx: number, svy: number) => {
        if (reduceMotion || !dragRef.current) return
        lean.set(
          dragLeanDeg({
            vx: svx,
            vy: svy,
            width: dragRef.current.width,
            height: dragRef.current.height,
            grabX: grabRef.current.x,
            grabY: grabRef.current.y,
          }),
        )
      }

      let rafId = 0
      let resting = false
      const tick = (now: number) => {
        if (!dragRef.current || returningRef.current) {
          rafId = 0
          return
        }

        const previous = velocityRef.current
        if (!reduceMotion && now - previous.t > 48) {
          if (!resting) {
            resting = true
            applyLean(0, 0)
          }
        } else {
          resting = false
        }

        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)

      const onMove = (event: PointerEvent) => {
        if (!dragRef.current || returningRef.current) return
        const nextX = event.clientX - grabRef.current.x
        const nextY = event.clientY - grabRef.current.y
        const now = performance.now()
        const previous = velocityRef.current
        const dt = now - previous.t
        if (dt > 0) {
          const vx = ((event.clientX - previous.x) / dt) * 1000
          const vy = ((event.clientY - previous.y) / dt) * 1000
          const svx = previous.svx + (vx - previous.svx) * VELOCITY_SMOOTH
          const svy = previous.svy + (vy - previous.svy) * VELOCITY_SMOOTH
          velocityRef.current = { t: now, x: event.clientX, y: event.clientY, vx, vy, svx, svy }
          applyLean(svx, svy)
        }
        x.set(nextX)
        y.set(nextY)
        const nextOver = hitIsland(islandRef.current, event.clientX, event.clientY)
        setOverIsland((current) => (current === nextOver ? current : nextOver))
      }

      const onUp = (event: PointerEvent) => {
        const current = dragRef.current
        if (!current || returningRef.current) return
        unbindPointer()

        const currentX = event.clientX - grabRef.current.x
        const currentY = event.clientY - grabRef.current.y
        const { vx, vy } = velocityRef.current
        const card = current.card
        const originIndex = current.originIndex
        lean.set(0)

        if (hitIsland(islandRef.current, event.clientX, event.clientY)) {
          if (reduceMotion) {
            finishApply(card)
            return
          }

          returningRef.current = true
          setReturning(true)
          setOverIsland(true)
          const island = islandRef.current?.getBoundingClientRect()
          const targetX = island ? island.left + island.width / 2 - current.width / 2 : currentX
          const targetY = island ? island.top + island.height / 2 - current.height / 2 : currentY
          const pairedX = animate(x, targetX, { duration: APPLY_DURATION_S, ease: EASE_OUT })
          const pairedY = animate(y, targetY, { duration: APPLY_DURATION_S, ease: EASE_OUT })
          const liftPlayback = animate(lift, 0.94, { duration: APPLY_DURATION_S, ease: EASE_OUT })
          const fadePlayback = animate(fade, 0, { duration: APPLY_DURATION_S, ease: EASE_OUT })
          playbackRef.current = [pairedX, pairedY, liftPlayback, fadePlayback]
          void pairedX.then(() => finishApply(card))
          return
        }

        returningRef.current = true
        setReturning(true)
        setOverIsland(false)
        setRack((items) => {
          if (items.some((item) => item.id === card.id)) return items
          return insertAt(items, originIndex, card)
        })

        const home = () => {
          const slot = slotRefs.current.get(card.id)
          if (!slot) {
            finishReturn(card, originIndex)
            return
          }

          const rect = slot.getBoundingClientRect()
          if (reduceMotion) {
            x.set(rect.left)
            y.set(rect.top)
            finishReturn(card, originIndex)
            return
          }

          const pairedX = animate(x, rect.left, { ...RETURN_SPRING, velocity: vx })
          const pairedY = animate(y, rect.top, { ...RETURN_SPRING, velocity: vy })
          const liftPlayback = animate(lift, 1, { duration: 0.2, ease: EASE_OUT })
          playbackRef.current = [pairedX, pairedY, liftPlayback]
          void pairedX.then(() => finishReturn(card, originIndex))
        }

        requestAnimationFrame(() => requestAnimationFrame(home))
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
      unbindRef.current = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        if (rafId) cancelAnimationFrame(rafId)
        rafId = 0
      }
    },
    [fade, finishApply, finishReturn, lean, lift, reduceMotion, rotate, stopPlayback, unbindPointer, x, y],
  )

  const clearApplied = useCallback(() => {
    const current = appliedRef.current
    if (!current) return
    appliedRef.current = null
    setApplied(null)
    setRack((rackNow) => appendUnique(rackNow, current))
  }, [])

  useEffect(() => {
    void useAbilityFlippedStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    if (!drag) return
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
    }
  }, [drag])

  useEffect(
    () => () => {
      stopPlayback()
      unbindPointer()
    },
    [stopPlayback, unbindPointer],
  )

  const value = useMemo<AbilityContextValue>(
    () => ({
      rack,
      applied,
      drag,
      overIsland,
      returning,
      islandRef,
      slotRefs,
      beginDrag,
      clearApplied,
    }),
    [applied, beginDrag, clearApplied, drag, overIsland, rack, returning],
  )

  return (
    <AbilityContext.Provider value={value}>
      {children}
      <AbilityDragLayer drag={drag} x={x} y={y} lift={lift} fade={fade} rotate={rotate} />
    </AbilityContext.Provider>
  )
}

export function useAbility() {
  const context = useContext(AbilityContext)
  if (!context) {
    throw new Error('useAbility must be used within AbilityProvider')
  }
  return context
}
