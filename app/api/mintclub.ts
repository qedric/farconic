import { mintclub } from 'mint.club-v2-sdk'
import dotenv from "dotenv"
import { ethers } from 'ethers'
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import zapabi from '@/data/zap_abi.json'
dotenv.config()

const chainString = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? 'base' : 'basesepolia'
const chain = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base : baseSepolia

const SLIPPAGE_PERCENT = 1

const publicClient = createPublicClient({
  chain: chain,
  transport: http()
})

const estimate = async (token:`0x${string}`, amount:bigint) => {
    const [estimation, royalty] = await mintclub
      .network(chainString)
      .token(token)
      .getBuyEstimation(amount)
    console.log(`Estimated cost for ${amount}: ${ethers.formatUnits(estimation, 18)} ETH`)
    console.log('Royalties paid:', ethers.formatUnits(royalty.toString(), 18).toString())
    return estimation
}

// 🚀 Deploying tokens
export const mintBuildings = async (client:any, address:`0x${string}`, buidingAddress:`0x${string}`, qty:bigint) => {

  const estimated = await estimate(buidingAddress, qty)

  const slippageOutcome =
    estimated + (estimated * BigInt(SLIPPAGE_PERCENT * 100)) / BigInt(10_000)

  const { request } = await publicClient.simulateContract({
    account: address,
    address: (process.env.NEXT_PUBLIC_ZAP_CONTRACT as `0x${string}`),
    abi: zapabi,
    functionName: 'mintWithEth',
    args: [buidingAddress, qty, address],
    value: slippageOutcome
  })
  await client.writeContract(request)
}