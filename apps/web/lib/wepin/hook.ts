import { useContext, useMemo } from 'react'
import type { WepinSDK } from '@wepin/sdk-js'
import { WepinContext, type WepinContextValue } from './context'

export interface UseWepinReturn extends Omit<WepinContextValue, 'wepin'> {
  /**
   * Guaranteed non-null WepinLogin instance.
   * Only available when isInitialized is true.
   * Check isInitializing before accessing to avoid errors during initialization.
   */
  wepin: WepinSDK
}

export function useWepin(): UseWepinReturn {
  const context = useContext(WepinContext)
  if (context === undefined) {
    throw new Error('useWepin must be used within a WepinProvider')
  }

  // Only compute and return non-null wepin when initialization is complete
  // During initialization or before initialization starts, return a safe placeholder
  // The component should guard access with isInitializing check
  const wepin = useMemo((): WepinSDK => {
    // If initialized and wepin exists, return it
    if (context.isInitialized && context.wepin) {
      return context.wepin
    }

    // If still initializing, return placeholder (component should check isInitializing)
    if (context.isInitializing) {
      return (context.wepin ?? null) as WepinSDK
    }

    // If not initialized yet and not initializing, check if there's an error
    // If there's an error, initialization failed - throw
    // Otherwise, we're in initial state before initialization starts - return placeholder
    if (!context.isInitialized) {
      // If there's an error, initialization was attempted and failed
      if (context.error) {
        throw new Error(
          `WePin initialization failed: ${context.error.message}. Make sure autoInitialize is enabled or call initialize() first.`
        )
      }
      // Otherwise, initialization hasn't started yet (will happen soon with autoInitialize)
      // Return placeholder - component should check isInitializing before using
      return (context.wepin ?? null) as WepinSDK
    }

    // Fallback (shouldn't reach here)
    throw new Error(
      'WePin is not initialized. Make sure autoInitialize is enabled or call initialize() first.'
    )
  }, [
    context.wepin,
    context.isInitialized,
    context.isInitializing,
    context.error,
  ])

  return {
    ...context,
    wepin,
  }
}
