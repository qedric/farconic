'use client'
import { useEffect, useState, useRef } from 'react'
import { NFT, estimatePrice, formatWeiToETH, abbreviateAddress, getIsApproved, approveForSelling, mintBuilding, burnBuilding } from '@/lib/utils'
import { useWallet, connectWalletClient } from '@/context/WalletContext'
import { mintBuildings } from '@/app/api/mintclub'

const Trade: React.FC<{ building: NFT }> = (building) => {

    const [client, setClient] = useState<any>(null)
    const { address, setAddress } = useWallet()
    const [mode, setMode] = useState('buy') // State to manage buy or sell mode
    const qtyRef = useRef<HTMLInputElement>(null) // Ref to the
    const [estimation, setEstimation] = useState<{ priceEstimate: bigint, qty: bigint } | null>(null) // State to store the estimation
    const [loading, setLoading] = useState(false) // State to manage loading state
    const [approved, setApproved] = useState(false) // State to manage approval state

    useEffect(() => {
        if (estimation) loadEstimate() // only load if it's a refresh
    }, [mode])

    const loadEstimate = async () => {
        setLoading(true)
        const estimate = await estimatePrice(building.building.address, BigInt(qtyRef.current?.value || 1), mode === 'sell')
        console.log(estimate)
        setEstimation(estimate)
        setLoading(false)
    }

    const connectWallet = async () => {
        console.log('Connecting wallet...', address)
        setLoading(true)
        try {
            const client = await connectWalletClient()
            const [walletAddress] = await client.requestAddresses()
            setClient(client)
            setAddress(walletAddress)
            setLoading(false)
            setApproved(await getIsApproved(building.building.address, (walletAddress as `0x${string}`)))
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            setLoading(false)
        }
    }

    const approve = async () => {
        setLoading(true)
        try {
            const txReceipt:any = await approveForSelling(building.building.address, (address as `0x${string}`))
            console.log('Approval tx:', txReceipt)
            setApproved(await getIsApproved(building.building.address, (address as `0x${string}`)))
            setLoading(false)
        } catch (error) {
            console.error('Failed to approve token', error)
            setLoading(false)
        }
    }

    const trade = async () => {
        setLoading(true)
        try {
            console.log('client:', client)
            const txReceipt:any = mode === 'buy'
                ? await mintBuildings(client, (address as `0x${string}`), building.building.address, BigInt(qtyRef.current?.value || 1))
                : await burnBuilding(building.building.address, BigInt(qtyRef.current?.value || 1))
            console.log('Approval tx:', txReceipt)
            setLoading(false)
        } catch (error) {
            console.error('Transaction failed:', error)
            setLoading(false)
        }
    }

    return (
        <>
            <div className={`w-full flex justify-start flex-col border rounded-md my-4 transition-all ${estimation ? 'max-h-[1000px]' : 'max-h-[300]'}`} style={{ borderColor: building.building.building_color, color: building.building.building_color }}>
                <div className="flex w-full overflow-hidden">
                    <div className="w-1/2 border-b" dir="ltr" style={{ borderColor: building.building.building_color }}>
                        <button
                            className={`w-full font-semibold tracking-widest rounded-tl-sm py-2 px-8 ${mode === 'buy' ? `text-white` : 'bg-transparent text-gray-400'}`}
                            style={{ backgroundColor: mode === 'buy' ? building.building.building_color : 'transparent' }}
                            onClick={() => setMode('buy')}
                        >
                            Buy
                        </button>
                    </div>
                    <div className="w-1/2 border-b" dir="rtl" style={{ borderColor: building.building.building_color }}>
                        <button
                            className={`w-full font-semibold tracking-widest rounded-tl-sm py-2 px-8 ${mode === 'sell' ? 'bg-black text-white' : 'bg-transparent text-gray-400'}`}
                            style={{ backgroundColor: mode === 'sell' ? building.building.building_color : 'transparent' }}
                            onClick={() => setMode('sell')}
                        >
                            Sell
                        </button>
                    </div>
                </div>
                <div className="px-12 flex justify-center items-center gap-4 my-5">
                    <h4>Quantity:</h4>
                    <input
                        type="number"
                        className="w-40 font-semibold tracking-widest py-2 px-8 rounded-lg border"
                        placeholder="1"
                        style={{ borderColor: building.building.building_color }}
                        ref={qtyRef}
                    />
                </div>
                {estimation && (
                    <div className="animate-fade">
                        <p className="text-center mt-2 mb-4">Estimation: {formatWeiToETH(estimation.priceEstimate)}</p>
                    </div>
                )}
                <div className="flex flex-col">
                    <button
                        className={`w-full font-semibold tracking-widest py-2 px-8 bg-black text-white rounded-b-sm`}
                        style={{ backgroundColor: building.building.building_color }}
                        onClick={loadEstimate}
                        disabled={loading}
                    >
                        <span className={loading ? `animate-pulse text-gray-400` : ''}>{estimation ? 'REFRESH' : 'GET'} QUOTE</span>
                    </button>
                </div>
            </div>

            {estimation &&
                <div className="animate-fade w-full flex flex-col mb-4" style={{ color: building.building.building_color }}>
                    <p className='text-center text-sm'>{ address && abbreviateAddress(address) }</p>
                    <button
                        className={`w-full font-semibold tracking-widest py-2 px-8 bg-black text-white rounded-md`}
                        style={{ backgroundColor: building.building.building_color }}
                        onClick={ address ? mode==='buy' || (mode==='sell' && approved) ? trade : approve : connectWallet }
                        disabled={loading}
                    >
                        {
                            address
                                ? mode === 'buy'
                                    ? <span className={loading ? `animate-pulse text-gray-400` : 'animate-fade'}>CONFIRM BUY</span>
                                    : approved
                                        ? <span className={loading ? `animate-pulse text-gray-400` : 'animate-fade'}>CONFIRM SELL</span>
                                        : <span className={loading ? `animate-pulse text-gray-400` : 'animate-fade'}>APPROVE SELL</span>
                                : <span className={loading ? `animate-pulse text-gray-400` : 'animate-fade'}>{`Connect wallet to ${ mode === 'sell' ? 'sell' : 'buy'}`}</span>
                        }
                    </button>
                </div>
            }
        </>
    )
}

export default Trade