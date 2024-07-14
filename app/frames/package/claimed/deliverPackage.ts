import { types } from "frames.js/next"
import { getBuildingById } from '@/lib/utils'
import { encodeFunctionData, Address, Hex } from 'viem'
import { sendTransactions } from '@/app/api/safe'
import abi from '@/data/mc_building_abi.json'

export const claim: types.FramesMiddleware<any, { txId: string }> = async (
    ctx: any,
    next
) => {

    if (ctx.searchParams.txId) {
        return next({ txId: ctx.searchParams.txId })
    }

    const custodyAddress = process.env.SAFE_TARGET
    if (!custodyAddress) {
        throw new Error("No Custody Address")
    }

    const toAddress = ctx.searchParams?.to
    if (!toAddress) {
        throw new Error("No User Address")
    }

    const buildingIds = ctx.searchParams.buildingIds
    if (!buildingIds) {
        throw new Error("No Building Ids")
    }

    let txId: string | undefined

    const transactions: {
        to: Address;
        value: bigint;
        data: Hex;
    }[] = []

    for (const buildingId of JSON.parse(buildingIds)) {

        const building = getBuildingById(buildingId)

        if (!building) {
            throw new Error("Building not found")
        }

        const args = [`${process.env.SAFE_TARGET}`, toAddress, BigInt(0), BigInt(1), '0x0'] 

        transactions.push({
            to: building.address,
            data: encodeFunctionData({
                abi,
                functionName: 'safeTransferFrom',
                args
            }),
            value: BigInt(0)
        })
    }

    txId = await sendTransactions(transactions)

    return next({ txId: txId || '' })
}