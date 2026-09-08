import SectionAbility from '@/components/section-ability'
import SectionAbout from '@/components/section-about'
import SectionBtcPrice from '@/components/section-btc-price'
import SectionChat from '@/components/section-chat'
import SectionDynamicIsland from '@/components/section-dynamic-island'
import SectionHeader from '@/components/section-header'
import SectionHistory from '@/components/section-history'
import SectionLeaderboard from '@/components/section-leaderboard'
import SectionMarket from '@/components/section-market'
import SectionProgress from '@/components/section-progress'
import SectionStatus from '@/components/section-status'
import { CurrentMarketProvider } from '@/hooks/use-current-market'

export default function Page() {
  return (
    <CurrentMarketProvider>
      <main className="w-screen h-screen bg-background relative p-2 flex flex-col gap-2">
        <SectionHeader />
        <div className="grid min-h-0 w-full flex-1 grid-cols-[minmax(400px,1fr)_3fr_minmax(400px,1fr)] gap-2">
          <div id="left" className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <SectionChat />
            <SectionProgress />
            <SectionStatus />
          </div>

          <div id="center" className="flex flex-col gap-2">
            <SectionBtcPrice />
            <SectionMarket />
            <SectionDynamicIsland />
          </div>

          <div id="right" className="flex min-h-0 flex-col gap-2 overflow-hidden">
            <SectionLeaderboard />
            <SectionAbility />
            <SectionHistory />
            <SectionAbout />
          </div>
        </div>
      </main>
    </CurrentMarketProvider>
  )
}
