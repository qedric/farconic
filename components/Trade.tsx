'use client'
import { useEffect, useState, useRef } from 'react'
import { type TransactionReceipt } from 'viem'
import { 
    type NFT,
    formatWeiToETH,
    abbreviateAddress,
    getTransactionReceipt,
    getTokenBalanceByAddress,
    removeThe
} from '@/lib/utils'
import { connectWalletClient, tradeBuilding, getIsApproved, approveForSelling, estimatePrice } from '@/app/api/mintclub'

const Trade: React.FC<{ building: NFT }> = (building) => {

    const [client, setClient] = useState<any>(null)
    const [receipt, setReceipt] = useState<TransactionReceipt>()
    const [address, setAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<number | null>(null)
    const [mode, setMode] = useState('buy') // State to manage buy or sell mode
    const qtyRef = useRef<HTMLInputElement>(null)
    const [estimation, setEstimation] = useState<{ priceEstimate: bigint, qty: bigint } | null>(null) // price estimation
    const [loading, setLoading] = useState(false)
    const [executingTrade, setExecutingTrade] = useState(false)
    const [executingApproval, setExecutingApproval] = useState(false)
    const [approved, setApproved] = useState(false)

    useEffect(() => {
        if (estimation) loadEstimate() // only load if it's a refresh
        if (!balance && address) getBalance(address as `0x${string}`)
    }, [mode])

    useEffect(() => { // check if address is approved for selling when address changes
        if (address) {
           setApproval()
        }
    }, [address])

    const setApproval = async () => {
        const isApproved = await getIsApproved(building.building.address, (address as `0x${string}`))
        console.log('Is approved:', isApproved)
        setApproved(isApproved)
    }

    const loadEstimate = async () => {
        setLoading(true)
        const estimate = await estimatePrice(building.building.address, BigInt(qtyRef.current?.value || 1), mode === 'sell')
        console.log(estimate)
        setEstimation(estimate)
        setLoading(false)
    }

    const getBalance = async(walletAddres:`0x${string}`) => setBalance(await getTokenBalanceByAddress(building.building.address, walletAddres) as any)

    const enoughBalance = ():boolean => (balance || 0) >= BigInt(qtyRef.current?.value || '1')

    const connectWallet = async () => {
        console.log('Connecting wallet...', address)
        setLoading(true)
        try {
            const walletClient = await connectWalletClient()
            const [walletAddress] = await walletClient.requestAddresses()
            setClient(walletClient)
            setAddress(walletAddress)
            const bal = getBalance(walletAddress)
            console.log('bal:', bal)
            setLoading(false)
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            setLoading(false)
        }
    }

    const approve = async () => {
        setExecutingApproval(true)
        try {
            const hash:any = await approveForSelling(client, (address as `0x${string}`), building.building.address)
            const receipt = await getTransactionReceipt(hash)
            console.log('Approval tx:', receipt)
            await setApproval()
            setExecutingApproval(false)
        } catch (error) {
            console.error('Failed to approve token', error)
            setExecutingApproval(false)
        }
    }

    const trade = async () => {
        setExecutingTrade(true)
        try {
            const hash:any = await tradeBuilding(client, (address as `0x${string}`), building.building.address, BigInt(qtyRef.current?.value || 1), mode !== 'buy')
            const receipt = await getTransactionReceipt(hash)
            console.log('trade tx:', receipt)
            setReceipt(receipt)
            getBalance(address as `0x${string}`)
            setExecutingTrade(false)
        } catch (error) {
            console.error('Transaction failed:', error)
            setExecutingTrade(false)
        }
    }

    return (
        <>
            <div className={`w-full flex justify-start flex-col border rounded-md transition-all ${estimation ? 'max-h-[1000px]' : 'max-h-[300]'}`} style={{ borderColor: building.building.building_color, color: building.building.building_color }}>
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
                <div className="animate-fade w-full flex flex-col mt-4" style={{ color: building.building.building_color }}>
                    <p className='text-center text-sm'>{ address && abbreviateAddress(address) }</p>
                    <button
                        className={`w-full font-semibold tracking-widest py-2 px-8 bg-black text-white rounded-md`}
                        style={{ backgroundColor: building.building.building_color }}
                        onClick={ address && client ? mode==='buy' || (mode==='sell' && approved) ? trade : approve : connectWallet }
                        disabled={loading || executingTrade || executingApproval || (address && client && mode==='sell' && !enoughBalance())}
                    >
                        {
                            address && client
                                ? mode === 'buy'
                                    ? <span className={loading || executingTrade ? `text-gray-400 ${executingTrade ? 'animate-pulse' : ''}` : 'animate-fade'}>{`${ executingTrade ? 'BUYING...' : 'CONFIRM BUY'}`}</span>
                                    : enoughBalance()
                                        ? approved
                                            ? <span className={loading || executingTrade ? `text-gray-400 ${executingTrade ? 'animate-pulse' : ''}` : 'animate-fade'}>{`${ executingTrade ? 'SELLING...' : 'CONFIRM SELL'}`}</span>
                                            : <span className={loading || executingApproval ? `text-gray-400 ${executingApproval ? 'animate-pulse' : ''}` : 'animate-fade'}>{`${ executingApproval ? 'APPROVING...' : 'APPROVE SELL'}`}</span>
                                        : <span className='text-gray-400'>INSUFFICIENT BALANCE</span>
                                : <span className={loading ? `animate-pulse text-gray-400` : 'animate-fade'}>{`Connect wallet to ${ mode === 'sell' ? 'sell' : 'buy'}`}</span>
                        }
                    </button>
                    {receipt && receipt.status === 'success' && (
                        <div className={`text-center font-semibold my-2 ${executingTrade ? `text-gray-400` : 'animate-fade'}`}>
                            { `Success!${balance && ` You now own ${balance} ${removeThe(building.building.metadata.name)} card${balance != 1 && 's'}`}` }
                        </div>
                    )}
                </div>
            }
        </>
    )
}

export default Trade