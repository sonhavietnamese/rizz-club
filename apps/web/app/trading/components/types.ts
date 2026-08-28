export type Outcome = 'YES' | 'NO'

export type TradingStatus =
  | { tone: 'neutral'; message: string }
  | { tone: 'success'; message: string; hash?: string }
  | { tone: 'error'; message: string }

export type OutcomePosition = {
  label: string
  symbol: string
  total: number
}

export type RewardClaim = {
  marketId: string
  outcome: Outcome
  amount: string
  rawAmount: string
  hash: string
  status: string
}

export type RewardSkip = {
  marketId: string
  reason: string
  outcome?: Outcome
}

export type RewardClaimResult = {
  scanned: number
  claimed: RewardClaim[]
  skipped: RewardSkip[]
}
