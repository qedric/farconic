/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"

const handleRequest = frames(async (ctx) => {

    return {
        image: (
            <div tw="w-full h-full flex flex-col items-center justify-center p-5 bg-[#EBE7DE]">
                <h1 tw="text-4xl">🎉 Raffle 🎉</h1>
                <p tw="text-3xl">Are you a winner?</p>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1.91:1"
        },
        buttons: [
            <Button action="post" target={{ query: { raffleName: ctx.searchParams.name }, pathname: "/raffle/check" }}>
                Check if you've won 👀
            </Button>
        ]
    }
})

export const GET = handleRequest
export const POST = handleRequest