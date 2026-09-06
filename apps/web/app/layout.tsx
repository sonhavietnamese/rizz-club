import Providers from '@/components/providers'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import localFont from 'next/font/local'

const faylake = localFont({
  src: '../fonts/faylake.ttf',
  variable: '--font-faylake',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'Rizz Club',
  icons: {
    icon: '/icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${faylake.variable} ${geist.className} antialiased `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
