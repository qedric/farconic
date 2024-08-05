import { useState, useEffect } from 'react'
import { formatWeiToETH, type Building } from '@/lib/utils'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'
import { getOwnedTokens } from '@/app/api/alchemy'

const buildings = process.env.NEXT_PUBLIC_CHAIN == 'MAINNET' ? mainnet_buildings : testnet_buildings

export default function AdminWallets() {
    const [ownedTokens, setOwnedTokens] = useState<any[] | "Error" | null>(null)
    const [ownedBuildings, setOwnedBuildings] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchOwnedTokens = async () => {
        setIsLoading(true)
        try {
            const tokens = await getOwnedTokens(`${process.env.RAFFLE_PRIZE_CUSTODY_ADDRESS}` as `0x${string}`)
            setOwnedTokens(tokens)
            filterBuildings(tokens)
        } catch (error) {
            console.error('Error getting owned tokens:', error)
            setOwnedTokens('Error')
        } finally {
            setIsLoading(false)
        }
    }

    const filterBuildings = (tokens: any[] | "Error" ) => {
        if (tokens === "Error" || tokens === null) {
            setOwnedBuildings([])
            return
        }

        const ownedContractAddresses = new Set(
            tokens.map((token: any) => token.contractAddress.toLowerCase())
        )

        const balanceMap = tokens.reduce((acc: any, token: any) => {
            acc[token.contractAddress.toLowerCase()] = token.balance
            return acc
        }, {})

        const filtered = buildings.map((building: any) => {
            if (ownedContractAddresses.has(building.address?.toLowerCase())) {
                return { ...building, balance: balanceMap[building.address.toLowerCase()] }
            }
            return building
        }).filter((building: any) => building.balance)

        setOwnedBuildings(filtered as Building[])
    }

    useEffect(() => {
        if (!ownedTokens) {
            fetchOwnedTokens()
        }
    }, [])

    const getBuildingUrl = (address: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET'
            ? 'https://basescan.org/address/'
            : 'https://sepolia.basescan.org/address/'
        return `${baseUrl}${address}`
    }

    return (
        <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
            <h1 className="w-full text-center mb-4">Admin Wallet Balance:</h1>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="w-full">
                    {Array.isArray(ownedTokens) ? (
                        ownedTokens.length > 0 ? (
                            <div>
                                <div className="w-full grid grid-cols-3 gap-4 text-center font-bold mb-2">
                                    <div>Building ID</div>
                                    <div>Building Name</div>
                                    <div>Balance Owned</div>
                                </div>
                                {ownedBuildings?.map((building, index) => (
                                    <div
                                        key={index}
                                        className="w-full grid grid-cols-3 gap-4 text-center cursor-pointer hover:bg-gray-100"
                                    >
                                        <div>
                                            <a
                                                key={index}
                                                href={getBuildingUrl(building.address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full grid grid-cols-3 gap-4 text-center cursor-pointer hover:bg-gray-100"
                                            >
                                                {building.id}
                                            </a>
                                        </div>
                                        <div>{building.metadata.name}</div>
                                        <div>{building.balance}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No tokens found</div>
                        )
                    ) : (
                        <div>No tokens found</div>
                    )}
                </div>
            )}
        </div>
    )
}