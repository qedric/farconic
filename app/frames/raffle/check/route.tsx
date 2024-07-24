/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getRaffleFromDb } from '@/app/api/mongodb'
import { getTxReceiptFromSyndicateId } from '@/app/api/syndicate'
import { getBuildingById } from '@/lib/utils'

const handleRequest = frames(async (ctx:any) => {

    // frame verification causing error in prod
    /* if (!ctx.message.isValid) {
        throw new Error("Invalid Frame")
    } */

    const raffle = await getRaffleFromDb(ctx.searchParams.name)

    if (!raffle) {
        throw new Error("Raffle not found")
    }

    // check if fid has already claimed
    //console.log('raffle:', raffle)
    const claims = raffle.claimed?.find(entry => entry.fid === ctx.message.requesterFid)?.claims || []
    const limit = process.env.RAFFLE_CLAIM_LIMIT !== undefined ? Number(process.env.RAFFLE_CLAIM_LIMIT) : 1
    console.log('claims:', claims, 'limit:', limit)

    if (claims.length >= limit) {
        
        // check the txIds to see if the claims were successful
        let successfulClaims = 0
        await Promise.all(claims.map(async claim => {
            const txReceipt = await getTxReceiptFromSyndicateId(claim)
            console.log('txReceipt', txReceipt)
            if (txReceipt?.status == 'success') {
                successfulClaims++
            }
        }))

        //console.log('successfulClaims:', successfulClaims)

        if (successfulClaims >= limit) {
            return {
                image: (
                    <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                        <div tw="flex flex-col absolute px-20 justify-center items-center">
                            <h1 tw="text-[50px] mb-5 leading-6">You have already claimed your prize!</h1>
                            <p tw="text-3xl px-12 text-center">Stay tuned to /farconic for more opportunities to enter raffles!</p>
                        </div>
                    </div>
                ),
                imageOptions: {
                    aspectRatio: "1:1"
                },
                buttons: [
                    <Button action="link" target={process.env.NEXT_PUBLIC_APP_LINK as string}>
                        App 🌐
                    </Button>
                ]
            }
        }
    }

    // check if winning fids contains our user's fid
    if (raffle.winnerFids.includes(ctx.message.requesterFid)) {

        const address = ctx.message.requesterVerifiedAddresses?.length > 0
            ? ctx.message.requesterVerifiedAddresses[0]
            : ctx.message.requesterCustodyAddress

        return {
            image: raffle.wonImage
                ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/${raffle.wonImage}`
                : (
                    <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                        <div tw="flex flex-col absolute px-20 justify-center items-center">
                            <h1 tw="text-[50px] mb-5 leading-6">You&apos;ve Won!</h1>
                            <h2 tw="text-4xl my-5">Press the &quot;Claim&quot; button below to get your prize!</h2>
                            <p tw="text-3xl mt-5">Your prize will be delivered to your Farcaster verfied address:</p>
                            <p tw="text-3xl">{ address }</p>
                        </div>
                    </div>
                ),
            imageOptions: {
                aspectRatio: "1:1"
            },
            buttons: [
                <Button action="post" target={{ query: { to: address, buildingAddress: getBuildingById(raffle.buildingId.toString()).address, name: raffle.name }, pathname: '/raffle/claimed' }}>
                    Claim 🎉
                </Button>
            ]
        }
    } else {
        return {
            image: raffle.lostImage
            ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/${raffle.lostImage}`
            : (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="w-full flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-center text-[50px] mb-5 mx-auto">Unfortunately you didn&apos;t win this time.</h1>
                        <p tw="w-4/5 text-center text-[30px]"> But don&apos;t worry! We&apos;re hosting regular raffles of Farconic cards, so keep trying your luck!</p>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1"
            },
            buttons: [
                <Button action="link" target={process.env.NEXT_PUBLIC_APP_LINK as string}>
                    App 🌐
                </Button>
            ]
        }
    }

})

export const GET = handleRequest
export const POST = handleRequest