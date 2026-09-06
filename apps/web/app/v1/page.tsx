import Header from '@/components/header'
import SectionAbility from '@/components/section-ability'
import SectionAbout from '@/components/section-about'
import SectionChat from '@/components/section-chat'
import SectionDynamicIsland from '@/components/section-dynamic-island'
import SectionLeaderboard from '@/components/section-leaderboard'
import SectionProgress from '@/components/section-progress'
import SectionStatus from '@/components/section-status'

export default function Page() {
  return (
    <main className="w-screen h-screen bg-background relative p-2 flex flex-col gap-2">
      <Header />
      <div className="w-full grid grid-cols-5 gap-2 flex-1">
        <div className="col-span-1 flex flex-col gap-2">
          <SectionChat />

          <SectionProgress />

          <SectionStatus />
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <section className="section-panel">
            <span>1</span>
          </section>

          <section className="section-panel">
            <span>2</span>
          </section>

          <SectionDynamicIsland />
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <SectionLeaderboard />

          <SectionAbility />

          <section className="section-panel h-[200px] flex-none">
            <span>2</span>
          </section>

          <SectionAbout />
        </div>
      </div>
    </main>
  )
}
