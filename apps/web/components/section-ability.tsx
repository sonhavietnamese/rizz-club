'use client'

import { animate } from 'motion'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

const CARDS = [
  {
    id: 1,
    image: '/card-001.png',
  },
  {
    id: 2,
    image: '/card-002.png',
  },
  {
    id: 3,
    image: '/card-003.png',
  },
  {
    id: 4,
    image: '/card-004.png',
  },
]

const edgeThresholdPx = 1
const SCROLL_DURATION_S = 0.2
const DRAG_THRESHOLD_PX = 10
const FRONT_COLOR = '#E8E4DC'
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const FLIP_SPRING = { type: 'spring' as const, duration: 0.65, bounce: 0.16 }

const fadeClassName =
  'pointer-events-none absolute inset-y-0 z-10 w-16 transition-opacity duration-200 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none'

function readOverflowEdges(el: HTMLElement) {
  const maxScroll = el.scrollWidth - el.clientWidth
  if (maxScroll <= edgeThresholdPx) {
    return { left: false, right: false }
  }

  return {
    left: el.scrollLeft > edgeThresholdPx,
    right: el.scrollLeft < maxScroll - edgeThresholdPx,
  }
}

function itemContentLeft(item: HTMLElement) {
  return item.offsetLeft
}

function nextHiddenScrollLeft(el: HTMLElement, direction: 'left' | 'right') {
  const items = Array.from(el.children) as HTMLElement[]
  const viewLeft = el.scrollLeft
  const viewRight = el.scrollLeft + el.clientWidth
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)

  if (direction === 'right') {
    const clipped = items.find((item) => itemContentLeft(item) + item.offsetWidth > viewRight + edgeThresholdPx)
    if (!clipped) return maxScroll
    return Math.min(maxScroll, Math.max(0, itemContentLeft(clipped) + clipped.offsetWidth - el.clientWidth))
  }

  const clipped = [...items].reverse().find((item) => itemContentLeft(item) < viewLeft - edgeThresholdPx)
  if (!clipped) return 0
  return Math.max(0, itemContentLeft(clipped))
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EdgeArrow({
  side,
  visible,
  onClick,
}: {
  side: 'left' | 'right'
  visible: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Show previous cards' : 'Show next cards'}
      tabIndex={visible ? 0 : -1}
      disabled={!visible}
      onClick={onClick}
      className={`absolute top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-[opacity,transform] duration-200 [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] motion-reduce:transition-none ${
        side === 'left' ? 'left-2' : 'right-2'
      } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <ChevronIcon className={side === 'right' ? 'rotate-180' : undefined} />
    </button>
  )
}

function AbilityCard({
  card,
  reduceMotion,
}: {
  card: (typeof CARDS)[number]
  reduceMotion: boolean
}) {
  const [revealed, setRevealed] = useState(false)
  const pointerRef = useRef({ x: 0, y: 0, dragged: false })

  const flip = () => {
    if (pointerRef.current.dragged) return
    setRevealed((current) => !current)
  }

  return (
    <li className={`relative h-full shrink-0 [perspective:800px] ${revealed ? 'z-10' : ''}`}>
      <button
        type="button"
        aria-pressed={revealed}
        aria-label={revealed ? `Hide card ${card.id}` : `Reveal card ${card.id}`}
        onPointerDown={(event) => {
          pointerRef.current = { x: event.clientX, y: event.clientY, dragged: false }
        }}
        onPointerMove={(event) => {
          if (pointerRef.current.dragged) return
          const dx = event.clientX - pointerRef.current.x
          const dy = event.clientY - pointerRef.current.y
          if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) pointerRef.current.dragged = true
        }}
        onClick={flip}
        className="relative h-full aspect-[376/536] bg-transparent p-0 transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] motion-reduce:transition-none"
      >
        {reduceMotion ? (
          <>
            <span
              className={`absolute inset-0 transition-opacity duration-200 [transition-timing-function:var(--ease-out)] ${
                revealed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <Image
                draggable={false}
                src={card.image}
                alt=""
                width={376}
                height={536}
                className="h-full w-full object-cover"
              />
            </span>
            <span
              aria-hidden={!revealed}
              className={`absolute inset-0 rounded-[10px] transition-opacity duration-200 [transition-timing-function:var(--ease-out)] ${
                revealed ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundColor: FRONT_COLOR }}
            />
          </>
        ) : (
          <>
            <motion.span
              className="relative block h-full w-full [transform-style:preserve-3d]"
              initial={false}
              animate={{ transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              transition={FLIP_SPRING}
            >
              <span className="absolute inset-0 [backface-visibility:hidden] [transform:translateZ(0.5px)]">
                <Image
                  draggable={false}
                  src={card.image}
                  alt=""
                  width={376}
                  height={536}
                  className="h-full w-full object-cover"
                />
              </span>
              <span
                aria-hidden={!revealed}
                className="absolute inset-0 rounded-[10px] [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.5px)]"
                style={{ backgroundColor: FRONT_COLOR }}
              />
            </motion.span>
          </>
        )}
      </button>
    </li>
  )
}

export default function SectionAbility() {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const playbackRef = useRef<ReturnType<typeof animate> | null>(null)
  const reduceMotion = useReducedMotion() ?? false
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  const syncFades = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const { left, right } = readOverflowEdges(el)
    setShowLeftFade(left)
    setShowRightFade(right)
  }, [])

  const scrollToHidden = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollerRef.current
      if (!el) return

      const target = nextHiddenScrollLeft(el, direction)
      if (Math.abs(target - el.scrollLeft) <= edgeThresholdPx) return

      playbackRef.current?.stop()

      if (reduceMotion) {
        el.scrollLeft = target
        syncFades()
        return
      }

      playbackRef.current = animate(el.scrollLeft, target, {
        duration: SCROLL_DURATION_S,
        ease: EASE_IN_OUT,
        onUpdate: (value) => {
          el.scrollLeft = value
        },
        onComplete: () => {
          playbackRef.current = null
        },
      })
    },
    [reduceMotion, syncFades],
  )

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const stopPlayback = () => playbackRef.current?.stop()

    syncFades()
    el.addEventListener('scroll', syncFades, { passive: true })
    el.addEventListener('wheel', stopPlayback, { passive: true })
    el.addEventListener('touchstart', stopPlayback, { passive: true })

    const observer = new ResizeObserver(syncFades)
    observer.observe(el)

    return () => {
      playbackRef.current?.stop()
      el.removeEventListener('scroll', syncFades)
      el.removeEventListener('wheel', stopPlayback)
      el.removeEventListener('touchstart', stopPlayback)
      observer.disconnect()
    }
  }, [syncFades])

  return (
    <section className="section-panel relative h-[180px] flex-none p-2">
      <ul ref={scrollerRef} className="relative flex h-full w-full gap-2 overflow-x-auto rounded-lg hide-scrollbar">
        {CARDS.map((card) => (
          <AbilityCard key={card.id} card={card} reduceMotion={reduceMotion} />
        ))}
      </ul>

      <div
        aria-hidden
        className={`${fadeClassName} left-0 rounded-l-2xl bg-gradient-to-r from-section-background to-transparent ${
          showLeftFade ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden
        className={`${fadeClassName} right-0 rounded-r-2xl bg-gradient-to-l from-section-background to-transparent ${
          showRightFade ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <EdgeArrow side="left" visible={showLeftFade} onClick={() => scrollToHidden('left')} />
      <EdgeArrow side="right" visible={showRightFade} onClick={() => scrollToHidden('right')} />
    </section>
  )
}
