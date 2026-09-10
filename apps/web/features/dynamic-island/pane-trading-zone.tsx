import { useHeartRate } from '@/hooks/use-heart-rate'
import { useTrading } from '@/hooks/use-trading'
import { formatShares } from '@/lib/format'
import { NO_COLOR, YES_COLOR } from '@/lib/outcome'
import BpmReadout from './bpm-readout'
import IslandButton from './island-button'

export default function PaneTradingZone({
  heartRate,
  reduceMotion,
  onBack,
}: {
  heartRate: ReturnType<typeof useHeartRate>
  reduceMotion: boolean
  onBack: () => void
}) {
  const {
    status,
    tradingOutcome,
    isClaiming,
    isLoadingPositions,
    isLoadingMarket,
    canTrade,
    canTakeProfit,
    canClaim,
    yesPosition,
    noPosition,
    isTakingProfit,
    placeTrade,
    takeProfit,
    claimRewards,
  } = useTrading()

  const statusTone =
    status?.tone === 'error' ? 'text-[#F87171]' : status?.tone === 'success' ? 'text-white' : 'text-white/70'
  const detail =
    status?.message ??
    (isLoadingMarket ? 'Loading live market...' : isLoadingPositions ? 'Syncing positions...' : '5 tUSDC per trade')

  return (
    <div className="flex h-full w-full gap-2 p-2">
      <IslandButton
        onClick={onBack}
        className="flex h-full shrink-0 flex-col items-center justify-center gap-1.5 bg-white/10 px-3 text-white"
      >
        Back
        {heartRate.live ? <BpmReadout bpm={heartRate.bpm} reduceMotion={reduceMotion} /> : null}
      </IslandButton>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-sans text-xs tabular-nums text-white/80">
              <span style={{ color: YES_COLOR }}>YES {formatShares(yesPosition)}</span>
              <span className="text-white/35"> · </span>
              <span style={{ color: NO_COLOR }}>NO {formatShares(noPosition)}</span>
            </p>
            <p className={`mt-1 truncate font-sans text-[11px] ${statusTone}`} aria-live="polite">
              {detail}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IslandButton
              onClick={() => void takeProfit()}
              disabled={!canTakeProfit}
              busy={isTakingProfit}
              className="bg-white text-black"
            >
              {isTakingProfit ? 'Selling' : 'TP'}
            </IslandButton>
            <IslandButton
              onClick={() => void claimRewards()}
              disabled={!canClaim}
              busy={isClaiming}
              className="bg-white/15 text-white"
            >
              {isClaiming ? 'Claiming' : 'Claim'}
            </IslandButton>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-2">
          <button
            type="button"
            onClick={() => void placeTrade('YES')}
            disabled={!canTrade}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#7C5CFF] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-abc-gravity-italic text-[42px] leading-none">UP</span>
            <span className="mt-2 font-sans text-xs text-white/70">
              {tradingOutcome === 'YES' ? 'Buying...' : 'Buy YES'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => void placeTrade('NO')}
            disabled={!canTrade}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[#FF6A3D] text-white transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-abc-gravity-italic text-[42px] leading-none">DOWN</span>
            <span className="mt-2 font-sans text-xs text-white/70">
              {tradingOutcome === 'NO' ? 'Buying...' : 'Buy NO'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
