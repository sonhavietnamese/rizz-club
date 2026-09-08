'use client'

import { useAbility } from '@/components/ability-provider'
import { useDisplayName } from '@/hooks/use-display-name'
import { useHeartRate } from '@/hooks/use-heart-rate'
import { usePublishTraderHeartRate } from '@/hooks/use-traders'
import { useTradeSetup } from '@/hooks/use-trade-setup'
import { ABILITY_ACCENT } from '@/lib/ability'
import {
  canApplyAbilityOnIsland,
  formatBalanceLine,
  islandStageFromSetup,
  shortAddress,
  tradeSetupProgress,
  type FaucetAsset,
} from '@/lib/trade-setup'
import { traderIdentity } from '@/lib/traders'
import { DISPLAY_NAME_MAX_LENGTH, sanitizeName } from '@/lib/utils'
import { useIslandStore } from '@/stores/island'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

const PLAYBACK_RATE = 0.5
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const SETUP_LABELS = ['Connect', 'Wallet', 'Signer', 'Funds'] as const
const BPM_TIMING = { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' } as const

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

function BpmReadout({
  bpm,
  reduceMotion,
  size = 'chip',
}: {
  bpm: number | null
  reduceMotion: boolean
  size?: 'chip' | 'pane'
}) {
  const valueClass =
    size === 'pane' ? 'font-abc-gravity-italic text-[28px] leading-none' : 'font-sans text-xs font-medium tabular-nums'

  return (
    <span
      className={
        size === 'pane'
          ? 'inline-flex items-end gap-1.5'
          : 'inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-sans text-xs font-medium tabular-nums text-white'
      }
      style={size === 'pane' ? { fontVariantNumeric: 'tabular-nums', lineHeight: 0.85 } : undefined}
    >
      {bpm == null ? (
        <span className={`${valueClass} text-white/45`}>—</span>
      ) : (
        <NumberFlow
          value={bpm}
          animated={!reduceMotion}
          className={valueClass}
          transformTiming={BPM_TIMING}
          spinTiming={BPM_TIMING}
          opacityTiming={{ duration: 150, easing: BPM_TIMING.easing }}
        />
      )}
      <span className={size === 'pane' ? 'mb-0.5 font-sans text-xs text-white/55' : 'text-white/55'}>BPM</span>
    </span>
  )
}

function WearablePane({
  heartRate,
  reduceMotion,
}: {
  heartRate: ReturnType<typeof useHeartRate>
  reduceMotion: boolean
}) {
  if (heartRate.status === 'unsupported') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-black/80 px-6 text-center text-white">
        <span className="font-abc-gravity-italic text-[28px] leading-none">HEART RATE</span>
        <p className="mt-3 max-w-[280px] font-sans text-[13px] leading-snug text-white/70">
          {heartRate.error ?? 'Heart rate needs Chrome or Edge.'}
        </p>
      </div>
    )
  }

  if (heartRate.status === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-black/80 px-6 text-center text-white">
        <span className="font-abc-gravity-italic text-[28px] leading-none">COULD NOT CONNECT</span>
        <p className="line-clamp-3 max-w-[280px] font-sans text-[13px] leading-snug text-[#F87171]">
          {heartRate.error ?? 'Could not connect to wearable.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <IslandButton
            onClick={() => void heartRate.connect()}
            busy={heartRate.busy}
            className="bg-white/15 text-white"
          >
            Try again
          </IslandButton>
          <IslandButton
            onClick={() => void heartRate.connect({ prompt: true })}
            busy={heartRate.busy}
            className="bg-white/10 text-white"
          >
            Pair a different device
          </IslandButton>
        </div>
      </div>
    )
  }

  if (heartRate.status === 'requesting' || heartRate.status === 'connecting') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-black/80 px-6 text-white">
        <span className="flex items-center justify-center gap-3">
          <Spinner reduceMotion={reduceMotion} />
          <span className="font-abc-gravity-italic text-[28px] leading-none">
            {heartRate.status === 'requesting' ? 'PAIRING' : 'CONNECTING'}
          </span>
        </span>
        <span className="font-sans text-[13px] leading-snug text-white/70">
          {heartRate.status === 'requesting'
            ? 'Pick a heart-rate monitor.'
            : heartRate.remembered
              ? `Reconnecting to ${heartRate.deviceName ?? 'your wearable'}.`
              : 'Opening the heart-rate service.'}
        </span>
      </div>
    )
  }

  if (heartRate.status === 'live') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-black/80 px-6 text-white">
        <div className="flex items-end gap-2" style={{ fontVariantNumeric: 'tabular-nums', lineHeight: 0.85 }}>
          {heartRate.bpm == null ? (
            <span className="font-abc-gravity-italic text-[42px] leading-none text-white/45">—</span>
          ) : (
            <NumberFlow
              value={heartRate.bpm}
              animated={!reduceMotion}
              className="font-abc-gravity-italic text-[42px] leading-none"
              transformTiming={BPM_TIMING}
              spinTiming={BPM_TIMING}
              opacityTiming={{ duration: 150, easing: BPM_TIMING.easing }}
            />
          )}
          <span className="mb-1 font-sans text-sm text-white/55">BPM</span>
        </div>
        <p className="font-sans text-xs text-white/55">{heartRate.deviceName ?? 'Wearable'}</p>
        {heartRate.contact === 'not-detected' ? (
          <p className="font-sans text-[12px] text-white/45">Place the sensor to read a pulse.</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <IslandButton onClick={() => void heartRate.disconnect()} className="bg-white/15 text-white">
            Disconnect
          </IslandButton>
          <IslandButton onClick={() => void heartRate.forget()} className="bg-white/10 text-white">
            Forget
          </IslandButton>
        </div>
      </div>
    )
  }

  if (heartRate.remembered) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-black px-6 text-center text-white">
        <button
          type="button"
          onClick={() => void heartRate.connect()}
          disabled={heartRate.busy}
          aria-busy={heartRate.busy}
          className="flex flex-col items-center justify-center transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait"
        >
          <span className="font-abc-gravity-italic text-[28px] leading-none">RECONNECT</span>
          <span className="mt-2 font-sans text-xs text-white/60">{heartRate.deviceName ?? 'Saved wearable'}</span>
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <IslandButton
            onClick={() => void heartRate.connect({ prompt: true })}
            busy={heartRate.busy}
            className="bg-white/10 text-white"
          >
            Pair a different device
          </IslandButton>
          <IslandButton onClick={() => void heartRate.forget()} className="bg-white/10 text-white">
            Forget
          </IslandButton>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void heartRate.connect({ prompt: true })}
      disabled={heartRate.busy}
      aria-busy={heartRate.busy}
      className="flex flex-1 flex-col items-center justify-center rounded-xl bg-black px-6 text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait"
    >
      <span className="font-abc-gravity-italic text-[28px] leading-none">CONNECT WEARABLE</span>
      <span className="mt-2 font-sans text-xs text-white/60">BLE heart-rate monitor</span>
    </button>
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

