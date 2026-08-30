import {
  SOMNIA_TESTNET_ADDRESSES,
  SOMNIA_TESTNET_PRICE_FEED,
  type SomniaMarketsConfig,
} from '@somnia-chain/markets-sdk'
import { somniaShannon } from '@somnia-chain/markets-sdk/chains'

export const marketRefreshMs = 5_000
export const reconnectDelayMs = 5_000
export const targetAsset = 'BTC'
export const targetIntervalSeconds = 15 * 60
export const marketFillLimit = 400
export const dashboardFillLimit = 10
export const defaultQuoteDecimals = 6
export const successorPollNearExpiryMs = 15_000
export const successorPollHotMs = 1_000
export const successorPollMsDefault = 3_000
export const etlDebounceMs = 250
export const etlPath = 'market'

export const dreamDexConfig = {
  indexerUrl: 'https://dev.smk.somnia.host/v1/graphql',
  chain: somniaShannon,
  wsRpcUrl: somniaShannon.rpcUrls.default.webSocket[0],
  addresses: SOMNIA_TESTNET_ADDRESSES,
  priceFeed: SOMNIA_TESTNET_PRICE_FEED,
} satisfies SomniaMarketsConfig
