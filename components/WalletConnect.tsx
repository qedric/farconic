import { useState, useEffect } from 'react'
import { createWalletClient, custom } from 'viem'
import { baseSepolia, base } from 'viem/chains'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

async function ConnectWalletClient() {
    // Check for window.ethereum
    let transport
    if (window.ethereum) {
        transport = custom(window.ethereum)
    } else {
        throw new Error("MetaMask or another web3 wallet is not installed.")
    }

    // Declare a Wallet Client
    const walletClient = createWalletClient({
        chain: chain,
        transport: transport,
    })

    return walletClient
}

const WalletConnect = ({ onConnect }: { onConnect: (address: string) => void }) => {
    const [address, setAddress] = useState<string | null>(null)

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
            onConnect(address)
        }
    }, [address, onConnect])

    return (
        <div className="flex justify-center items-center h-40">
            {address ? (
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
