import Providers from '@/components/providers'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const faylake = localFont({
  src: '../fonts/faylake.ttf',
  variable: '--font-faylake',
})

export const metadata: Metadata = {
  title: 'Rizz Club',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${faylake.variable} antialiased `}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
