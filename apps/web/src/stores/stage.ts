import { create } from 'zustand'

export type Stages =
  | 'prepare' // ready to login to wepin
  | 'logged-in' // logged in to wepin
  | 'checked-user' // after logged in, checked user exists
  | 'register' // after checked user exists, register user
  | 'completed' // after register user, completed

interface StageStore {
  stage: Stages
  setStage: (stage: Stages) => void
  calculateStage: (params: {
    isLoggedIn: boolean
    isCheckingUser: boolean
    user: unknown
    userError: unknown
    createUserMutationPending: boolean
    createUserMutationSuccess: boolean
  }) => void
}

export const useStageStore = create<StageStore>((set) => ({
  stage: 'prepare',
  setStage: (stage) => set({ stage }),
  calculateStage: ({
    isLoggedIn,
    isCheckingUser,
    user,
    userError,
    createUserMutationPending,
    createUserMutationSuccess,
  }) => {
    let newStage: Stages = 'prepare'

    if (!isLoggedIn) {
      newStage = 'prepare'
    } else if (isCheckingUser) {
      newStage = 'logged-in'
    } else if (user) {
      newStage = 'checked-user'
    } else if (
      userError instanceof Error &&
      userError.message === 'USER_NOT_FOUND'
    ) {
      if (createUserMutationPending) {
        newStage = 'register'
      } else if (createUserMutationSuccess) {
        newStage = 'completed'
      } else {
        newStage = 'register'
      }
    } else {
      newStage = 'logged-in'
    }

    set({ stage: newStage })
  },
}))
