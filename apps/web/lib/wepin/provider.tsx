'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { WepinContext } from './context'
import type { WepinSDK } from '@wepin/sdk-js'
import { initWepin } from './index'

interface WepinProviderProps {
  children: React.ReactNode
  autoInitialize?: boolean
}

export function WepinProvider({
  children,
  autoInitialize = true,
}: WepinProviderProps) {
  const [wepin, setWepin] = useState<WepinSDK | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const initialize = useCallback(async () => {
    // If already initialized, don't initialize again
    if (wepin) {
      return
    }

    setIsInitializing(true)
    setError(null)
    try {
      const instance = await initWepin()
      setWepin(instance)
      setIsInitializing(false)
      setIsInitialized(instance.isInitialized())
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to initialize WePin')
      setError(error)
      setIsInitializing(false)
      setIsInitialized(false)
      throw err
    }
  }, [wepin])

  const reset = useCallback(() => {
    setWepin(null)
    setIsInitializing(false)
    setError(null)
    setIsInitialized(false)
  }, [])

  // Auto-initialize on mount if enabled
  useEffect(() => {
    if (autoInitialize && !wepin && !isInitializing) {
      initialize().catch(() => {
        // Error is already handled in initialize
      })
    }
  }, [autoInitialize, wepin, isInitializing, initialize])

  return (
    <WepinContext.Provider
      value={{
        wepin,
        isInitializing,
        isInitialized,
        error,
        initialize,
        reset,
      }}
    >
      {children}
    </WepinContext.Provider>
  )
}
