// context/WalletContext.js
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextProps {
  address: string | null
  setAddress: (address: string | null) => void
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)

  return (
    <WalletContext.Provider value={{ address, setAddress }}>
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
