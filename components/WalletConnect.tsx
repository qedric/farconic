// components/WalletConnect.tsx
'use client'
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useWallet, connectWalletClient } from '@/context/WalletContext'
import { getAdminsFromDb } from '@/app/api/mongodb'
import Spinner from '@/components/Spinner'

const WalletConnect: React.FC<{ targetId: string }> = ({ targetId }) => {

  // this is a client component and we need to place it in the header section of the app
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const { address, setAddress, setIsAdmin } = useWallet()
  const [isLoading, setIsLoading] = useState(false) // State for loading spinner

  useEffect(() => {
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      setContainer(targetElement)
    }
  }, [targetId])

  useEffect(() => {
    if (address) {
      console.log('Connected address:', address)
      // check if the user is an admin:
      getAdminsFromDb().then(admins => {
        setIsAdmin(admins.includes(address))
      })
    }
  }, [address])

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const client = await connectWalletClient()
      const [walletAddress] = await client.requestAddresses()
      setAddress(walletAddress)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setIsLoading(false)
    }
  }

  if (!container) return null

  // the idea is to show the connect button on the nav bar, but we don't want to wrap our client context around the whole app
  return ReactDOM.createPortal(
    <div className="w-fit flex">
      {address ? (
        <p className="text-lg lg:text-2xl">
          {`Connected to: ${address.substring(0, 5)}...${address.substring(address.length - 4)}`}
        </p>
      ) : (
        <button onClick={connectWallet} className="flex items-center justify-between text-lg lg:text-2xl font-semibold btn transition-all" disabled={ isLoading }>
          { isLoading && <div className="mr-4 h-6"><Spinner isLoading={true} /></div> } Connect Wallet
        </button>
      )}
    </div>,
    container
  )
}

export default WalletConnect