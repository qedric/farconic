import { mintclub } from 'mint.club-v2-sdk'
import mc_building_abi from '@/data/mc_building_abi.json'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'
import { baseSepolia, base } from "viem/chains"
import { ethers } from 'ethers'
import { FramesMiddleware } from "frames.js/types"
import { getMintClubContractAddress } from 'mint.club-v2-sdk'

const chainString = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? 'base' : 'basesepolia'
const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia
const buildings = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? mainnet_buildings : testnet_buildings

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
    "Cloud Gate"
]

const favBuildingNames = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? favBuildingNames_mainnet : favBuildingNames_testnet

const publicClient = mintclub.network(chainString).getPublicClient()

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

export const fetchImageUrlFromTokenId = async (id: number, abi: any) => {
    const ipfs_link: string = await publicClient.readContract({
        address: `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string}`,
        abi: (abi.filter((item: any) => item.name === "uri") as any),
        functionName: 'uri',
        args: [id]
    }) as string
    return fetchImageUrlFromIPFS(ipfs_link)
}

export const getOpenseaData = async (address: string) => {

    const url = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET'
        ? `https://api.opensea.io/api/v2/chain/base/contract/${address}/nfts/${0}`
        : `https://testnets-api.opensea.io/api/v2/chain/base_sepolia/contract/${address}/nfts/${0}`

    try {
        const options = {
            method: 'GET',
            headers: { 'accept': 'application/json', 'x-api-key': process.env.OPENSEA_API_KEY }
        }

        let response: any
        await fetch(url, (options as any))
            .then(r => r.json())
            .then(json => response = json)
            .catch(err => console.error(err))

        return response.nft

    } catch (error) {
        console.error('Error fetching token supply:', error)
        return 'Error'
    }
}

export const formatWeiToETH = (wei: bigint) => `${Math.round(parseFloat(ethers.formatEther(wei))*1e6) / 1e6} ETH`

export const abbreviateAddress = (address: string) => `${address.substring(0, 5)}...${address.substring(address.length - 4)}`

export const getDetail = async (address: string) => await mintclub.network(chainString).token(address).getDetail()

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

export const getIsApproved = async (target:`0x${string}`, address:`0x${string}`):Promise<boolean> => mintclub.network(chainString).nft(target).getIsApprovedForAll({
    owner: (address),
    spender: getMintClubContractAddress('ZAP', chain.id)
})

export const approveForSelling = async (target:`0x${string}`, spender:`0x${string}`) => await mintclub
    .network(chainString)
    .nft(target)
    .approve({
        approved: true,
        spender
})

export const mintBuilding = async (target:`0x${string}`, qty:bigint) => await mintclub.network(chainString).nft(target).buy({
    amount: qty
})

export const burnBuilding = async (target:`0x${string}`, qty:bigint) => await mintclub.network(chainString).nft(target).sell({
    amount: qty
})

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

export const estimatePrice = async (buildingAddress: `0x${string}`, qty: bigint, isSell: boolean) => {

    const details = await mintclub.network(chainString).token(buildingAddress).getDetail()
    if (qty > details.info.maxSupply - details.info.currentSupply) {
        qty = details.info.maxSupply - details.info.currentSupply
    }

    if (isSell && qty > details.info.currentSupply) {
        qty = details.info.currentSupply
    }

    const [priceEstimate, royalty] = isSell
        ? await mintclub
            .network(chainString)
            .token(buildingAddress)
            .getSellEstimation(qty)
        : await mintclub
            .network(chainString)
            .token(buildingAddress)
            .getBuyEstimation(qty)
    console.log(`Estimate for ${qty} of ${buildingAddress}: ${ethers.formatUnits(priceEstimate, 18)} ETH`)
    console.log('Royalties paid:', ethers.formatUnits(royalty.toString(), 18).toString())

    return { priceEstimate, qty }
}

export const estimatePriceMiddleware: FramesMiddleware<any, { priceEstimate: bigint, qty: bigint, isSell: boolean, details: object }> = async (
    ctx: any,
    next
) => {
    if (!ctx.message) {
        throw new Error("No message")
    }

    if (!ctx.searchParams.building) {
        throw new Error("No building in searchParams")
    }

    const building: NFT = JSON.parse(ctx.searchParams.building)
    const details = await mintclub.network(chainString).token(building.address).getDetail()

    let qty: bigint = BigInt(1)
    if (ctx.message.inputText) {
        try {
            const inputQty = BigInt(ctx.message.inputText)
            if (inputQty <= details.info.maxSupply - details.info.currentSupply) {
                qty = inputQty
            } else {
                qty = details.info.maxSupply - details.info.currentSupply
            }
        } catch (error) {
            // qty stays as 1, carry on
        }
    } else if (ctx.searchParams.qty) {
        try {
            const inputQty = BigInt(ctx.searchParams.qty)
            if (inputQty <= details.info.maxSupply - details.info.currentSupply) {
                qty = inputQty
            } else {
                qty = details.info.maxSupply - details.info.currentSupply
            }
        } catch (error) {
            // qty stays as 1, carry on
        }
    }

    const isSell: boolean = ctx.searchParams.isSell === 'true'
    if (isSell && qty > details.info.currentSupply) {
        qty = details.info.currentSupply
    }

    //console.log('estimating price for', qty, building.metadata.name, building.address)

    const [estimation, royalty] = isSell
        ? await mintclub
            .network(chainString)
            .token(building.address)
            .getSellEstimation(qty)
        : await mintclub
            .network(chainString)
            .token(building.address)
            .getBuyEstimation(qty)
    console.log(`Estimate for ${qty} ${building.metadata.name}: ${ethers.formatUnits(estimation, 18)} ETH`)
    console.log('Royalties paid:', ethers.formatUnits(royalty.toString(), 18).toString())

    return next({ priceEstimate: estimation, qty, isSell, details })

}