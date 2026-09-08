'use client'

import { useTradeSetup } from '@/hooks/use-trade-setup'
import { tradeSetupProgress } from '@/lib/trade-setup'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

const PLAYBACK_RATE = 0.5
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const SETUP_LABELS = ['Connect', 'Wallet', 'Signer', 'Funds'] as const

function Spinner({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span
      aria-hidden
      className={`size-5 shrink-0 rounded-full border-2 border-white/25 border-t-white ${
        reduceMotion ? '' : 'animate-spin'
      }`}
    />
  )
}

function SetupProgress({ step }: { step: ReturnType<typeof useTradeSetup>['status']['step'] }) {
  const progress = tradeSetupProgress(step)
  const current = Math.min(Math.max(progress, 1), SETUP_LABELS.length)

  return (
    <ol className="flex w-full items-center justify-center gap-3 font-sans text-[11px] tracking-wide text-white/45">
      {SETUP_LABELS.map((label, index) => {
        const done = progress > index + 1 || progress === 5
        const active = progress === index + 1 && step !== 'ready' && step !== 'error'
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${done ? 'bg-white' : active ? 'bg-white/80' : 'bg-white/25'}`} />
            <span className={done || active ? 'text-white' : undefined}>{label}</span>
          </li>
        )
      })}
      <span className="sr-only">
        Step {current} of {SETUP_LABELS.length}
      </span>
    </ol>
  )
}

export default function SectionDynamicIsland() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { ready, status, busy, start } = useTradeSetup()
  const expanded = status.step !== 'idle'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const applyRate = () => {
      video.defaultPlaybackRate = PLAYBACK_RATE
      if (video.playbackRate !== PLAYBACK_RATE) {
        video.playbackRate = PLAYBACK_RATE
      }
    }

    applyRate()

    const events = ['loadedmetadata', 'canplay', 'play', 'playing', 'seeked'] as const
    for (const event of events) {
      video.addEventListener(event, applyRate)
    }

    void video
      .play()
      .then(applyRate)
      .catch(() => {})

    return () => {
      for (const event of events) {
        video.removeEventListener(event, applyRate)
      }
    }
  }, [])

  return (
    <section className="section-panel relative h-[180px] flex-none overflow-hidden p-0">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover object-bottom motion-reduce:hidden"
        src="https://v1.pinimg.com/videos/iht/expMp4/45/05/57/45055796afda511e5c057fa25102cae2_720w.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <button
        type="button"
        onClick={() => void start()}
        disabled={!ready || busy}
        aria-busy={busy}
        className="absolute top-1/2 left-1/2 max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-black px-8 py-5 text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait"
      >
        <span className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-3">
            {busy ? <Spinner reduceMotion={reduceMotion} /> : null}
            <span className="font-abc-gravity-italic text-[28px] leading-none">{status.title}</span>
          </span>
          <AnimatePresence initial={false} mode="wait">
            {expanded ? (
              <motion.span
                key={`${status.step}:${status.detail}`}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(6px)' }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px)' }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                aria-live="polite"
                className={`line-clamp-3 max-w-[360px] text-center font-sans text-[13px] leading-snug ${
                  status.step === 'error' ? 'text-[#F87171]' : 'text-white/70'
                }`}
              >
                {status.detail}
              </motion.span>
            ) : null}
          </AnimatePresence>
          {expanded ? <SetupProgress step={status.step} /> : null}
        </span>
      </button>
    </section>
  )
}
