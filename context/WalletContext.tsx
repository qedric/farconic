'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { createWalletClient, custom } from 'viem'
import { baseSepolia, base } from 'viem/chains'
import { EthereumProvider } from '@walletconnect/ethereum-provider'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

interface WalletContextProps {
  address: string | null
  setAddress: (address: string | null) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
}

export const connectWalletClient = async () => {
  let transport
  if (window.ethereum) {
    transport = custom(window.ethereum)
  } else {
    const provider = await EthereumProvider.init({
      optionalChains: [baseSepolia.id, base.id],
      projectId: 'ab12d338ce41e49b370095950d6f9213',
      metadata: {
        name: 'farconic',
        description: 'Collect buildings and claim cities!',
        url: 'https://farconic.xyz', // origin must match your domain & subdomain
        icons: ['/farconic_logo.png']
      },
      showQrModal: true
    })

    // try walletConnect
    transport = custom(provider)
    await provider.connect()
  }

  if (!transport) {
    throw new Error('MetaMask or another web3 wallet is not installed.')
  }

  const walletClient = createWalletClient({
    chain: chain,
    transport: transport,
  })

  return walletClient
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  return (
    <WalletContext.Provider value={{ address, setAddress, isAdmin, setIsAdmin }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
