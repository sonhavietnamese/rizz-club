'use client'

import { statusClass } from './formatters'
import { type TradingStatus } from './types'

export function StatusPanel({ status }: { status: TradingStatus }) {
  return (
    <div className={`mt-5 rounded-md px-4 py-3 text-sm font-semibold ${statusClass(status.tone)}`}>
      <p>{status.message}</p>
      {status.tone === 'success' && status.hash && <p className="mt-1 break-all">Tx {status.hash}</p>}
    </div>
  )
}
