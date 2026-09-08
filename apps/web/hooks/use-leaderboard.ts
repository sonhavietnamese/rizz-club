'use client'

import { currentMarketIds, useCurrentMarket } from '@/hooks/use-current-market'
import { useMarketTimeseries } from '@/hooks/use-market-timeseries'
import { useMarketTrades } from '@/hooks/use-market-trades'
import { advanceLeaderboardHold, toLeaderboardItems, type LeaderboardHold, type LeaderboardItem } from '@/lib/leaderboard'
import { useMemo, useState } from 'react'

const emptyHold: LeaderboardHold = { marketKey: '', items: [], epoch: 0 }
const emptyItems: LeaderboardItem[] = []

export function useLeaderboard() {
  const { market, isLoading: isLoadingMarket } = useCurrentMarket()
  const marketIds = useMemo(() => currentMarketIds(market), [market])
  const marketKey = marketIds.join('|')
  const { trades, status: tradesStatus } = useMarketTrades(marketIds)
  const { points, status: seriesStatus } = useMarketTimeseries(marketIds)
  const latest = points.at(-1)
  const yes = latest?.yes
  const no = latest?.no ?? (yes == null ? undefined : 1 - yes)
  const liveItems = useMemo(
    () => (marketKey ? toLeaderboardItems(trades, { yes, no }) : emptyItems),
    [marketKey, no, trades, yes],
  )

  const [view, setView] = useState({ hold: emptyHold, frozen: false })
  const next = advanceLeaderboardHold(view.hold, marketKey, liveItems)
  if (next.hold !== view.hold || next.frozen !== view.frozen) {
    setView(next)
  }

  const status = isLoadingMarket || tradesStatus === 'loading' || seriesStatus === 'loading'
    ? 'loading'
    : tradesStatus === 'error' || seriesStatus === 'error'
      ? 'error'
      : 'live'

  return { items: next.hold.items, epoch: next.hold.epoch, frozen: next.frozen, status }
}
