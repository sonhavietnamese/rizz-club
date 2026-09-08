'use client'

import { useTradeSetup } from '@/hooks/use-trade-setup'
import {
  formatBalanceLine,
  islandStageFromSetup,
  shortAddress,
  tradeSetupProgress,
  type FaucetAsset,
  type IslandZone,
} from '@/lib/trade-setup'
import { traderIdentity } from '@/lib/traders'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

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

function IslandButton({
  children,
  onClick,
  disabled,
  busy,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  busy?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      className={`rounded-xl px-3 py-2 font-sans text-sm font-medium transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait disabled:opacity-50 ${className ?? 'bg-white/10 text-white'}`}
    >
      {children}
    </button>
  )
}

function IslandFrame({
  reduceMotion,
  stageKey,
  children,
}: {
  reduceMotion: boolean
  stageKey: string
  children: ReactNode
}) {
  return (
    <motion.div
      key={stageKey}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-6px) scale(0.98)' }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      {children}
    </motion.div>
  )
}

export default function SectionDynamicIsland() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { ready, authenticated, user, status, balances, needs, settled, busy, start, fund } = useTradeSetup()
  const [zone, setZone] = useState<IslandZone>('information')
  const stage = islandStageFromSetup({
    authenticated,
    step: status.step,
    zone,
    address: status.address,
    settled,
  })
  const identity = user ? traderIdentity(user) : { address: status.address ?? '', name: 'Trader' }
  const showVideo = stage === 'unconnected' || stage === 'preparing' || stage === 'error'

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
  }, [showVideo])

  const faucet = (asset?: FaucetAsset) => {
    void fund(asset)
  }

  return (
    <section className="section-panel relative h-[180px] flex-none overflow-hidden p-0">
      {showVideo ? (
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
      ) : null}

      <AnimatePresence initial={false} mode="wait">
        {stage === 'unconnected' ? (
          <IslandFrame reduceMotion={reduceMotion} stageKey="unconnected">
            <button
              type="button"
              onClick={() => {
                setZone('information')
                void start()
              }}
              disabled={!ready || busy}
              aria-busy={busy}
              className="max-w-[440px] rounded-2xl bg-black px-8 py-5 text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait"
            >
              <span className="font-abc-gravity-italic text-[28px] leading-none">{status.title}</span>
            </button>
          </IslandFrame>
        ) : null}

        {stage === 'preparing' ? (
          <IslandFrame reduceMotion={reduceMotion} stageKey="preparing">
            <div className="flex max-w-[440px] flex-col items-center gap-2 rounded-2xl bg-black px-8 py-5 text-white">
              <span className="flex items-center justify-center gap-3">
                <Spinner reduceMotion={reduceMotion} />
                <span className="font-abc-gravity-italic text-[28px] leading-none">{status.title}</span>
              </span>
              <span className="line-clamp-3 max-w-[360px] text-center font-sans text-[13px] leading-snug text-white/70">
                {status.detail}
              </span>
              <SetupProgress step={status.step} />
            </div>
          </IslandFrame>
        ) : null}

        {stage === 'error' ? (
          <IslandFrame reduceMotion={reduceMotion} stageKey="error">
            <div className="flex max-w-[440px] flex-col items-center gap-3 rounded-2xl bg-black px-8 py-5 text-white">
              <span className="font-abc-gravity-italic text-[28px] leading-none">{status.title}</span>
              <span className="line-clamp-3 max-w-[360px] text-center font-sans text-[13px] leading-snug text-[#F87171]">
                {status.detail}
              </span>
              <IslandButton
                onClick={() => {
                  setZone('information')
                  void start()
                }}
                disabled={!ready || busy}
                busy={busy}
                className="bg-white/15 text-white"
              >
                Try again
              </IslandButton>
            </div>
          </IslandFrame>
        ) : null}

        {stage === 'information' ? (
          <IslandFrame reduceMotion={reduceMotion} stageKey="information">
            <div className="flex h-full w-full flex-col justify-between rounded-xl bg-black/80 px-4 py-3 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-abc-gravity-italic text-[22px] leading-none">{identity.name}</p>
                  <p className="mt-2 font-sans text-xs text-white/55">
                    {status.address ? shortAddress(status.address) : identity.address || 'No wallet yet'}
                  </p>
                </div>
                <IslandButton onClick={() => setZone('trading-zone')} className="shrink-0 bg-white text-black">
                  Trade
                </IslandButton>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-sans text-sm tabular-nums text-white/90">
                    {balances ? formatBalanceLine(balances) : 'Balances unavailable'}
                  </p>
                  {status.step === 'error' ? (
                    <p className="mt-1 line-clamp-2 max-w-[280px] font-sans text-[12px] leading-snug text-[#F87171]">
                      {status.detail}
                    </p>
                  ) : null}
                </div>
                {needs.stt || needs.tusdc || status.step === 'error' ? (
                  <div className="flex shrink-0 gap-2">
                    <IslandButton
                      onClick={() => faucet('STT')}
                      disabled={busy || !status.address}
                      busy={busy && status.step === 'funding_stt'}
                    >
                      {busy && status.step === 'funding_stt' ? 'Funding STT' : 'Faucet STT'}
                    </IslandButton>
                    <IslandButton
                      onClick={() => faucet('tUSDC')}
                      disabled={busy || !status.address}
                      busy={busy && status.step === 'funding_tusdc'}
                    >
                      {busy && status.step === 'funding_tusdc' ? 'Funding tUSDC' : 'Faucet tUSDC'}
                    </IslandButton>
                  </div>
                ) : null}
              </div>
            </div>
          </IslandFrame>
        ) : null}

        {stage === 'trading-zone' ? (
          <IslandFrame reduceMotion={reduceMotion} stageKey="trading-zone">
            <div className="flex h-full w-full gap-2">
              <IslandButton
                onClick={() => setZone('information')}
                className="h-full shrink-0 bg-white/10 px-3 text-white"
              >
                Back
              </IslandButton>
              <button
                type="button"
                className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#7C5CFF] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97]"
              >
                <span className="font-abc-gravity-italic text-[42px] leading-none">UP</span>
                <span className="mt-2 font-sans text-xs text-white/70">Buy YES</span>
              </button>
              <button
                type="button"
                className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#FF6A3D] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97]"
              >
                <span className="font-abc-gravity-italic text-[42px] leading-none">DOWN</span>
                <span className="mt-2 font-sans text-xs text-white/70">Buy NO</span>
              </button>
            </div>
          </IslandFrame>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
