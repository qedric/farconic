/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getUserDataForFid } from 'frames.js'
import { CardImage } from '@/components/FrameCard'
import { getRandomBuildingAmongFavourites, getBuildingByName, type NFT, addThe } from '@/lib/utils'

export const maxDuration = 20

const handleRequest = frames(async (ctx) => {

    let building: NFT = ctx.searchParams.building
        ? JSON.parse(ctx.searchParams.building)
        : ctx.searchParams.buildingName
            ? getBuildingByName(ctx.searchParams?.buildingName?.replaceAll('-', ' ')) || getRandomBuildingAmongFavourites()
            : getRandomBuildingAmongFavourites()
    
    const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })

    const shareText = `Check out ${addThe(building.metadata.name)} card in /farconic! 👀`
    const nameWithHyphens = building.metadata.name.replaceAll(/\s/g, '-').toLowerCase()
    const targetUrl = `https://warpcast.com/~/compose?embeds%5B%5D=${process.env.NEXT_PUBLIC_FRAME_SHARE_LINK}/${encodeURIComponent(nameWithHyphens)}&text=${encodeURIComponent(shareText)}`
    
    return {
        image: await CardImage( building, userData?.profileImage, userData?.username),
        imageOptions: {
            aspectRatio: "1:1"
        },
        textInput: 'Set Quantity',
        buttons: [
            <Button action="link" target={`${process.env.NEXT_PUBLIC_FRAME_SHARE_LINK}/${encodeURIComponent(nameWithHyphens)}`}>
                App 🌐
            </Button>,
            <Button action="tx" target={{ query: { contractAddress: building.address }, pathname: "/trade/txdata" }} post_url="/trade/txStatusTrade">
                Buy 🛒
            </Button>,
            <Button action="post" target={{ query: { building: JSON.stringify(building), isSell:true, mode: 'building' }, pathname: "/trade" }}>
                Sell 💰
            </Button>,
            <Button action="link" target={ targetUrl }>
                Share 🔁
            </Button>,
        ],
        headers: {  
            "Cache-Control": "max-age=0", 
        }
    }
})

export const GET = handleRequest
export const POST = handleRequest