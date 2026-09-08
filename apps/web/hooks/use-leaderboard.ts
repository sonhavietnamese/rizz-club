'use client'

import { currentMarketIds, useCurrentMarket } from '@/hooks/use-current-market'
import { useMarketTimeseries } from '@/hooks/use-market-timeseries'
import { useMarketTrades } from '@/hooks/use-market-trades'
import { toLeaderboardItems } from '@/lib/leaderboard'
import { useMemo } from 'react'

export function useLeaderboard() {
  const { market, isLoading: isLoadingMarket } = useCurrentMarket()
  const marketIds = useMemo(() => currentMarketIds(market), [market])
  const { trades, status: tradesStatus } = useMarketTrades(marketIds)
  const { points, status: seriesStatus } = useMarketTimeseries(marketIds)
  const latest = points.at(-1)
  const yes = latest?.yes
  const no = latest?.no ?? (yes == null ? undefined : 1 - yes)

  const items = useMemo(() => toLeaderboardItems(trades, { yes, no }), [no, trades, yes])

  const status = isLoadingMarket || tradesStatus === 'loading' || seriesStatus === 'loading'
    ? 'loading'
    : tradesStatus === 'error' || seriesStatus === 'error'
      ? 'error'
      : 'live'

  return { items, status }
}
