import mc_building_abi from '@/data/mc_building_abi.json'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'
import { createPublicClient, http } from 'viem'
import { baseSepolia, base } from "viem/chains"
import { ethers } from 'ethers'

const chainString = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? 'base' : 'basesepolia'
const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia
const buildings = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? mainnet_buildings : testnet_buildings

const publicClient = createPublicClient({
    chain: chain,
    transport: http()
})

const favBuildingNames_testnet: string[] = [
    "Eiffel Tower",
    "Burj Khalifa",
    "Statue of Liberty",
    "Big Ben",
    "Arc de Triomphe",
    "Chrysler Building",
    "Hagia Sophia",
    "Empire State Building",
    "Christ the Redeemer",
    "Tower Bridge",
    "Golden Gate Bridge",
    "Funkturm Berlin"
]

const favBuildingNames_mainnet: string[] = [
    "Statue of Liberty",
    "Stedelijk Museum",
    "Obelisco de Buenos Aires",
    "CN Tower",
    "Philadelphia City Hall",
    "July Column",
    "Columbia Center",
    "Bank of China Tower"
]

const favBuildingNames = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? favBuildingNames_mainnet : favBuildingNames_testnet

const levenshteinDistance = (a: string, b: string): number => {
    const dp: number[][] = []

    for (let i = 0; i <= a.length; i++) {
        dp[i] = []
        for (let j = 0; j <= b.length; j++) {
            if (i === 0) {
                dp[i][j] = j
            } else if (j === 0) {
                dp[i][j] = i
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0),
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1
                )
            }
        }
    }
    return dp[a.length][b.length]
}

export interface Metadata {
    name: string
    description: string
    image: string
    external_url: string
    background_color: string
    attributes: Attribute[]
}

export interface Attribute {
    trait_type?: string
    value: string
}

export interface NFT {
    metadata: Metadata
    id: string
    tokenURI: string
    building_color: string
    address: `0x${string}`
}

export const getTransactionReceipt = async (txId: `0x${string}`) => await publicClient.waitForTransactionReceipt({ hash: txId, pollingInterval: 500, retryCount: 8 })

export const fetchImageUrlFromIPFS = async (ipfs_link: string) => {
    // get the image value from the metadata resolved by the ipfs link
    //console.log(ipfs_link)
    const metadata = await fetch(ipfs_link.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) as string)
    const json = await metadata.json()
    //console.log(json)
    return json.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)
}

export const formatWeiToETH = (wei: bigint, showUnit: boolean = true) => {
    if (Number.isNaN(Number(wei))) {
        return showUnit ? '0 ETH' : '0'
    }
    return `${Math.round(parseFloat(ethers.formatEther(wei)) * 1e6) / 1e6}${showUnit ? ' ETH' : ''}`
}

export const abbreviateAddress = (address: string) => `${address.substring(0, 5)}...${address.substring(address.length - 4)}`

export const searchJsonArray = (query: string): NFT[] => {
    const lowerCaseQuery = query.toLowerCase()
    const matchingElements: NFT[] = []

    // skip search & return a random element from the buildings array
    if (query == 'random') {
        return (new Array(buildings[Math.floor(Math.random() * buildings.length)]) as NFT[])
    }

    for (const element of buildings as NFT[]) {
        const metadataValues = Object.values(element.metadata)
            .filter(value => typeof value === 'string')
            .map(value => (value as string).toLowerCase())

        let found = false // Flag to indicate if the element has been found
        for (const value of metadataValues) {
            if (value.includes(lowerCaseQuery) || levenshteinDistance(value, lowerCaseQuery) <= 2) {
                if (!found) {
                    matchingElements.push(element)
                    found = true // Set found flag to true
                }
                break // Stop checking metadata values for this element once a match is found
            }
        }

        for (const attribute of element.metadata.attributes) {
            if (typeof attribute.value === 'string' &&
                (attribute.value.toLowerCase().includes(lowerCaseQuery) ||
                    levenshteinDistance(attribute.value.toLowerCase(), lowerCaseQuery) <= 2)) {
                if (!found) {
                    matchingElements.push(element)
                    found = true // Set found flag to true
                }
                break // Stop checking attributes for this element once a match is found
            }
        }
    }

    return matchingElements
}

export const getTokenBalanceByAddress = async (tokenAddress: `0x${string}`, accountAddress: `0x${string}`) => await publicClient.readContract({
    address: tokenAddress,
    abi: mc_building_abi,
    functionName: 'balanceOf',
    args: [accountAddress, 0]
})

export const getTokenBalancesForAddresses = async (tokenAddress: `0x${string}`, accountAddresses: `0x${string}`[]) => {

    let balances: { address: string, balance: string }[] = []
    let totalBalance: number = 0

    for (const address of accountAddresses) {
        let addressBalance = BigInt(0)
        try {
            addressBalance = await getTokenBalanceByAddress(tokenAddress as `0x${string}`, address as `0x${string}`) as bigint
            if (addressBalance > BigInt(0)) {
                totalBalance += Number(addressBalance)
                balances.push({ address, balance: addressBalance.toString() })
            }
        } catch (e) {
            // do nothing
        }
    }

    return { balances, totalBalance }
}

export const getRandomBuildingAmongFavourites = (excludeName?: string): NFT => {
    // Remove the excluded name from the favorite building names array
    const filteredBuildingNames = excludeName ? favBuildingNames.filter(name => name !== excludeName) : favBuildingNames

    // get a random name from the filteredBuildingNames array and find the matching building
    const buildingName = filteredBuildingNames[Math.floor(Math.random() * filteredBuildingNames.length)]
    return buildings.find((b) => b.metadata.name === buildingName) as NFT
}

export const getFavouriteBuildings = () => buildings.filter((b) => favBuildingNames.includes(b.metadata.name)) as NFT[]

export const getBuildingByName = (name: string) => buildings.find((b) => b.metadata.name.toLowerCase() === name.toLowerCase()) as NFT

export const getBuildingById = (id: string) => buildings.find((b) => b.id === id) as NFT

export const getBuildingByAddress = (address: string) => buildings.find((b) => b.address?.toLowerCase() === address.toLowerCase()) as NFT

export const removeThe = (name:string) => name.toLowerCase().startsWith('the') ? name.substring(4) : name
export const addThe = (name:string) => name.toLowerCase().startsWith('the') ? name : `the ${name}`