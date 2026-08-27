'use client'

import CtaBtnGroup from '@/components/cta-btn-group'
import { usePrivy } from '@privy-io/react-auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default function Home() {
  const { ready, authenticated } = usePrivy()

  if (!ready) return <div>Loading...</div>

  if (authenticated) {
    return redirect('/me')
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-cover before:bg-center before:bg-no-repeat before:bg-[url('/background-01.png')] before:z-0">
      <figure className="w-[200px] h-auto z-1 absolute top-[60px]">
        <Image
          src="/fishing-frienzy-logo.png"
          alt="Fishing Frienzy Logo"
          width={400}
          height={400}
          className="w-full h-full object-contain"
        />
      </figure>

      <CtaBtnGroup />
    </main>
  )
}
