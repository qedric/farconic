import { types } from "frames.js/next"
import { getBuildingById } from '@/lib/utils'
import { baseSepolia, base } from "viem/chains"

const chainId = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? base.id : baseSepolia.id

export const claim: types.FramesMiddleware<any, { name:string, txIds:string }> = async (
    ctx: any,
    next
) => {

    if (ctx.searchParams.txIds) {
        return next({ name: ctx.searchParams.name, txIds: ctx.searchParams.txIds })
    }

    const custodyAddress = process.env.RAFFLE_PRIZE_CUSTODY_ADDRESS
    if (!custodyAddress) {
        throw new Error("No Custody Address")
    }

    const toAddress = ctx.searchParams?.to
    if (!toAddress) {
        throw new Error("No User Address")
    }

    const buildingIds:string = ctx.searchParams.buildingIds
    if (!buildingIds) {
        throw new Error("No Building Ids")
    }

    const fSig = `safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)`
    
    const fetchAllTransactions = async (buildingIds:string, custodyAddress:string, toAddress:string, chainId:number, fSig:string) => {
        const txIds:string[] = []
        const fetchPromises = []
    
        for (const buildingId of JSON.parse(buildingIds)) {
            const building = getBuildingById(buildingId)
    
            if (!building) {
                throw new Error("Building not found")
            }
    
            try {
                const args = `{"from": "${custodyAddress}", "to": "${toAddress}", "id": "0", "value": "1", "data": "0x00"}`
                const options = {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: `{"projectId":"${process.env.SYNDICATE_PROJECT_ID}","contractAddress":"${building.address}","chainId":${chainId},"functionSignature":"${fSig}","args":${args}}`
                }
    
                const fetchPromise = fetch('https://api.syndicate.io/transact/sendTransaction', options)
                    .then(response => response.json())
                    .then(responseData => {
                        txIds.push(responseData.transactionId ? responseData.transactionId : '')
                    })
                    .catch(err => {
                        console.error(err)
                    })
    
                fetchPromises.push(fetchPromise)
            } catch (err) {
                console.error(err)
            }
        }
    
        await Promise.all(fetchPromises)
        return txIds
    }

    const txIds = await fetchAllTransactions(buildingIds, custodyAddress, toAddress, chainId, fSig)

    return next({ name: ctx.searchParams.name, txIds: JSON.stringify(txIds) })
}