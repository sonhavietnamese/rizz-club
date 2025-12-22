import { LoginErrorResult } from '@wepin/login-js'

export const isLoginError = (res: any): res is LoginErrorResult => {
  return (res as LoginErrorResult).error !== undefined
}

export const languageCurrencyMap: { [key: string]: string } = {
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
}
