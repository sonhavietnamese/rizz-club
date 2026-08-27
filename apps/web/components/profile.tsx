import { env } from '@/env'
import { useCreateUser } from '@/hooks/use-users'
import { formatAddress, getDiscordAvatar } from '@/lib/utils'
import { useLinkAccount, useLogout, useSigners } from '@privy-io/react-auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBalance } from 'wagmi'

interface ProfileProps {
  profile: {
    discordId: string
    avatar: string
    username: string
    wallet: {
      address: string
      id: string
    }
  }
  stats: {
    strength: number
    dexterity: number
    reputation: number
  }
  isRegistered: boolean
  isLinkedAddress: boolean
  onRegisterSuccess?: () => void
}

export default function Profile({ profile, stats, isRegistered, isLinkedAddress, onRegisterSuccess }: ProfileProps) {
  const { mutate: createUser, isPending: isCreatingUser } = useCreateUser()
  const { linkWallet } = useLinkAccount()
  const { addSigners } = useSigners()
  const { logout } = useLogout()
  const router = useRouter()
  const [isLinkingWallet, setIsLinkingWallet] = useState(false)

  const { data: balance } = useBalance({
    address: profile?.wallet?.address as `0x${string}`,
    query: { enabled: !!profile?.wallet?.address, refetchInterval: 3000 },
  })

  const copyAddress = () => {
    navigator.clipboard.writeText(profile?.wallet?.address ?? '')
  }

  const handleLinkWallet = async () => {
    setIsLinkingWallet(true)
    await addSigners({
      address: profile.wallet.address ?? '',
      signers: [
        {
          signerId: env.NEXT_PUBLIC_AUTHORIZATION_ID,
        },
      ],
    })
    linkWallet()
    setIsLinkingWallet(false)
  }

  const handleRegister = async () => {
    if (!profile) return

    createUser(
      {
        privyId: profile.discordId,
        discordId: profile.discordId,
        walletId: profile.wallet.id,
        linkedAddress: profile.wallet.address,
      },
      { onSuccess: onRegisterSuccess }
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!profile) return null

  return (
    <aside className="bg-[#ECAD70] w-[500px] z-1 mask-[url('/masks/panel-profile.png')] mask-size-[100%_100%] mask-no-repeat mask-center p-8">
      <div className="flex gap-4 items-center w-full bg-[#ECD19C] mask-[url('/masks/panel-long.png')] mask-size-[100%_100%] mask-no-repeat mask-center p-6">
        <figure className="w-[120px] h-[120px] mask-[url('/masks/avatar.png')] mask-size-[100%_100%] mask-no-repeat mask-center">
          <div className="w-[120px] h-[120px] bg-[#ECAD70]">
            <Image
              src={getDiscordAvatar(profile.discordId, profile.avatar)}
              alt="Discord Avatar"
              width={100}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
        </figure>
        <div className="flex flex-col gap-1">
          <span className="font-faylake text-[#3C1F11] text-3xl">@{profile.username}</span>
          <span className="font-faylake text-[#3C1F11] text-xl">
            Balance: {Number(balance?.formatted ?? '0').toFixed(2)} STT | Level: 5
          </span>
          <span
            className="font-faylake text-[#3C1F11] text-xl cursor-pointer active:scale-95 transition-all duration-100 select-none"
            onClick={copyAddress}
          >
            Address: {formatAddress(profile.wallet?.address ?? 'N/A')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-5 items-center justify-center w-full bg-[#ECD19C] mask-[url('/masks/panel-rect.png')] mask-size-[100%_100%] mask-no-repeat mask-center p-8">
        {!isLinkedAddress ? (
          <div className="flex gap-4 mt-5 items-center justify-center w-full bg-[#ECD19C] mask-[url('/masks/panel-rect.png')] mask-size-[100%_100%] mask-no-repeat mask-center p-8">
            {isLinkingWallet ? (
              <button disabled className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]">
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
            ) : (
              <button
                onClick={handleLinkWallet}
                className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]"
              >
                <Image
                  draggable={false}
                  src="/btn-link-wallet.png"
                  alt="Link Wallet"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </button>
            )}
          </div>
        ) : (
          <>
            {isRegistered ? (
              <>
                <div className="grid w-full grid-rows-3 grid-cols-[1fr_50px_50px] gap-2 font-faylake text-[#3C1F11] text-2xl">
                  <span>Strength</span>
                  <span className="text-right">{stats.strength}</span>
                  <span className="text-center text-[#90B64F]">(+50)</span>
                  <span>Dexterity</span>
                  <span className="text-right">{stats.dexterity}</span>
                  <span className="text-center text-[#90B64F]">(+50)</span>
                  <span>Reputation</span>
                  <span className="text-right">{stats.reputation}</span>
                  <span className="text-center text-[#90B64F]">(+50)</span>
                </div>
                <div className="flex gap-4 mt-5 items-center justify-center w-full bg-[#ECD19C] mask-[url('/masks/panel-rect.png')] mask-size-[100%_100%] mask-no-repeat mask-center p-8">
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px]"
                  >
                    <Image
                      src="/btn-logout.png"
                      alt="Logout"
                      width={200}
                      height={200}
                      className="w-full h-full object-contain"
                    />
                  </button>
                </div>
              </>
            ) : (
              <>
                {isCreatingUser ? (
                  <button
                    disabled
                    className="cursor-pointer active:scale-85 transition-all duration-100 h-[80px] relative"
                  >
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
                ) : (
                  <button
                    disabled={isCreatingUser}
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
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
