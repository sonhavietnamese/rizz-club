import { cn } from 'cn'

export default function SectionAbout() {
  return (
    <section className="section-panel font-sans flex-none gap-2 p-2 flex justify-between">
      <div className="p-2 px-2.5 rounded-lg w-fit">
        <span className={cn('text-[#6A7374] font-regular')}>{'{s}'}</span>
      </div>
      <div className="p-2 px-2.5 rounded-lg w-fit">
        <span className={cn('text-[#6A7374] font-regular')}>Event Contracts</span>
      </div>
      <div className="p-2 px-2.5 bg-[url('/background-texture.png')] mix-blend-exclusion bg-cover bg-center leading-none rounded-lg w-fit">
        <span className={cn('text-white font-regular')}>Version 0.1.12-oven</span>
      </div>
    </section>
  )
}
