import { create } from 'zustand'

type UserType = 'fans' | 'kols'

interface UserTypeStore {
  userType: UserType
  setUserType: (userType: UserType) => void
}

export const useUserTypeStore = create<UserTypeStore>((set) => ({
  userType: 'fans',
  setUserType: (userType: UserType) => set({ userType }),
}))
