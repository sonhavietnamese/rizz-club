import Providers from '@/components/providers'
import LiveTabName from '@/components/live-tabname'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <LiveTabName />
      {children}
    </Providers>
  )
}
