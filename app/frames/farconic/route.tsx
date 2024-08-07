/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getUserDataForFid } from 'frames.js'
import { CardImage } from '@/components/FrameCard'
import { getRandomBuildingAmongFavourites, getBuildingByName, Building } from '@/lib/utils'

export const maxDuration = 20

const handleRequest = frames(async (ctx) => {

    let building: Building = ctx.searchParams?.buildingName
        ? getBuildingByName(ctx.searchParams.buildingName.replaceAll('-', ' ')) || getRandomBuildingAmongFavourites()
        : ctx.searchParams?.building
            ? JSON.parse(ctx.searchParams.building)
            : getRandomBuildingAmongFavourites()
    
    const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })

    return {
        image: await CardImage( building, userData?.profileImage, userData?.username, undefined),
        imageOptions: {
            aspectRatio: "1:1"
        },
        textInput: "e.g. 'Bridge', 'Rome', 'Eiffel'",
        buttons: [
            <Button action="link" target={process.env.NEXT_PUBLIC_APP_LINK as string}>
                App 🌐
            </Button>,
            <Button action="tx" target={{ query: { contractAddress: building.address }, pathname: "/trade/txdata" }} post_url="/trade/txStatusTrade?mode=search">
                Buy 🛒
            </Button>,
            <Button action="post" target={{ query: { building: JSON.stringify(getRandomBuildingAmongFavourites(building.metadata.name)) }, pathname: "/farconic" }}>
                Random 🎲
            </Button>,
            <Button action="post" target="/search">
                Search 🔎
            </Button>
        ],
        headers: {  
            "Cache-Control": "max-age=0", 
        }
    }
})

export const GET = handleRequest
export const POST = handleRequest