import { getNetworkInfoByName, type BaseProvider } from '@wepin/provider-js'
import type { Account } from '@wepin/sdk-js'
import { useCallback, useContext, useEffect, useState } from 'react'
import { WepinContext } from './context'
import { wepinProviderInstance } from './index'

export function useEvmProvider(accountDetails: Account[] | undefined) {
  const [blockchainProvider, setBlockchainProvider] = useState<BaseProvider>()
  const [evmNetworks, setEvmNetworks] = useState<string[] | undefined>()
  const [selectedEvmNetwork, setSelectedEvmNetwork] = useState<string>()
  const [providerAccount, setProviderAccount] = useState<any>()
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAddress, setCurrentAddress] = useState<string | undefined>()

  const changeProviderNetwork = useCallback(
    async (network?: string) => {
      try {
        if (!network || (selectedEvmNetwork === network && blockchainProvider))
          return
        const chainId = (await getNetworkInfoByName(network))?.chainId
        if (chainId) {
          if (!blockchainProvider) {
            const provider = await wepinProviderInstance.getProvider(network)
            setBlockchainProvider(provider)
          } else {
            await blockchainProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId }],
            })
          }
          setSelectedEvmNetwork(network)
        } else {
          console.error('Unsupported network:', network)
        }
      } catch (e: any) {
        console.error('Error changing network:', e)
      }
    },
    [blockchainProvider, selectedEvmNetwork]
  )

  useEffect(() => {
    if (accountDetails) {
      const evmAccounts = accountDetails
        ?.filter(
          (acc) =>
            (!acc.contract &&
              !acc.isAA &&
              acc.network.toLowerCase() === 'ethereum') ||
            acc.network.toLowerCase().startsWith('klaytn') ||
            acc.network.toLowerCase().startsWith('evm')
        )
        .map((acc) => acc.network.toLowerCase())
      setEvmNetworks(evmAccounts)
      if (!selectedEvmNetwork) changeProviderNetwork(evmAccounts?.[0])
    }
  }, [accountDetails, selectedEvmNetwork, changeProviderNetwork])

  const handleSelectedEvmNetwork = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    changeProviderNetwork(event.target.value)
  }

  const getAccounts = async () => {
    if (!blockchainProvider) {
      alert('Provider is not initialized.')
      return
    }
    try {
      const accounts = await blockchainProvider.request({
        method: 'eth_accounts',
      })
      setProviderAccount(accounts)
      setCurrentAddress(blockchainProvider.selectedAddress ?? undefined)
    } catch (error) {
      alert('Error fetching accounts:' + error)
    }
  }

  const getBalance = async () => {
    if (!currentAddress) {
      alert('Please select an account.')
      return
    }
    if (!blockchainProvider) {
      alert('Provider is not initialized.')
      return
    }
    try {
      const balanceValue = await blockchainProvider.request({
        method: 'eth_getBalance',
        params: [currentAddress, 'latest'],
      })
      setBalance(balanceValue as string)
    } catch (error) {
      alert('Error fetching balance:' + error)
    }
  }

  const signMessage = async (message: string) => {
    if (!currentAddress) {
      alert('Please select an account.')
      return
    }
    if (!blockchainProvider) {
      alert('Provider is not initialized.')
      return
    }
    try {
      const signedMessage = await blockchainProvider.request({
        method: 'personal_sign',
        params: [message, currentAddress],
      })
      alert('Signed message:' + signedMessage)
    } catch (error) {
      alert('Error signing message:' + error)
    }
  }

  const sendTransaction = async (to: string, amount: string) => {
    if (!currentAddress) {
      alert('Please select an account.')
      return
    }
    if (!blockchainProvider) {
      alert('Provider is not initialized.')
      return
    }
    try {
      const txHash = await blockchainProvider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAddress,
            to,
            value: amount,
          },
        ],
      })
      alert('Transaction sent:' + txHash)
    } catch (error) {
      alert('Error sending transaction:' + error)
    }
  }

  return {
    blockchainProvider,
    evmNetworks,
    selectedEvmNetwork,
    handleSelectedEvmNetwork,
    providerAccount,
    balance,
    currentAddress,
    getAccounts,
    getBalance,
    signMessage,
    sendTransaction,
  }
}

export const useWepin = () => {
  return useContext(WepinContext)!
}
