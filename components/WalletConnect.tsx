'use client'

import { useState } from 'react'
import { createWalletClient, custom } from 'viem'
import { baseSepolia } from 'viem/chains'

const WalletConnect = ({ onConnect }: { onConnect: (connected: boolean, address: string) => void }) => {
    const [address, setAddress] = useState('')
    const [connected, setConnected] = useState(false)

    const connectWallet = async () => {
        try {
            const client = createWalletClient({
                chain: baseSepolia,
                transport: custom(window.ethereum!)
            })
            const [address] = await client.getAddresses()
            setAddress(address)
            setConnected(true)
            onConnect(true, address) // Pass the state to the parent component
        } catch (error) {
            console.error('Failed to connect wallet:', error)
        }
    }

    return (
        <div className="flex justify-center items-center h-40">
            {connected ? (
                <p className="font-bold text-center">
                    {`Connected to: ${address.substring(0, 5)}...${address.substring(address.length - 4)}`}
                </p>
            ) : (
                <button onClick={connectWallet} className="text-2xl btn rounded-[14px]">
                    CONNECT WALLET
                </button>
            )}
        </div>
    )
}

export default WalletConnect
