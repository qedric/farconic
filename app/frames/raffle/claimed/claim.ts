import { types } from "frames.js/next"
import { baseSepolia } from "viem/chains"

export const claim: types.FramesMiddleware<any, { raffleName:string, txId: string }> = async (
    ctx: any,
    next
) => {

    if (ctx.searchParams.txId) {
        return next({ raffleName: ctx.searchParams.raffleName, txId: ctx.searchParams.txId })
    }

    const custodyAddress = process.env.RAFFLE_PRIZE_CUSTODY_ADDRESS
    if (!custodyAddress) {
        throw new Error("No Prize Custody Address")
    }

    const toAddress = ctx.searchParams?.to
    if (!toAddress) {
        throw new Error("No User Address")
    }

    const buildingAddress = ctx.searchParams.buildingAddress
    if (!buildingAddress) {
        throw new Error("No Prize Address")
    }

    let txId: string | undefined

    try {
        const fSig = `safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)`
        const args = `{"from": "${custodyAddress}", "to": "${toAddress}", "id": "0", "value": "1", "data": "0x00"}`
        // prep the transaction
        let options = {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`,
            'Content-Type': 'application/json'
            },
            body: `{"projectId":"${process.env.SYNDICATE_PROJECT_ID}","contractAddress":"${buildingAddress}","chainId":${baseSepolia.id},"functionSignature":"${fSig}","args":${args}}`
        }

        const response = await fetch('https://api.syndicate.io/transact/sendTransaction', options)
        const responseData = await response.json()

        txId = responseData.transactionId ? responseData.transactionId : ''

    } catch (err) {
        console.error(err)
    }

    console.log('raffleName:', ctx.searchParams.raffleName)

    return next({ raffleName: ctx.searchParams.raffleName, txId: txId || '' })
}