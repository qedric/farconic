/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text, react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getUserDataForFid } from 'frames.js'
import { getTransactionReceipt, getBuildingByAddress, NFT } from '@/lib/utils'
import { markPackageWinnerAsClaimed } from '@/app/api/mongodb'
import { claim } from './deliverPackage'
import { CardImage } from '@/components/FrameCard'

const handleRequest = frames(async (ctx: any) => {

    const txIds:[] = JSON.parse(ctx.txIds)

    if (txIds.length === 0) {
        return {
            image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Can&apos;t find transactions</h1>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/package/" }}>
                    reset
                </Button>
            ]
        }
    }

    const getTxReceipt = async (response: any) => {
        if (response.invalid) return 'invalid'

        if (response.transactionAttempts.length === 0) return 'pending'

        try {
            return response.transactionAttempts[0]?.hash
                ? await getTransactionReceipt(response.transactionAttempts[0]?.hash)
                : 'unkown error'
        } catch (err) {
            console.error(err)
            return response
        }
    }

    // if we have txIds, get their tx status
    const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}` } }

    // wait a moment before fetching the tx receipts to give the transactions time to be processed by syndicate
    //await new Promise((resolve) => setTimeout(resolve, 500))

    const fetchPromises = txIds.map(async (txId) => {
        try {
            const response = await fetch(`https://api.syndicate.io/wallet/project/${process.env.SYNDICATE_PROJECT_ID}/request/${txId}`, options)
            const jsonResponse = await response.json()
            return getTxReceipt(jsonResponse)
        } catch (err) {
            console.error(err)
            return null
        }
    })

    const txReceipts = await Promise.all(fetchPromises)

    console.log('txReceipts:', txReceipts)

    if (txReceipts.some((receipt) => receipt == 'pending')) {
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
                <Button action="post" target={{ query: { txIds: JSON.stringify(txIds), name: ctx.searchParams.name }, pathname: "/package/claimed" }}>
                    refresh
                </Button>
            ]
        }
    }

    if (txReceipts.some((receipt) => receipt?.status == 'success')) {

        const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })
        const logs = txReceipts.map(receipt => receipt?.logs)
       
        let bulidingAddresses:string[] = []

        // Filter logs to find TokensClaimed events
        logs.forEach((log: any) => {
            if (log && log.length > 0) {
                bulidingAddresses.push(log[0].address)
            }
        })

        const buildings: NFT[] = bulidingAddresses.map(buildingAddress => getBuildingByAddress(buildingAddress))

        // mark the winner as having claimed their prize, in the database
        const result = await markPackageWinnerAsClaimed(ctx.searchParams.name, ctx.message.requesterFid, buildings.map(building => building.id))

        let page: number = ctx.searchParams?.page ? parseInt(ctx.searchParams.page) : 1

        const addThe = (bulidingName: string) => bulidingName.toLowerCase().startsWith('the') ? bulidingName : `the ${bulidingName}`
        const numeral = (num: number) => num == 1 ? 'I' : num == 2 ? 'II' : 'III'
        const numberWord = (num: number) => num == 1 ? 'one' : num == 2 ? 'two' : 'three'
        const successString = `${numeral(page)}: ${addThe(buildings[page-1].metadata.name)}`

        const shareText = `Check out ${addThe(buildings[page-1].metadata.name)} card in /farconic! 👀`
        const nameWithHyphens = buildings[page-1].metadata.name.replaceAll(/\s/g, '-').toLowerCase()
        const targetUrl = `https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_FRAME_SHARE_LINK}/${encodeURIComponent(nameWithHyphens)}&text=${encodeURIComponent(shareText)}`

        //console.log('successString:', successString)

        return {
            image: (
                <div tw="flex w-full h-full" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmRJx4BNegoXtzsZ64zqFwxqoXUFRZAmAQmG6ToLxU2SdV)` }}>
                    <div tw="flex flex-col relative bottom-[50px] w-full h-full items-center justify-center">
                        <h1 tw="text-[60px]">CONGRATULATIONS</h1>
                        <p tw="text-[32px]">{`You now own ${numberWord(buildings.length)} new buildings cards!`}</p>                    
                        { await CardImage(buildings[page-1], undefined, undefined, '0.5', true) }
                        <h1 tw="px-20 text-center flex text-[32px]">{successString}</h1>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: page == 1 
                ? [
                    <Button action="link" target={ targetUrl }>
                        Share 🔁
                    </Button>,
                    <Button action="post" target={{ query: { txIds: JSON.stringify(txIds), name: ctx.searchParams.name, page: page+1 }, pathname: "/package/claimed" }}>
                        Next ▶
                    </Button>,
                    <Button action="link" target='https://farconic.xyz'>
                        App 🌐
                    </Button>
                ]
                : page == 2
                    ? [
                        <Button action="link" target={ targetUrl }>
                            Share 🔁
                        </Button>,
                        <Button action="post" target={{ query: { txIds: JSON.stringify(txIds), name: ctx.searchParams.name, page: page-1 }, pathname: "/package/claimed" }}>
                            ◀ Prev
                        </Button>,
                        <Button action="post" target={{ query: { txIds: JSON.stringify(txIds), name: ctx.searchParams.name, page: page+1 }, pathname: "/package/claimed" }}>
                            Next ▶
                        </Button>,
                        <Button action="link" target='https://farconic.xyz'>
                            App 🌐
                        </Button>
                    ]
                    : [
                        <Button action="link" target={ targetUrl }>
                            Share 🔁
                        </Button>,
                        <Button action="post" target={{ query: { txIds: JSON.stringify(txIds), name: ctx.searchParams.name, page: page-1 }, pathname: "/package/claimed" }}>
                            ◀ Prev
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
                    <h1 tw="text-[50px] mb-5 leading-6">Sorry you can&quot;t claim at this time</h1>
                    <p tw="text-[30px] leading-6"> Stay tuned to /farconic for more opportunities!</p>
                </div>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/package/" }}>
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