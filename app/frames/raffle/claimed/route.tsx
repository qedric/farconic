/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { decodeEventLog, Abi } from 'viem'
import { getTransactionReceipt } from '@/lib/utils'
import { markWinnerAsClaimed } from '@/lib/db'
import { claim } from './claim'
import abi from '@/data/mc_building_abi.json'

const handleRequest = frames(async (ctx: any) => {

    const txId = ctx.txId || ''
    console.log('txId:', txId)

    if(!txId) {
        return { 
            image: (
                <div tw="flex">
                    <h1>Can&quot;t find a transaction</h1>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target="/">
                    reset
                </Button>
            ]
        }
    }

    // if we have a txId, get the tx status
    const options = {method: 'GET', headers: {Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`}}
    let requestStatus:any

    await fetch(`https://api.syndicate.io/wallet/project/${process.env.SYNDICATE_PROJECT_ID}/request/${txId}`, options)
    .then(response => response.json())
    .then(response => requestStatus = response)
    .catch(err => console.error(err))

    //console.log('tx status:', requestStatus)

    if (requestStatus.invalid) {
        return { 
            image: (
                <div tw="flex">
                    <h1>Sorry you can&quot;t claim at this time</h1>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target="/">
                    reset
                </Button>
            ]
        }
    }

    let txReceipt:any = null
    let status:string
    try {
        txReceipt = requestStatus.transactionAttempts[0]?.hash
        ? await getTransactionReceipt(requestStatus.transactionAttempts[0]?.hash)
        : null
    } catch (err) {
        status = err as any
    }

    status = txReceipt?.status || 'unknown'

    //console.log('***\n***\ntx receipt:', txReceipt)

    if (status == 'success') {

        console.log('success')

        const eventABI = (abi.filter((item: any) => item.name === "TransferSingle") as Abi)
        const logs = txReceipt.logs

        // Filter logs to find TokensClaimed events
        logs.forEach((log:any) => {
            try {
                const topics:any = decodeEventLog({abi: eventABI, data: log.data, topics: log.topics})
                console.log('topics:', topics)
            } catch {
                // not a safeTransferFrom event, do nothing
            }
        })

        // mark the winner as having claimed their prize, in the database
        const result = await markWinnerAsClaimed(ctx.searchParams.raffleName, ctx.message.requesterFid, txId)
        console.log('result:', result)

        return {
            image: (
                <div tw="flex flex-col w-full h-full">
                    <div tw="flex flex-col bg-black">
                        <h1 tw="m-0 p-0 mx-auto text-white">YOUR BUILDING</h1>
                    </div>
                    <div tw="flex flex-wrap justify-center mx-auto h-full mt-24">
                        
    
                        {/* <img
                            tw="absolute bottom-1/2 shadow-2xl"
                            src={`${ipfsLinks[4]}`}
                            width={220}
                        /> */}
                    </div>
                </div>
                
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: [
                <Button action="post" target="/">
                    reset
                </Button>,
                <Button action="link" target={process.env.NEXT_PUBLIC_OPENSEA_LINK as string}>
                    view on opensea
                </Button>,
                <Button action="link" target='https://farconic.xyz'>
                    learn more
                </Button>
            ]
        }
    }

    return status == 'pending' ? {
        image: (
            <div tw="flex flex-col">
                <h1>{`Transaction pending`}</h1>
                <p>Wait a moment then hit refresh</p>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1",
        },
        buttons: [
            <Button action="post" target={{ query: { txId: txId, raffleName: ctx.searchParams.raffleName }, pathname: "/raffle/claimed" }}>
                refresh
            </Button>,
            <Button action="link" target={process.env.NEXT_PUBLIC_OPENSEA_LINK as string}>
                view on opensea
            </Button>
        ]
    } : {
        image: (
            <div tw="flex flex-col">
                <h1>{`Transaction status: ${status}.`}</h1>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1",
        },
        buttons: [
            <Button action="post" target={{ query: { txId: txId, raffleName: ctx.searchParams.raffleName }, pathname: "/raffle/claimed" }}>
                refresh
            </Button>,
            <Button action="post" target="/">
                reset
            </Button>,
            <Button action="link" target={process.env.NEXT_PUBLIC_OPENSEA_LINK as string}>
                view on opensea
            </Button>
        ]
    }
},
{
    // this uses the syndicate api to handle the transactions
    middleware: [ claim ]
})

export const GET = handleRequest
export const POST = handleRequest