// wepinInstances.ts
import { WepinLogin } from '@wepin/login-js'
import { WepinProvider } from '@wepin/provider-js'
import { WepinSDK } from '@wepin/sdk-js'

// Replace with your actual app ID and key
const wepinAppID = 'ac0ad640e9a45fdcf8558dcc06dabab1'
const wepinAppWebKey = 'ak_live_g5HOltL8OsrEVNj52wGpG5G4aiAxp8t0FtCkgBcCDlS'

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
