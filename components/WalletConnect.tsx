// components/WalletConnect.tsx
'use client'

import { useEffect, useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { baseSepolia, base } from 'viem/chains'
import { useWallet } from '@/context/WalletContext'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import Spinner from '@/components/Spinner'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

async function ConnectWalletClient() {
  let transport
  if (window.ethereum) {
    transport = custom(window.ethereum)
  } else {
    const provider = await EthereumProvider.init({
      chains: [baseSepolia.id, base.id],
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

const WalletConnect = () => {

  const { address, setAddress } = useWallet()
  const [isLoading, setIsLoading] = useState(false) // State for loading spinner

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const client = await ConnectWalletClient()
      const [walletAddress] = await client.requestAddresses()
      setAddress(walletAddress)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      console.log('Connected address:', address)
    }
  }, [address])

  // the idea is to show the connect button on the nav bar, but we don't want to wrap our client context around the whole app
  return (
    <div className="lg:absolute my-3 w-fit top-0 right-[12%] lg:h-20 flex justify-center items-center">
      {address ? (
        <p className="text-center">
          {`Connected to: ${address.substring(0, 5)}...${address.substring(address.length - 4)}`}
        </p>
      ) : (
        <button onClick={connectWallet} className="flex items-center justify-between text-2xl btn transition-all" disabled={ isLoading }>
          { isLoading && <div className="mr-4 h-6"><Spinner isLoading={true} /></div> } Connect Wallet
        </button>
      )}
    </div>
  )
}

export default WalletConnect