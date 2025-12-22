import type { Account, WepinLifeCycle } from '@wepin/sdk-js'
import React, { createContext } from 'react'

interface WepinContextProps {
  appStatus: WepinLifeCycle
  registrationNeeded: boolean
  userDetails: any
  accountDetails: Account[] | undefined
  language: string
  setLanguage: React.Dispatch<React.SetStateAction<string>>
  loginWithUI: () => Promise<void>
  loginWithOAuth: () => Promise<void>
  logout: () => Promise<void>
  registerWepin: () => Promise<void>
  openWidget: () => Promise<void>
  send: (option: {
    account: Account
    txData?: {
      toAddress: string
      amount: string
    }
  }) => Promise<void>
}

export const WepinContext = createContext<WepinContextProps | undefined>(
  undefined
)
