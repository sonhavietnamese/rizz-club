'use client'

import { env } from '@/env'
import { WepinLogin } from '@wepin/login-js'
import { WepinProvider } from '@wepin/provider-js'
import { WepinSDK } from '@wepin/sdk-js'
import { WepinContext, WepinSDKContext } from './context'
import { useEvmProvider, useWepin } from './hook'

const wepinAppID = env.NEXT_PUBLIC_WEPIN_APP_ID
const wepinAppWebKey = env.NEXT_PUBLIC_WEPIN_API_KEY

export const wepinSdkInstance = new WepinSDK({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export const wepinLoginInstance = new WepinLogin({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export const wepinProviderInstance = new WepinProvider({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export { useEvmProvider, useWepin, WepinContext, WepinSDKContext }
