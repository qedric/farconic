'use client'
import { NFT } from "@/lib/utils"
import { useState, useEffect } from 'react'
import buildings from '@/data/buildings.json'
import CardSVG from "@/components/CardSVG"
import WalletConnect from "@/components/WalletConnect"
import { getOwnedTokens } from "@/lib/utils"
import { Refresh } from "@/components/Refresh"

export default function Gallery() {

    const [connected, setConnected] = useState(false)
    const [address, setAddress] = useState('')
    const [view, setView] = useState('All Buildings') // State to manage the selected view
    const [filteredBuildings, setFilteredBuildings] = useState<NFT[]>([])
    const [ownedTokens, setOwnedTokens] = useState<any[] | "Error" | null>(null) // State to store owned tokens

    const handleWalletConnect = (isConnected: boolean, walletAddress: string) => {
        setConnected(isConnected)
        setAddress(walletAddress)
    }

    const fetchOwnedTokens = async () => {
        try {
            const tokens = await getOwnedTokens(address as `0x${string}`)
            setOwnedTokens(tokens)
            return tokens
        } catch (error) {
            console.error('Error getting owned tokens:', error)
            return "Error"
        }
    }

    const filterBuildings = async (tokens: any[] | "Error") => {
        if (tokens === "Error") {
            setFilteredBuildings([])
            return
        }

        if (Array.isArray(tokens)) {
            const ownedContractAddresses = new Set(
                tokens.map((token: any) => token.contractAddress.toLowerCase())
            )
            console.log(ownedContractAddresses)

            const filtered = buildings.filter((building: any) => {
                return ownedContractAddresses.has(building.address?.toLowerCase())
            })

            setFilteredBuildings(filtered as NFT[])
            console.log(filtered)
        } else {
            setFilteredBuildings([])
        }
    }

    useEffect(() => {
        const handleFilter = async () => {
            if (view === 'My Buildings' && address) {
                if (ownedTokens === null) {
                    const tokens = await fetchOwnedTokens()
                    filterBuildings(tokens)
                } else {
                    filterBuildings(ownedTokens)
                }
            } else {
                setFilteredBuildings(buildings as NFT[])
            }
        }

        handleFilter()
    }, [view, address])

    const handleRefresh = async () => {
        const tokens = await fetchOwnedTokens()
        filterBuildings(tokens)
    }

    return (
        <section className="w-11/12 lg:w-1/2 mx-auto">

            <WalletConnect onConnect={handleWalletConnect} />

            <div className="flex px-20 justify-center items-center">
                filter & sort will be here
            </div>

            {connected && (
                <div className="flex justify-start items-center mt-4 gap-x-5">
                    <button
                        className={`btn ${view === 'All Buildings' ? 'btn-active' : 'bg-transparent border border-black text-black'}`}
                        onClick={() => setView('All Buildings')}
                    >
                        All Buildings
                    </button>
                    <button
                        className={`btn ${view === 'My Buildings' ? 'btn-active' : 'bg-transparent border border-black text-black'}`}
                        onClick={() => setView('My Buildings')}
                    >
                        My Buildings
                    </button>
                    { view === 'My Buildings' &&

                        <Refresh
                            onRefresh={handleRefresh}
                            onComplete={() => console.log('Refresh complete')}
                            label="Refresh my buildings"
                        />

                    }
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 lg:gap-x-12 lg:gap-y-5 lg:pt-7 lg:max-w-90 lg:mx-auto mb-5 lg:mb-20">
                {
                    (filteredBuildings as NFT[]).slice(0, 60).map((nft) => (
                        <div className="" key={nft.metadata.name}>
                            <div className="flex items-end justify-center h-20">
                                <h2 className={`m-0 text-center text-base leading-0`}>{nft.metadata.name}</h2>
                            </div>
                            <div className="relative w-full overflow-hidden">
                                <CardSVG
                                    colour={nft.building_color}
                                    imageUrl={nft.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)}
                                    country={nft.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value || ''}
                                    city={nft.metadata.attributes.find(attr => attr.trait_type == 'City')?.value || ''}
                                    name={nft.metadata.name}
                                    price="XXX ETH"
                                    minted="XXX"
                                    liquidity="XXX ETH"
                                    holders="XXX"
                                />
                            </div>
                            <div className="mt-2 flex justify-center">
                                <button className="text-xs btn">TRADE</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </section>
    )
}
