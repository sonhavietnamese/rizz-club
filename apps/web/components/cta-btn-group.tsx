'use client'

import { useLogin } from '@privy-io/react-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function CtaBtnGroup() {
  const { login } = useLogin()

  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    try {
      setIsRegistering(true)

      // Step 1: Login with Discord
      const response = login({})

      console.log(response)
    } catch (error) {
      console.error(error)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="absolute bottom-[60px] flex gap-2">
      {!isRegistering ? (
        <>
          <button className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]">
            <Link target="_blank" href="https://discord.gg/fHhy3CGN">
              <Image
                src="/btn-join-discord.png"
                alt="Join Discord"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </Link>
          </button>
          <button
            onClick={handleRegister}
            className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]"
          >
            <Image
              src="/btn-register.png"
              alt="Register"
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          </button>
        </>
      ) : (
        <button className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]">
          <Image
            src="/btn-small.png"
            alt="Register"
            width={200}
            height={200}
            className="w-full h-full object-contain"
          />

          <figure className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 aspect-square">
            <Image
              src="/el-loading.png"
              alt="Register"
              width={50}
              height={50}
              className="w-full h-full object-contain animate-spin"
            />
          </figure>
        </button>
      )}
    </div>
  )
}
