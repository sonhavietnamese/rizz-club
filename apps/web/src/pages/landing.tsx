import BackgroundVideo from '@/components/background-video'
import LandingPanel from '@/components/panel-landing'
import PanelKolRegister from '@/components/panel-kol-register'
import { useCreateUser, useUserQuery } from '@/hooks/use-users'
import { useWepin } from '@/lib/wepin'
import { useUserTypeStore } from '@/stores/user-type'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'

type Stages =
  | 'prepare' // ready to login to wepin
  | 'logged-in' // logged in to wepin
  | 'checked-user' // after logged in, checked user exists
  | 'register' // after checked user exists, register user
  | 'completed' // after register user, completed

const CONFIGS: Record<
  Stages,
  { width: number | string; height: number | string; background?: string }
> = {
  prepare: {
    width: 500,
    height: 440,
  },
  'logged-in': {
    width: 500,
    height: 440,
  },
  'checked-user': {
    width: 500,
    height: 440,
  },
  register: {
    width: 520,
    height: '100%',
    background: '#141414',
  },
  completed: {
    width: 520,
    height: '100%',
    background: '#141414',
  },
}

export default function Landing() {
  const { userType } = useUserTypeStore()
  const { appStatus, accountDetails, userDetails } = useWepin()

  // Get address from accountDetails
  const address = accountDetails?.[0]?.address

  // Use React Query to check if user exists (only when logged in and address is available)
  const isLoggedIn =
    appStatus === 'login' || appStatus === 'login_before_register'
  const {
    data: user,
    isLoading: isCheckingUser,
    error: userError,
  } = useUserQuery(isLoggedIn && address ? address : undefined)

  // Mutation to create user
  const createUserMutation = useCreateUser()

  // Determine stage based on appStatus and query results
  const stage: Stages = (() => {
    if (!isLoggedIn) return 'prepare'
    if (isCheckingUser) return 'logged-in'
    if (user) return 'checked-user'
    if (userError instanceof Error && userError.message === 'USER_NOT_FOUND') {
      if (createUserMutation.isPending) return 'register'
      if (createUserMutation.isSuccess) return 'completed'
      return 'register'
    }
    return 'logged-in'
  })()

  // Auto-create user when in register stage
  useEffect(() => {
    if (
      stage === 'register' &&
      address &&
      !createUserMutation.isPending &&
      !createUserMutation.isSuccess
    ) {
      const username =
        userDetails?.username ||
        userDetails?.email ||
        `user_${address.slice(0, 8)}`

      const userToCreate = {
        address,
        username,
        type: userType,
      }

      console.log('User needs to be created:', userToCreate)
    }
  }, [stage, address, userDetails, userType, createUserMutation])

  return (
    <motion.main className="w-screen h-screen flex items-center justify-center bg-[#E3E3E3] p-6">
      <motion.section
        initial={{
          width: 500,
          height: 440,
          background: '#ffffff',
        }}
        animate={{
          width: CONFIGS[stage].width || 500,
          height: CONFIGS[stage].height || 440,
          background: CONFIGS[stage].background || '#ffffff',
        }}
        className="squircle rounded-[100px] p-6 relative overflow-hidden z-1"
      >
        <AnimatePresence>
          {['prepare', 'logged-in', 'checked-user'].includes(stage) && (
            <LandingPanel />
          )}

          {stage === 'register' && userType === 'kols' && <PanelKolRegister />}
        </AnimatePresence>
      </motion.section>
      <BackgroundVideo
        show={['prepare', 'logged-in', 'checked-user'].includes(stage)}
      />
    </motion.main>
  )
}
