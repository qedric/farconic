'use server'
import { Network, Alchemy } from 'alchemy-sdk'
import buildings from '@/data/buildings.json'

// Alchemy Config object
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: Network.BASE_SEPOLIA, // Replace with your network.
}

export const getOwnedTokens = async (accountAddress: `0x${string}`) => {
    const batchSize = 45 // maximum number of results allowed by alchemy
    const batches: `0x${string}`[][] = []

    // Create batches of contract addresses directly from the buildings array
    for (let i = 0; i < buildings.length; i += batchSize) {
        batches.push(buildings.slice(i, i + batchSize).map(building => building.address as `0x${string}`))
    }

    const alchemy = new Alchemy(settings)
    const options = {
        omitMetadata: true,
        contractAddresses: [] as `0x${string}`[]
    }

    const ownedNfts: any[] = []

    try {
        for (const batch of batches) {
            options.contractAddresses = batch
            const response = await alchemy.nft.getNftsForOwner(accountAddress, options)
            ownedNfts.push(...response.ownedNfts)
        }
        //console.log('Owned NFTs:', ownedNfts)
        return ownedNfts
    } catch (error) {
        console.error('Error fetching owned tokens:', error)
        return 'Error'
    }
}