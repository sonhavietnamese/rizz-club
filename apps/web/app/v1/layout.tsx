import LiveTabName from '@/components/live-tabname'
import Providers from '@/components/providers'
import '@/styles/globals.css'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <LiveTabName />
      {children}
    </Providers>
  )
}
