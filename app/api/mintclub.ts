import dotenv from "dotenv"
import { FramesMiddleware } from "frames.js/types"
import { NFT } from '@/lib/utils'
import { createPublicClient, createWalletClient, http, custom } from 'viem'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { base, baseSepolia } from 'viem/chains'
import { mintclub, getMintClubContractAddress } from 'mint.club-v2-sdk'
import { ethers } from 'ethers'
import zap_abi from '@/data/zap_abi.json'
import building_abi from '@/data/mc_building_abi.json'
dotenv.config()

const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia
const chainString = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? 'base' : 'basesepolia'
const zap_contract_address = getMintClubContractAddress('ZAP', chain.id)

const SLIPPAGE_PERCENT = 1

const publicClient = createPublicClient({
  chain: chain,
  transport: http()
})

export const connectWalletClient = async () => {
  let transport
  if (window.ethereum) {
    transport = custom(window.ethereum)
  } else {
    const provider = await EthereumProvider.init({
      optionalChains: [baseSepolia.id, base.id],
      projectId: 'ab12d338ce41e49b370095950d6f9213',
      metadata: {
        name: 'farconic',
        description: 'Collect buildings and claim cities!',
        url: 'https://farconic.xyz', // origin must match your domain & subdomain
        icons: ['/farconic_logo.png']
      },
      showQrModal: true
    })

    // try walletConnect
    transport = custom(provider)
    await provider.connect()
  }

  if (!transport) {
    throw new Error('MetaMask or another web3 wallet is not installed.')
  }

  const walletClient = createWalletClient({
    chain: chain,
    transport: transport,
  })

  walletClient.switchChain(chain)

  return walletClient
}

export const tradeBuilding = async (client:any, address:`0x${string}`, buidingAddress:`0x${string}`, qty:bigint, isSell:boolean) => {

  const estimated = await estimatePrice(buidingAddress, qty, isSell)

  const slippageOutcome: bigint = isSell
    ? estimated.priceEstimate - (estimated.priceEstimate * BigInt(SLIPPAGE_PERCENT * 100)) / BigInt(10_000)
    : estimated.priceEstimate + (estimated.priceEstimate * BigInt(SLIPPAGE_PERCENT * 100)) / BigInt(10_000)

  const args = isSell ? [buidingAddress, qty, slippageOutcome, address] : [buidingAddress, qty, address]

  //console.log('slippageOutcome', slippageOutcome)
  //console.log('args', args)

  const { request } = await publicClient.simulateContract({
    account: address,
    address: zap_contract_address,
    abi: zap_abi,
    functionName: isSell ? 'burnToEth' : 'mintWithEth',
    args,
    value: isSell ? BigInt(0) : slippageOutcome
  })

  return (await client.writeContract(request))
}

export const getIsApproved = async (target: `0x${string}`, address: `0x${string}`): Promise<boolean> => mintclub.network(chainString).nft(target).getIsApprovedForAll({
  owner: (address),
  spender: zap_contract_address
})

export const approveForSelling = async (client:any, address:`0x${string}`, buidingAddress:`0x${string}`) => {

  const { request } = await publicClient.simulateContract({
    account: address,
    address: buidingAddress,
    abi: building_abi,
    functionName: 'setApprovalForAll',
    args: [zap_contract_address, true],
    value: BigInt(0)
  })

  return (await client.writeContract(request))

}

export const getDetail = async (address: string) => await mintclub.network(chainString).token(address).getDetail()

export const estimatePrice = async (buildingAddress: `0x${string}`, qty: bigint, isSell: boolean) => {

  const details = await getDetail(buildingAddress)
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