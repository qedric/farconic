/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getPackageFromDb } from '@/app/api/mongodb'

const handleRequest = frames(async (ctx) => {

    const buildingsPackage = await getPackageFromDb(ctx.searchParams.name)

    if (!buildingsPackage) {
        throw new Error(`${ctx.searchParams.name} not found`)
    }

    const welcomeImage = buildingsPackage.welcomeImage
    const welcomeText = buildingsPackage.welcomeText

    return {
        image: welcomeImage 
        ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/${welcomeImage}`
        :(
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">Claim Building Package</h1>
                        <p tw="text-[30px] leading-6">{ welcomeText ? welcomeText : ``}</p>
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