/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getRaffleFromDb } from '@/app/api/mongodb'

const handleRequest = frames(async (ctx) => {

    const raffle = await getRaffleFromDb(ctx.searchParams.name)

    if (!raffle) {
        throw new Error(`${ctx.searchParams.name} not found`)
    }

    const welcomeImage = raffle.welcomeImage
    const welcomeText = raffle.welcomeText

    return {
        image: welcomeImage 
            ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/${welcomeImage}`
            : (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">🎉 Raffle 🎉</h1>
                        <p tw="text-[30px] leading-6">{ welcomeText ? welcomeText : `Are you a winner?`}</p>
                    </div>
                </div>
            ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/raffle/check" }}>
                Check if you&apos;ve won 👀
            </Button>
        ]
    }
})

export const GET = handleRequest
export const POST = handleRequest