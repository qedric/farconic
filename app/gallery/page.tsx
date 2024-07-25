'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'
import CardSVG from "@/components/CardSVG"
import { NFT } from "@/lib/utils"
import { getOwnedTokens } from '@/app/api/alchemy'
import { Refresh } from "@/components/Refresh"
import ReactDOM from 'react-dom'
import { connectWalletClient } from '@/app/api/mintclub'

const buildings = process.env.NEXT_PUBLIC_CHAIN == 'MAINNET' ? mainnet_buildings : testnet_buildings

export default function Gallery() {
    const [address, setAddress] = useState<string | null>(null)
    const [view, setView] = useState('All Buildings') // State to manage the selected view
    const [filteredBuildings, setFilteredBuildings] = useState<NFT[]>([])
    const [ownedTokens, setOwnedTokens] = useState<any[] | "Error" | null>(null) // State to store owned tokens
    const [isLoading, setIsLoading] = useState(false) // State for loading spinner

    const fetchOwnedTokensAndFilter = async (walletAddress: string) => {
        setIsLoading(true) // Start loading spinner
        setFilteredBuildings([]) // Clear filtered buildings while loading
        try {
            const tokens = await getOwnedTokens(walletAddress as `0x${string}`)
            setOwnedTokens(tokens)
            filterBuildings(tokens)
        } catch (error) {
            console.error('Error getting owned tokens:', error)
            setOwnedTokens('Error')
        } finally {
            setIsLoading(false) // Stop loading spinner
        }
    }

    const filterBuildings = (tokens: any[] | "Error") => {
        if (tokens === "Error") {
            setFilteredBuildings([])
            return
        }

        const ownedContractAddresses = new Set(
            tokens.map((token: any) => token.contractAddress.toLowerCase())
        )

        const filtered = buildings.filter((building: any) => {
            return ownedContractAddresses.has(building.address?.toLowerCase())
        })

        setFilteredBuildings(filtered as NFT[])
    }

    useEffect(() => {
        if (view === 'My Buildings' && address) {
            if (!ownedTokens) {
                fetchOwnedTokensAndFilter(address)
            } else {
                filterBuildings(ownedTokens)
            }
        } else {
            setFilteredBuildings(buildings as NFT[])
        }
    }, [view, address]) // Dependency array includes view and address

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

    const handleRefresh = async () => {
        if (view === 'My Buildings' && address) {
            await fetchOwnedTokensAndFilter(address)
        }
    }

    ReactDOM.preload('/CardBG.jpeg', {
        as: 'image',
        fetchPriority: 'high',
    })

    return (
        <section className="w-full">
            {
                address 
                    ? (
                        <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4">
                            <button
                                className={`btn basis-3/4 lg:basis-1/4 ${view === 'All Buildings' ? 'btn-active' : 'bg-transparent border border-black text-black'}`}
                                onClick={() => setView('All Buildings')}
                            >
                                All Buildings
                            </button>
                            <button
                                className={`btn basis-1/2 lg:basis-1/4 ${view === 'My Buildings' ? 'btn-active' : 'bg-transparent border border-black text-black'}`}
                                onClick={() => setView('My Buildings')}
                            >
                                My Cards
                            </button>
                            <Refresh
                                onRefresh={handleRefresh}
                                onComplete={() => console.log('Refresh complete')}
                                isLoading={isLoading}
                                isDisabled={view !== 'My Buildings'}
                                label="Refresh my Cards"
                            />
                        </div>
                    )
                    : (
                        <div className="w-full flex justify-center mt-4">
                            <button onClick={connectWallet} className="btn text-xs lg:text-2xl">Connect Wallet</button>
                        </div>
                    )
            }
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 lg:gap-x-12 lg:gap-y-5 lg:pt-7 lg:mx-auto mb-5 lg:mb-20">
                {
                    filteredBuildings.slice(0, 60).map((nft: NFT) => (
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
                            <Link className="flex mx-auto w-fit" href={`/${nft.metadata.name.replace(/\s/g, '-').toLowerCase()}`}>
                                <p className="text-xs btn">TRADE</p>
                            </Link>
                        </div>
                    ))
                }
            </div>
        </section>
    )
}