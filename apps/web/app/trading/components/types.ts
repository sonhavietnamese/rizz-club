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
