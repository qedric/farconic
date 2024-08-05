/* eslint-disable react/jsx-key, @next/next/no-img-element, jsx-a11y/alt-text */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getUserDataForFid } from 'frames.js'
import { type Building, addThe, removeThe } from '@/lib/utils'
import { getTradeDetails } from '@/app/api/mintclub'
import { ErrorFrame } from "@/components/FrameError"
import { CardImage } from '@/components/FrameCard'
import { addTradeToDb } from '@/app/api/mongodb'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'

const buildings = process.env.NEXT_PUBLIC_CHAIN === 'MAINNET' ? mainnet_buildings : testnet_buildings

const handleRequest = frames(async (ctx) => {

    const txId = ctx.message?.transactionId || ctx.searchParams.transactionId

    if (txId) {

        //console.log('transactionId', txId)
        const url = `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/${txId}`
        const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })
        const { receipt, building_address, quantityTraded, amount, addressUsed, isSell } = await getTradeDetails((txId as `0x${string}`))

        if (receipt.status == 'success') {

            // get the building object from the buildings json based on the address
            const building = buildings.find((building) => building.address?.toLowerCase() === building_address.toLowerCase())

            if (!building) {
                return ErrorFrame(
                    "Building Not Found",
                    'Refresh',
                    JSON.stringify({ query: { transactionId: txId }, pathname: "/trade/txStatusTrade" }),
                    "A refresh might do the trick.  If not, try again from the start. If the issue persists, let us know!",
                    ctx.searchParams.mode == 'search' || ctx.state.searchMode ? 'search' : 'building'
                )
            }

            // update the database with the details of the transaction
            addTradeToDb(addressUsed, ctx.message, building.id, amount, quantityTraded, isSell)

            const successString = `${isSell ? "You've parted with" : "You've acquired"} ${ quantityTraded > BigInt(1) ? `${quantityTraded} ${removeThe(building.metadata.name)} cards!` : `${addThe(building.metadata.name)} card!`}`

            const shareText = isSell 
                ? `Just sold ${quantityTraded > 1 ? `${quantityTraded} ${removeThe(building.metadata.name)} cards` : `${addThe(building.metadata.name)} card`} in /farconic! 💰`
                : `Just bought ${quantityTraded > 1 ? `${quantityTraded} ${removeThe(building.metadata.name)} cards` : `${addThe(building.metadata.name)} card`} in /farconic! 👀`

            const nameWithHyphens = building.metadata.name.replaceAll(/\s/g, '-').toLowerCase()

            const targetUrl = `https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_APP_LINK}/${encodeURIComponent(nameWithHyphens)}&text=${encodeURIComponent(shareText)}`

            return {
                image: (
                    <div tw="flex w-full h-full" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmRJx4BNegoXtzsZ64zqFwxqoXUFRZAmAQmG6ToLxU2SdV)`}}>
                        <div tw="flex flex-col relative bottom-[40px] w-full h-full items-center justify-center">
                            <h1 tw="text-[60px]">{ isSell ? 'SOLD!' : 'CONGRATULATIONS!' }</h1>
                            { await CardImage(building as Building, undefined, undefined, '0.5') }
                            { userData && 
                                <div tw="absolute top-[330px] w-full flex flex-col justify-center items-center">
                                    <img src={userData.profileImage} tw="w-[4.55vw] h-[4.55vw] rounded-full" />
                                    {/* <div tw="flex flex-col w-[5.25vw] h-[5.25vw] rounded-full">
                                        <div tw="flex justify-center items-center bg-green-200 w-full h-1/2 rounded-t-full text-center"><div>T</div></div>
                                        <div tw="flex justify-center items-center bg-red-200 w-full h-1/2 rounded-b-full text-center"><div>B</div></div>
                                    </div> */}
                                    <div tw="flex lowercase text-[14px] text-white" style={{ transform: 'scale(0.6)' }}>@{ userData.username }</div>
                                </div>
                            }
                            <h1 tw="px-20 text-center flex text-[32px]">{ successString }</h1>
                        </div>
                    </div> 
                ),
                imageOptions: {
                    aspectRatio: "1:1",
                },
                buttons: [
                    <Button action="post" target={ ctx.searchParams.mode === 'search' || ctx.state.searchMode ? '/farconic' : { query: { building: JSON.stringify(building) }, pathname: "/building" } }>
                        Home
                    </Button>,
                    <Button action="link" target={ targetUrl }>
                        Share 🔁
                    </Button>,
                    <Button action="link" target={ url }>
                        View tx
                    </Button>
                ],
                headers: {  
                    "Cache-Control": "max-age=0", 
                },
            }
        } else {
            return {
                image: (
                    <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                        <div tw="flex flex-col absolute px-20 justify-center items-center">
                            <h1 tw="text-[50px] mb-5 leading-6">Transaction Status:</h1>
                            <p tw="text-[30px] leading-6">{receipt.status}</p>                            
                        </div>
                    </div>
                ),
                imageOptions: {
                    aspectRatio: "1:1",
                },
                buttons: [
                    <Button action="post" target={ ctx.searchParams.mode === 'search' || ctx.state.searchMode ? '/farconic' : '/building' }>
                        Reset
                    </Button>,
                    <Button action="link" target={url}>
                        View tx
                    </Button>,
                    <Button action="post" target={{ query: { transactionId: txId, mode: ctx.searchParams.mode }, pathname: "/trade/txStatusTrade" }}>
                        Refresh
                    </Button>
                ],
                headers: {  
                    "Cache-Control": "max-age=0", 
                },
            }
        }
    } else {
        return ErrorFrame(
            "Transaction Not Found",
            null,
            null, 
            "A fresh start might do the trick. If the problem persists, let us know!",
            ctx.searchParams.mode == 'search' || ctx.state.searchMode ? 'search' : 'building'
        )
    }
})

export const GET = handleRequest
export const POST = handleRequest