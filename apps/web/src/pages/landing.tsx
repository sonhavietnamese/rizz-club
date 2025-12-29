import BackgroundVideo from '@/components/background-video'
import LandingPanel from '@/screens/landing'
import PanelKolRegister from '@/screens/kol-register'
import { useCreateUser, useUserQuery } from '@/hooks/use-users'
import { useWepin } from '@/lib/wepin'
import { useUserTypeStore } from '@/stores/user-type'
import { useStageStore, type Stages } from '@/stores/stage'
import { AnimatePresence, motion } from 'motion/react'
import Fans from '@/screens/fans'
import { useEffect } from 'react'

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
  const { appStatus, accountDetails } = useWepin()
  const { stage, calculateStage } = useStageStore()

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

  // Calculate stage based on appStatus and query results
  useEffect(() => {
    calculateStage({
      isLoggedIn,
      isCheckingUser,
      user,
      userError,
      createUserMutationPending: createUserMutation.isPending,
      createUserMutationSuccess: createUserMutation.isSuccess,
    })
  }, [
    isLoggedIn,
    isCheckingUser,
    user,
    userError,
    createUserMutation.isPending,
    createUserMutation.isSuccess,
    calculateStage,
  ])

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
          {stage === 'completed' && userType === 'fans' && <Fans />}
        </AnimatePresence>
      </motion.section>
      <BackgroundVideo
        show={['prepare', 'logged-in', 'checked-user'].includes(stage)}
      />
    </motion.main>
  )
}
