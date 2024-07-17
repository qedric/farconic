'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { baseSepolia, base } from 'viem/chains'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

interface WalletContextProps {
  address: string | null
  setAddress: (address: string | null) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
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
