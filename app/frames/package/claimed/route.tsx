/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text, react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getUserDataForFid } from 'frames.js'
import { decodeEventLog, Abi } from 'viem'
import { getTransactionReceipt, getBuildingByAddress, NFT } from '@/lib/utils'
import { markWinnerAsClaimed } from '@/app/api/mongodb'
import { claim } from './deliverPackage'
import { CardImage } from '@/components/FrameCard'
import abi from '@/data/mc_building_abi.json'

const handleRequest = frames(async (ctx: any) => {

    const txId = ctx.txId || ''
    console.log('txId:', txId)

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

    // if we have a txId, get the tx status
    const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}` } }
    let requestStatus: any

    await fetch(`https://api.syndicate.io/wallet/project/${process.env.SYNDICATE_PROJECT_ID}/request/${txId}`, options)
        .then(response => response.json())
        .then(response => requestStatus = response)
        .catch(err => console.error(err))

    //console.log('tx status:', requestStatus)

    if (requestStatus.invalid) {
        return {
            image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Sorry you can&quot;t claim at this time</h1>
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
    }

    let txReceipt: any = null
    let status: string
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
        console.log('bulidingAddress:', bulidingAddress)

        // mark the winner as having claimed their prize, in the database
        const result = await markWinnerAsClaimed(ctx.searchParams.name, ctx.message.requesterFid, txId)

        console.log('building:', building)
        const addThe = (bulidingName: string) => bulidingName.toLowerCase().startsWith('the') ? bulidingName : `the ${bulidingName}`
        const successString = `You now own ${addThe(building.metadata.name)} card!`

        console.log('successString:', successString)

        return {
            image: (
                <div tw="flex w-full h-full" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmRJx4BNegoXtzsZ64zqFwxqoXUFRZAmAQmG6ToLxU2SdV)` }}>
                    <div tw="flex flex-col relative bottom-[40px] w-full h-full items-center justify-center">
                        <h1 tw="relative top-[18%] text-[60px]">CONGRATULATIONS!</h1>
                        {await CardImage(building, undefined, undefined, '0.50')}
                        {userData &&
                            <div tw="absolute top-[310px] w-full flex flex-col justify-center items-center">
                                <img src={userData.profileImage} alt="" tw="w-[4.55vw] h-[4.55vw] rounded-full" />
                                <div tw="flex lowercase text-[14px] text-white" style={{ transform: 'scale(0.6)' }}>@{userData.username}</div>
                            </div>
                        }
                        <h1 tw="relative px-20 text-center bottom-[280px] flex text-[32px]">{successString}</h1>
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
                <Button action="link" target={`${process.env.NEXT_PUBLIC_OPENSEA_LINK as string}${bulidingAddress}`}>
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
    } : {
        image: (
            <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)` }}>
                <div tw="flex flex-col absolute px-20 justify-center items-center">
                    <h1 tw="text-[50px] mb-5 leading-6">{`Transaction status: ${status}.`}</h1>
                    <p tw="text-[30px] leading-6">Please allow some time for the transaction to appear on the blockchain, and try a refresh.</p>
                </div>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { txId: txId, name: ctx.searchParams.name }, pathname: "/raffle/claimed" }}>
                refresh
            </Button>,
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