'use client'

import { createContext } from 'react'
import type { WepinSDK } from '@wepin/sdk-js'

export interface WepinContextValue {
  wepin: WepinSDK | null
  isInitializing: boolean
  isInitialized: boolean
  error: Error | null
  initialize: () => Promise<void>
  reset: () => void
}

export const WepinContext = createContext<WepinContextValue | undefined>(
  undefined
)
