import { type TradingStatus } from './types'

export {
  formatAddress,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatPrice,
  formatUpdateTime,
} from '@/lib/format'

export function statusClass(tone: TradingStatus['tone']) {
  if (tone === 'success') return 'bg-[#90B64F] text-white'
  if (tone === 'error') return 'bg-[#D6503C] text-white'

  return 'bg-[#F7E0B8] text-[#3C1F11]'
}
