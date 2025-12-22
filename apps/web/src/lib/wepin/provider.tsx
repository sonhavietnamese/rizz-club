import type { Account, WepinLifeCycle } from '@wepin/sdk-js'
import React, { useEffect, useState } from 'react'
import { WepinContext } from './context'
import {
  wepinLoginInstance,
  wepinProviderInstance,
  wepinSdkInstance,
} from './index'
import { isLoginError, languageCurrencyMap } from './utils'

export const WepinProvider = ({ children }: { children: React.ReactNode }) => {
  const [appStatus, setAppStatus] = useState<WepinLifeCycle>('not_initialized')
  const [registrationNeeded, setRegistrationNeeded] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [accountDetails, setAccountDetails] = useState<Account[] | undefined>()
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const currency = languageCurrencyMap[language] || 'USD'

        if (!wepinSdkInstance?.isInitialized()) {
          await wepinSdkInstance?.init({
            defaultLanguage: language,
            defaultCurrency: currency,
          })
        } else {
          wepinSdkInstance?.changeLanguage({ language, currency })
        }
        if (!wepinLoginInstance?.isInitialized())
          await wepinLoginInstance?.init(language)
        else wepinLoginInstance.changeLanguage(language)
        if (!wepinProviderInstance?.isInitialized())
          await wepinProviderInstance?.init({
            defaultLanguage: language,
            defaultCurrency: currency,
          })
        else wepinProviderInstance.changeLanguage({ language, currency })

        const status = await wepinSdkInstance?.getStatus()
        setAppStatus(status)

        if (status === 'login') {
          const userInfo = await wepinSdkInstance?.loginWithUI()
          setUserDetails(userInfo)
        }

        if (status === 'login_before_register') {
          setRegistrationNeeded(true)
        }
      } catch (error) {
        console.error('Error during initialization:', error)
      }
    }
    initializeApp()
  }, [language])

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await wepinSdkInstance.getAccounts()
        setAccountDetails(accounts)
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
    }
    if (appStatus === 'login') fetchAccounts()
  }, [appStatus])

  const loginWithUI = async () => {
    try {
      await logout()
      const userInfo = await wepinSdkInstance.loginWithUI()
      setUserDetails(userInfo)
      const status = await wepinSdkInstance.getStatus()
      setAppStatus(status)
    } catch (error) {
      console.error('Login with UI failed:', error)
    }
  }

  const loginWithOAuth = async () => {
    try {
      const oauthUser = await wepinLoginInstance.loginWithOauthProvider({
        provider: 'google',
      })
      if (isLoginError(oauthUser)) {
        console.error('OAuth login failed:', oauthUser)
        return
      }
      const userInfo = await wepinLoginInstance.loginWepin(oauthUser)
      setUserDetails(userInfo)
      const status = await wepinSdkInstance.getStatus()
      setAppStatus(status)
      if (status === 'login_before_register') {
        setRegistrationNeeded(true)
      }
    } catch (error) {
      console.error('OAuth login failed:', error)
    }
  }

  const logout = async () => {
    try {
      await wepinSdkInstance.logout()
      const status = await wepinSdkInstance.getStatus()
      setAppStatus(status)
      setRegistrationNeeded(false)
      setUserDetails(null)
      setAccountDetails(undefined)
      await wepinProviderInstance.finalize()
      await wepinProviderInstance.init({
        defaultLanguage: language,
        defaultCurrency: languageCurrencyMap[language] || 'USD',
      })
      // 필요한 경우 다른 상태들도 초기화
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const registerWepin = async () => {
    if (!registrationNeeded) {
      alert('No registration required.')
      return
    }
    try {
      const userInfo = await wepinSdkInstance.register()
      setUserDetails(userInfo)
      setRegistrationNeeded(false)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const openWidget = async () => {
    try {
      await wepinSdkInstance.openWidget()
    } catch (error) {
      alert('Error opening widget:' + error)
    }
  }

  const send = async (options: {
    account: Account
    txData?: {
      toAddress: string
      amount: string
    }
  }) => {
    try {
      await wepinSdkInstance.send(options)
    } catch (error) {
      alert('Error send:' + error)
    }
  }

  return (
    <WepinContext.Provider
      value={{
        appStatus,
        registrationNeeded,
        userDetails,
        accountDetails,
        language,
        setLanguage,
        loginWithUI,
        loginWithOAuth,
        logout,
        registerWepin,
        openWidget,
        send,
      }}
    >
      {children}
    </WepinContext.Provider>
  )
}
