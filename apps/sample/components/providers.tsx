'use client'

import { WepinSDKContext } from '@/lib/wepin'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <WepinSDKContext>{children}</WepinSDKContext>
}
