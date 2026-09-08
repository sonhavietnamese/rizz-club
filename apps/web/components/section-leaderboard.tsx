'use client'

import { useLeaderboard } from '@/hooks/use-leaderboard'
import { formatCents, formatShares, type LeaderboardItem } from '@/lib/leaderboard'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import markOrange from '@/public/mark-orange.png'
import markPurple from '@/public/mark-purple.png'

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const profitColor = {
  up: '#2DD530',
  down: '#F87171',
} as const

function HeartbeatIcon() {
  return (
    <figure className="h-3 w-3">
      <svg className="h-full w-full" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.5 6.60254H3.22727L4.59091 0.102539L6.40909 10.1025L7.77273 5.60254H10.5"
          stroke="#6A7374"
          strokeLinecap="round"
        />
      </svg>
    </figure>
  )
}

function LeaderboardRow({ item, reduceMotion }: { item: LeaderboardItem; reduceMotion: boolean }) {
  const inProfit = item.profit >= 0

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: reduceMotion ? { duration: 0 } : { duration: 0.22, ease: EASE_IN_OUT },
        opacity: { duration: 0.18, ease: EASE_OUT },
      }}
      className="relative flex w-full gap-[10px] rounded-lg bg-background p-2"
    >
      <div>
        <figure className="aspect-square h-18 w-18 rounded bg-[#ff00ff] bg-cover bg-center p-[2px]">
          <Image
            draggable={false}
            src={item.avatar}
            alt={item.name}
            width={60}
            height={60}
            className="h-full w-full rounded-sm object-cover"
          />
        </figure>
      </div>

      <div className="flex flex-col items-start gap-2 py-1">
        <div className="font-sans text-lg font-medium text-white/90">{item.name}</div>
        <div className="mt-2 flex items-center justify-center gap-1">
          <HeartbeatIcon />
          <span className="font-sans text-xs font-medium text-[#6A7374]">{item.outcome}</span>
        </div>
      </div>

      <div className="absolute top-2 right-2.5 z-10 h-fit w-fit rounded-lg bg-[#222426]/40 px-2 py-1 backdrop-blur-sm">
        <span className="font-sans text-sm font-semibold text-[#B6BDBC]">
          {formatShares(item.shares)} {item.side === 'up' ? 'UP' : 'DOWN'} @ {formatCents(item.avgPrice)}
        </span>
      </div>

      <div className="absolute right-2 bottom-2 z-10 h-fit w-fit rounded-lg bg-[#222426]/40 px-2 py-1.5 backdrop-blur-sm">
        <span
          className="font-sans font-semibold tabular-nums"
          style={{ color: inProfit ? profitColor.up : profitColor.down }}
        >
          <NumberFlow
            value={item.profit}
            animated={!reduceMotion}
            format={{ style: 'currency', currency: 'USD', signDisplay: 'always', maximumFractionDigits: 2 }}
            transformTiming={{ duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
            spinTiming={{ duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
            opacityTiming={{ duration: 150, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
          />
        </span>
      </div>

      <figure className="absolute top-0 right-0 z-0 h-full w-auto overflow-hidden rounded-tr-lg rounded-br-lg">
        <Image
          draggable={false}
          src={item.side === 'up' ? markPurple : markOrange}
          alt=""
          width={200}
          height={70}
          className="h-full w-full"
        />
      </figure>
    </motion.li>
  )
}

export default function SectionLeaderboard() {
  const { items, status } = useLeaderboard()
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="section-panel flex min-h-0 flex-1 flex-col gap-2 overflow-hidden select-none">
      <motion.div layoutScroll className="min-h-0 flex-1 overflow-y-auto rounded-lg hide-scrollbar">
        {items.length === 0 ? (
          <p className="px-2 py-3 font-sans text-sm text-[#6A7374]">
            {status === 'error' ? 'Could not load trades.' : status === 'loading' ? 'Syncing positions...' : 'Waiting for positions...'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => (
                <LeaderboardRow key={item.id} item={item} reduceMotion={reduceMotion} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </section>
  )
}
