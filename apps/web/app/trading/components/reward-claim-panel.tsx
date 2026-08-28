'use client'

import { formatNumber } from './formatters'
import { type RewardClaimResult } from './types'

function shortHash(value: string) {
  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

export function RewardClaimPanel({
  canClaim,
  isClaimingRewards,
  result,
  onClaimRewards,
}: {
  canClaim: boolean
  isClaimingRewards: boolean
  result: RewardClaimResult | null
  onClaimRewards: () => void
}) {
  const latestClaim = result?.claimed.at(-1)

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-md bg-[#F7E0B8] px-4 py-3 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="uppercase tracking-wide text-[#7A5A43]">Closed Market Rewards</div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
          <span>Scanned {formatNumber(result?.scanned)}</span>
          <span>Claimed {formatNumber(result?.claimed.length)}</span>
          <span>Skipped {formatNumber(result?.skipped.length)}</span>
        </div>
        {latestClaim ? (
          <div className="mt-1 truncate text-xs text-[#7A5A43]">
            Latest {latestClaim.outcome} reward: {latestClaim.amount} at {shortHash(latestClaim.hash)}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClaimRewards}
        disabled={!canClaim || isClaimingRewards}
        className="h-12 shrink-0 rounded-md bg-[#D9903D] px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#9B5A21] transition enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isClaimingRewards ? 'Claiming...' : 'Claim Rewards'}
      </button>
    </div>
  )
}
