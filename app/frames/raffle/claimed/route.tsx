/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text, react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getUserDataForFid } from 'frames.js'
import { decodeEventLog, Abi } from 'viem'
import { getBuildingByAddress, type NFT, addThe } from '@/lib/utils'
import { getTxReceiptFromSyndicateId } from '@/app/api/syndicate'
import { claim } from './claim'
import { CardImage } from '@/components/FrameCard'
import abi from '@/data/mc_building_abi.json'

const handleRequest = frames(async (ctx: any) => {

    const txId = ctx.txId || ''

    if (!txId) {
        return {
            image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Can&apos;t find a transaction</h1>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/raffle/" }}>
                    reset
                </Button>
            ]
        }
    }

    const txReceipt = await getTxReceiptFromSyndicateId(txId)
    //console.log('txReceipt:', txReceipt)

    if (txReceipt === 'pending') {
        return {
            image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Transaction Pending</h1>
                        <p tw="text-[30px] leading-6">Wait a moment then hit refresh</p>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1"
            },
            buttons: [
                <Button action="post" target={{ query: { txId: txId, name: ctx.searchParams.name }, pathname: "/raffle/claimed" }}>
                    refresh
                </Button>
            ]
        }
    }

    if (txReceipt?.status == 'success') {

        const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })

        const eventABI = (abi.filter((item: any) => item.name === "TransferSingle") as Abi)
        const logs = txReceipt.logs

        let bulidingAddress = ''

        // Filter logs to find TokensClaimed events
        logs.forEach((log: any) => {
            try {
                const topics: any = decodeEventLog({ abi: eventABI, data: log.data, topics: log.topics })
                bulidingAddress = log.address
            } catch {
                // not a safeTransferFrom event, do nothing
            }
        })

        const building: NFT = getBuildingByAddress(bulidingAddress)
        
        const successString = `You now own ${addThe(building.metadata.name)} card!`
        const shareText = `I won ${addThe(building.metadata.name)} card in /farconic! 🎉`
        const nameWithHyphens = building.metadata.name.replaceAll(/\s/g, '-').toLowerCase()
        const targetUrl = `https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_APP_LINK}/${encodeURIComponent(nameWithHyphens)}&text=${encodeURIComponent(shareText)}`

        return {
            image: (
                <div tw="flex w-full h-full" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmRJx4BNegoXtzsZ64zqFwxqoXUFRZAmAQmG6ToLxU2SdV)` }}>
                    <div tw="flex flex-col relative bottom-[40px] w-full h-full items-center justify-center">
                        <h1 tw="text-[60px]">CONGRATULATIONS!</h1>
                        { await CardImage(building, undefined, undefined, '0.5', true) }
                        {userData &&
                            <div tw="absolute top-[330px] w-full flex flex-col justify-center items-center">
                                <img src={userData.profileImage} alt="" tw="w-[4.55vw] h-[4.55vw] rounded-full" />
                                <div tw="flex lowercase text-[14px] text-white" style={{ transform: 'scale(0.6)' }}>@{userData.username}</div>
                            </div>
                        }
                        <h1 tw="px-20 text-center flex text-[32px]">{successString}</h1>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/raffle/" }}>
                    reset
                </Button>,
                <Button action="link" target={ targetUrl }>
                    Share 🔁
                </Button>,
                <Button action="link" target='https://farconic.xyz'>
                    App 🌐
                </Button>
            ]
        }
    }

    return {
        image: (
            <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                <div tw="flex flex-col absolute px-20 justify-center items-center">
                    <h1 tw="text-[50px] mb-5 leading-6">Sorry you can&apos;t claim at this time</h1>
                    <p tw="text-[30px] leading-6"> Stay tuned to /farconic for more opportunities to enter raffles!</p>
                </div>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/raffle/" }}>
                reset
            </Button>
        ]
    }
},
{
    // this uses the syndicate api to handle the transactions
    middleware: [claim]
})

export const GET = handleRequest
export const POST = handleRequest