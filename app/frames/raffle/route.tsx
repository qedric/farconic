/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getRaffleFromDb } from '@/lib/db'

const handleRequest = frames(async (ctx) => {

    const { raffle } = await getRaffleFromDb(ctx.searchParams.name)

    if (!raffle) {
        throw new Error(`${ctx.searchParams.name} not found`)
    }

    const welcomeImage = raffle.welcomeImage
    const welcomeText = raffle.welcomeText

    return {
        image: welcomeImage 
            ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}${welcomeImage}`
            : (
                <div tw="w-full h-full flex flex-col items-center justify-center p-5 bg-[#EBE7DE]">
                    <h1 tw="text-4xl">🎉 Raffle 🎉</h1>
                    <p tw="text-3xl">{ welcomeText ? welcomeText : `Are you a winner?`}</p>
                </div>
            ),
        imageOptions: {
            aspectRatio: welcomeImage ? "1:1" : "1.91:1"
        },
        buttons: [
            <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/raffle/check" }}>
                Check if you&quot;ve won 👀
            </Button>
        ]
    }
})

export const GET = handleRequest
export const POST = handleRequest