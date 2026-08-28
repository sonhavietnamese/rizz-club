'use client'

import { formatAddress } from './formatters'

export function TradingHeader({
  walletAddress,
  onProfileClick,
}: {
  walletAddress?: string
  onProfileClick: () => void
}) {
  return (
    <header className="flex flex-col gap-4 rounded-md bg-[#ECD19C] p-5 shadow-[0_8px_0_#673818] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider opacity-70">DreamDex</p>
        <h1 className="text-3xl font-black leading-tight">Event Trading</h1>
        <p className="mt-2 text-sm font-semibold opacity-75">
          {walletAddress ? `Wallet ${formatAddress(walletAddress)}` : 'Wallet connecting...'}
        </p>
      </div>

      <button
        type="button"
        onClick={onProfileClick}
        className="h-11 rounded-md bg-[#389591] px-5 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#236461] transition active:translate-y-1 active:shadow-none"
      >
        Profile
      </button>
    </header>
  )
}
