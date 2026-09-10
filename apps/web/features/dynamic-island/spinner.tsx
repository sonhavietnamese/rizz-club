export default function Spinner({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span
      aria-hidden
      className={`size-5 shrink-0 rounded-full border-2 border-white/25 border-t-white ${
        reduceMotion ? '' : 'animate-spin'
      }`}
    />
  )
}
