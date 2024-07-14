/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"

const handleRequest = frames(async (ctx) => {

    return {
        image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Claim Building Package</h1>
                    </div>
                </div>
            ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { name: ctx.searchParams.name }, pathname: "/package/claim" }}>
                Claim package 🎁
            </Button>
        ]
    }
})

export const GET = handleRequest
export const POST = handleRequest