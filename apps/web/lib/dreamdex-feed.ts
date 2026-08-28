export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export type Candle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type CandleFeedResult =
  | { kind: 'pong' }
  | { kind: 'snapshot'; candles: Candle[] }
  | { kind: 'update'; candle: Candle }
  | { kind: 'error'; message: string }
  | { kind: 'shutdown'; message: string }
  | { kind: 'ignore' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeCandle(candle: unknown): Candle | null {
  if (!isRecord(candle)) return null

  const timestamp = Number(candle.timestamp)
  const open = Number(candle.open)
  const high = Number(candle.high)
  const low = Number(candle.low)
  const close = Number(candle.close)
  const volume = Number(candle.volume)

  if (![timestamp, open, high, low, close, volume].every(Number.isFinite)) return null

  return {
    timestamp,
    open,
    high,
    low,
    close,
    volume,
  }
}

export function mergeCandle(candles: Candle[], next: Candle) {
  const withoutExisting = candles.filter((candle) => candle.timestamp !== next.timestamp)

  return [...withoutExisting, next].sort((left, right) => left.timestamp - right.timestamp).slice(-80)
}

export function parseCandleFeedMessage(data: string, symbol: string): CandleFeedResult {
  let message: unknown

  try {
    message = JSON.parse(data)
  } catch {
    return { kind: 'ignore' }
  }

  if (!isRecord(message)) {
    return { kind: 'ignore' }
  }

  if (message.operation === 'pong') {
    return { kind: 'pong' }
  }

  if (message.type === 'shutdown') {
    return { kind: 'shutdown', message: String(message.message ?? 'DreamDex feed shutting down') }
  }

  if (message.channel === 'error') {
    return { kind: 'error', message: String(message.message ?? 'DreamDex feed error') }
  }

  if (message.channel !== 'ohlcv' || message.symbol !== symbol) {
    return { kind: 'ignore' }
  }

  if (message.type === 'snapshot') {
    return {
      kind: 'snapshot',
      candles: Array.isArray(message.candles)
        ? message.candles.map(normalizeCandle).filter((candle) => candle !== null).slice(-80)
        : [],
    }
  }

  if (message.type === 'update') {
    const candle = normalizeCandle(message.candle)

    return candle ? { kind: 'update', candle } : { kind: 'ignore' }
  }

  return { kind: 'ignore' }
}
