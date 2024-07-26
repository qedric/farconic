'use server'
import { Network, Alchemy } from 'alchemy-sdk'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'

const buildings = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? mainnet_buildings : testnet_buildings

// Alchemy Config object
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
    network: process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? Network.BASE_MAINNET : Network.BASE_SEPOLIA,
}

// returns list of accounts holding this token
export const getOwnersOfToken = async (tokenAddress: `0x${string}`) => {
    const alchemy = new Alchemy(settings)

    //Call the method to fetch the owners for the collection
    const response = await alchemy.nft.getOwnersForNft(tokenAddress, '0')

    //Logging the response to the console
    //console.log('getOwnersOfToken response:', response)
    return response.owners
}

// returns list of building tokens owned by the account
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