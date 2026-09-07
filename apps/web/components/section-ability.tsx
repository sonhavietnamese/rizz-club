'use client'

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

export default function SectionAbility() {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  const syncFades = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const { left, right } = readOverflowEdges(el)
    setShowLeftFade(left)
    setShowRightFade(right)
  }, [])

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    syncFades()
    el.addEventListener('scroll', syncFades, { passive: true })

    const observer = new ResizeObserver(syncFades)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', syncFades)
      observer.disconnect()
    }
  }, [syncFades])

  return (
    <section className="section-panel h-[180px] flex-none p-2 relative">
      <ul ref={scrollerRef} className="w-full h-full flex gap-2 overflow-x-auto hide-scrollbar rounded-lg relative">
        {CARDS.map((card) => (
          <li key={card.id}>
            <figure className="cursor-pointer aspect-[368/528] h-full">
              <Image
                draggable={false}
                src={card.image}
                alt={card.id.toString()}
                width={368}
                height={528}
                className="w-full h-full object-cover"
              />
            </figure>
          </li>
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
    </section>
  )
}
