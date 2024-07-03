/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getRaffleFromDb } from '@/lib/db'
import { getBuildingById } from '@/lib/utils'

const handleRequest = frames(async (ctx:any) => {

    if (!ctx.message.isValid) {
        throw new Error("Invalid Frame")
    }

    const { raffle } = await getRaffleFromDb(ctx.searchParams.raffleName)

    if (!raffle) {
        throw new Error("Raffle not found")
    }

    // check if fid has already claimed
    console.log('raffle:', raffle)
    const claims = raffle.claimed?.find(entry => entry.fid === ctx.message.requesterFid)?.claims || []
    const limit = process.env.RAFFLE_CLAIM_LIMIT !== undefined ? Number(process.env.RAFFLE_CLAIM_LIMIT) : 1

    console.log('claims:', claims, 'limit:', limit)
    if (claims.length >= limit) {
        return {
            image: (
                <div tw="w-full h-full flex flex-col items-center justify-center p-5 bg-[#EBE7DE]">
                    <h1 tw="text-4xl">🎉 Raffle 🎉</h1>
                    <p tw="text-3xl px-12 text-center">You have already claimed your prize! Stay tuned to /farconic for more opportunities to enter raffles!</p>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1.91:1"
            },
            buttons: [
                <Button action="link" target={process.env.NEXT_PUBLIC_APP_LINK as string}>
                    App 🌐
                </Button>
            ]
        }
    }

    // check if winning fids contains our user's fid
    if (raffle.winnerFids.includes(ctx.message.requesterFid)) {

        const address = ctx.message.requesterVerifiedAddresses?.length > 0
            ? ctx.message.requesterVerifiedAddresses[0]
            : ctx.message.requesterCustodyAddress

        return {
            image: (
                <div tw="w-full h-full flex flex-col items-center justify-center p-5 bg-[#EBE7DE]">
                    <h1 tw="text-4xl">🎉 Raffle 🎉</h1>
                    <p tw="text-3xl px-12 text-center">"You&quot;ve Won! Press the &quot;Claim&quot; button below to get your prize."</p>
                    <h2 tw="text-3xl mt-5">Your prize will be delivered to your farcaster verfied address:</h2>
                    <p tw="text-3xl px-12 text-center">{ address }</p>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1.91:1"
            },
            buttons: [
                <Button action="post" target={{ query: { to: address, buildingAddress: getBuildingById(raffle.buildingId).address, raffleName: raffle.name }, pathname: '/raffle/claimed' }}>
                    Claim 🎉
                </Button>
            ]
        }
    } else {
        return {
            image: (
                <div tw="w-full h-full flex flex-col items-center justify-center p-5 bg-[#EBE7DE]">
                    <h1 tw="text-4xl">🎉 Raffle 🎉</h1>
                    <p tw="text-3xl px-12 text-center">Better luck next time! Stay tuned to /farconic for more opportunities to enter raffles!</p>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1.91:1"
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