function IslandName({ name, onSave }: { name: string; onSave: (name: string) => void }) {
  const skipCommit = useRef(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const startEdit = () => {
    setDraft(name)
    setEditing(true)
  }

  const commit = () => {
    if (skipCommit.current) {
      skipCommit.current = false
      return
    }

    const next = sanitizeName(draft)
    if (next) onSave(next)
    else setDraft(name)
    setEditing(false)
  }

  const cancel = () => {
    skipCommit.current = true
    setDraft(name)
    setEditing(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {editing ? (
        <input
          value={draft}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          aria-label="Display name"
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setDraft(sanitizeName(event.target.value))}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 border-b border-white/35 bg-transparent pb-0.5 font-abc-gravity-italic text-[22px] leading-none text-white caret-white outline-none"
        />
      ) : (
        <p className="min-w-0 truncate font-abc-gravity-italic text-[22px] leading-none">{name}</p>
      )}
      {editing ? (
        <span className="shrink-0 font-sans text-xs tabular-nums text-white/45">
          {draft.length}/{DISPLAY_NAME_MAX_LENGTH}
        </span>
      ) : (
        <button
          type="button"
          aria-label="Edit name"
          onClick={startEdit}
          className="shrink-0 font-sans text-xs text-white/55 transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97]"
        >
          Edit
        </button>
      )}
    </div>
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

function IslandDropOverlay({
  active,
  hovering,
  locked,
  reduceMotion,
}: {
  active: boolean
  hovering: boolean
  locked: boolean
  reduceMotion: boolean
}) {
  const canDrop = !locked && hovering

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="ability-drop"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.98)' }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: canDrop ? 'scale(1.015)' : 'scale(1)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.98)' }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-2xl"
          style={{
            backgroundColor: locked
              ? 'rgba(0, 0, 0, 0.55)'
              : hovering
                ? 'rgba(124, 92, 255, 0.28)'
                : 'rgba(124, 92, 255, 0.16)',
            boxShadow: locked ? 'inset 0 0 0 2px rgba(255, 255, 255, 0.35)' : `inset 0 0 0 2px ${ABILITY_ACCENT}`,
          }}
        >
          <p className="max-w-[280px] rounded-full bg-black/55 px-4 py-2 text-center font-sans text-sm text-white">
            {locked
              ? 'Enter the trading zone to apply this effect'
              : hovering
                ? 'Release to apply'
                : 'Drop the card here to apply effect'}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function AppliedTag({ name, onClear, reduceMotion }: { name: string; onClear: () => void; reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(6px) scale(0.96)' }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px) scale(1)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(6px) scale(0.96)' }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="absolute right-5 top-0 z-20 -translate-y-[calc(100%-2px)]"
    >
      <div
        className="flex items-center gap-1.5 rounded-t-md px-2.5 py-1 font-sans text-xs font-medium text-white"
        style={{ backgroundColor: ABILITY_ACCENT }}
      >
        <span>{name}</span>
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onClear}
          className="flex size-4 items-center justify-center rounded-sm text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97]"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
            <path d="M1.5 1.5 6.5 6.5M6.5 1.5 1.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

export default function SectionDynamicIsland() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { ready, authenticated, user, status, balances, needs, settled, busy, start, fund } = useTradeSetup()
  const heartRate = useHeartRate()
  usePublishTraderHeartRate(heartRate.bpm, heartRate.live)
  const { islandRef, drag, overIsland, applied, clearApplied } = useAbility()
  const zone = useIslandStore((state) => state.zone)
  const setZone = useIslandStore((state) => state.setZone)
  const syncFromSetup = useIslandStore((state) => state.syncFromSetup)
  const wasHeartRateLive = useRef(false)
  const stage = islandStageFromSetup({
    authenticated,
    step: status.step,
    zone,
    address: status.address,
    settled,
  })

  useLayoutEffect(() => {
    syncFromSetup({
      authenticated,
      step: status.step,
      address: status.address,
      settled,
    })
  }, [authenticated, settled, status.address, status.step, syncFromSetup])

  const identity = user ? traderIdentity(user) : { address: status.address ?? '', name: 'Trader' }
  const { name, save } = useDisplayName(identity.address, identity.name)
  const showVideo = stage === 'unconnected' || stage === 'preparing' || stage === 'error'

  useEffect(() => {
    if (heartRate.live && !wasHeartRateLive.current) {
      setZone('information')
    }
    wasHeartRateLive.current = heartRate.live
  }, [heartRate.live, setZone])

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

  const showDrop = Boolean(drag)
  const canApply = canApplyAbilityOnIsland(stage)

  return (
    <section
      ref={islandRef}
      className="section-panel relative h-[180px] flex-none overflow-visible p-0"
      style={applied ? { boxShadow: `0 0 0 2px ${ABILITY_ACCENT}` } : undefined}
    >
      <AnimatePresence>
        {applied ? (
          <AppliedTag key={applied.id} name={applied.name} onClear={clearApplied} reduceMotion={reduceMotion} />
        ) : null}
      </AnimatePresence>

      <div className="relative h-full overflow-hidden rounded-2xl">
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
                className="max-w-[440px] rounded-2xl px-8 py-5 text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-wait"
              >
                <span className="font-abc-gravity-italic text-[28px] leading-none">{status.title}</span>
              </button>
            </IslandFrame>
          ) : null}

          {stage === 'preparing' ? (
            <IslandFrame reduceMotion={reduceMotion} stageKey="preparing">
              <div className="flex max-w-[440px] flex-col items-center gap-2 rounded-2xl px-8 py-5 text-white">
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
              <div className="flex max-w-[440px] flex-col items-center gap-3 rounded-2xl px-8 py-5 text-white">
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
              <div className="flex h-full w-full flex-col justify-between rounded-xl px-4 py-3 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <IslandName name={name} onSave={save} />
                    <p className="mt-2 font-sans text-xs text-white/55">
                      {status.address ? shortAddress(status.address) : identity.address || 'No wallet yet'}
                    </p>
                    {heartRate.live ? (
                      <div className="mt-2">
                        <BpmReadout bpm={heartRate.bpm} reduceMotion={reduceMotion} size="pane" />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <IslandButton onClick={() => setZone('wearable')} className="bg-white/10 text-white">
                      Wearable
                    </IslandButton>
                    <IslandButton onClick={() => setZone('trading-zone')} className="bg-white text-black">
                      Trade
                    </IslandButton>
                  </div>
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
                  className="flex h-full shrink-0 flex-col items-center justify-center gap-1.5 bg-white/10 px-3 text-white"
                >
                  Back
                  {heartRate.live ? <BpmReadout bpm={heartRate.bpm} reduceMotion={reduceMotion} /> : null}
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

          {stage === 'wearable' ? (
            <IslandFrame reduceMotion={reduceMotion} stageKey="wearable">
              <div className="flex h-full w-full gap-2">
                <IslandButton
                  onClick={() => setZone('information')}
                  className="h-full shrink-0 bg-white/10 px-3 text-white"
                >
                  Back
                </IslandButton>
                <WearablePane heartRate={heartRate} reduceMotion={reduceMotion} />
              </div>
            </IslandFrame>
          ) : null}
        </AnimatePresence>

        <IslandDropOverlay active={showDrop} hovering={overIsland} locked={!canApply} reduceMotion={reduceMotion} />
      </div>
    </section>
  )
}
