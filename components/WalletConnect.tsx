// components/WalletConnect.tsx
'use client'

import { useEffect } from 'react'
import { createWalletClient, custom } from 'viem'
import { baseSepolia, base } from 'viem/chains'
import { useWallet } from '@/context/WalletContext'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

async function ConnectWalletClient() {
  let transport
  if (window.ethereum) {
    transport = custom(window.ethereum)
  } else {
    throw new Error('MetaMask or another web3 wallet is not installed.')
  }

  const walletClient = createWalletClient({
    chain: chain,
    transport: transport,
  })

  return walletClient
}

const WalletConnect = () => {
  const { address, setAddress } = useWallet()

  const connectWallet = async () => {
    try {
      const client = await ConnectWalletClient()
      const [walletAddress] = await client.requestAddresses()
      setAddress(walletAddress)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  useEffect(() => {
    if (address) {
      console.log('Connected address:', address)
    }
  }, [address])

  // the idea is to show the connect button on the nav bar, but we don't want to wrap our client context around the whole app
  return (
    <div className="lg:absolute w-fit top-0 right-[12%] lg:h-32 flex justify-center items-center">
      {address ? (
        <p className="text-center">
          {`Connected to: ${address.substring(0, 5)}...${address.substring(address.length - 4)}`}
        </p>
      ) : (
        <button onClick={connectWallet} className="text-2xl btn">
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default WalletConnect