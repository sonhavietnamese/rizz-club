'use client'

import { createDreamDexExchange } from '@/lib/dreamdex'
import { formatUsd } from '@/lib/utils'
import { SomniaMarketsProvider, useLivePrice } from '@somnia-chain/markets-sdk/react'
import { useEffect, useMemo } from 'react'

const btcPriceAsset = 'BTC'

function LiveTabNameSync() {
  const btcPrice = useLivePrice(btcPriceAsset)

  useEffect(() => {
    document.title = `Rizz Club | BTC - ${formatUsd(btcPrice?.price)}`
  }, [btcPrice?.price])

  return null
}

export default function LiveTabName() {
  const exchange = useMemo(() => createDreamDexExchange(), [])

  return (
    <SomniaMarketsProvider client={exchange.client}>
      <LiveTabNameSync />
    </SomniaMarketsProvider>
  )
}
