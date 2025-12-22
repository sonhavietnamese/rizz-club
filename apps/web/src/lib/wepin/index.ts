import { env } from '@/env'
import { WepinLogin } from '@wepin/login-js'
import { WepinProvider as WPP } from '@wepin/provider-js'
import { WepinSDK } from '@wepin/sdk-js'
import { useEvmProvider, useWepin } from './hook'
import { WepinProvider } from './provider'

const wepinAppID = env.VITE_WEPIN_APP_ID
const wepinAppWebKey = env.VITE_WEPIN_API_KEY

export const wepinSdkInstance = new WepinSDK({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export const wepinLoginInstance = new WepinLogin({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export const wepinProviderInstance = new WPP({
  appId: wepinAppID,
  appKey: wepinAppWebKey,
})

export { useEvmProvider, useWepin, WepinProvider }
