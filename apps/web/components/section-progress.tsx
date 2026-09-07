const STAGE_COUNT = 4
const TRACK_COLOR = '#3B3B3B'
const FILL_COLOR = '#C8C8C8'

const TRACKS = [
  { id: 1, name: 'Trade Masters', value: 0 },
  { id: 2, name: 'Trade Masters', value: 1 },
  { id: 3, name: 'Trade Masters', value: 2 },
  { id: 4, name: 'Trade Masters', value: 3 },
]

function DashedLine({ color }: { color: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="8 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function StageTrack({ value, max = STAGE_COUNT }: { value: number; max?: number }) {
  const progress = Math.min(Math.max(value / max, 0), 1)

  return (
    <div
      className="relative flex h-2 w-full items-center"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="absolute inset-x-[3px] inset-y-0">
        <DashedLine color={TRACK_COLOR} />
        <div
          className="absolute inset-0 origin-left transition-[clip-path] duration-200 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none"
          style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
        >
          <DashedLine color={FILL_COLOR} />
        </div>
      </div>

      <div className="relative flex w-full items-center justify-between">
        {Array.from({ length: STAGE_COUNT }).map((_, stage) => (
          <span
            key={stage}
            className="size-2.5 rounded-full transition-colors duration-150 [transition-timing-function:ease] motion-reduce:transition-none"
            style={{ background: stage < value ? FILL_COLOR : TRACK_COLOR }}
          />
        ))}
      </div>
    </div>
  )
}

export default function SectionProgress() {
  return (
    <section className="section-panel flex-none select-none">
      <ul className="grid h-full w-full grid-rows-4 gap-2">
        {TRACKS.map((track) => (
          <li className="flex items-center gap-3 text-white" key={track.id}>
            <div className="size-12 shrink-0 rounded-lg bg-[#C8C8C8]" />
            <div className="flex w-fit min-w-0 flex-col gap-2.5 flex-1 pr-2">
              <div className="flex items-end justify-between gap-2">
                <span className="font-sans text-[14px] font-semibold">{track.name}</span>
                <span className="font-sans text-[12px] text-white/50">1/100</span>
              </div>
              <StageTrack value={track.value} />
            </div>
            <div className="size-12 shrink-0 rounded-lg bg-[#C8C8C8]"></div>
          </li>
        ))}
      </ul>
    </section>
  )
}
