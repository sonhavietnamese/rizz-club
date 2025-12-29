import { create } from 'zustand'

interface RegisterStore {
  type: 'kols' | 'fans'
  setType: (type: 'kols' | 'fans') => void

  username: string
  setUsername: (username: string) => void

  step: number
  setStep: (step: number) => void
}

export const useRegisterStore = create<RegisterStore>((set) => ({
  type: 'kols',
  setType: (type: 'kols' | 'fans') => set({ type }),

  username: '',
  setUsername: (username: string) => set({ username }),

  step: 1,
  setStep: (step: number) => set({ step }),
}))
