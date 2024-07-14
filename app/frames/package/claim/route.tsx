/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../../frames"
import { getPackageFromDb } from '@/app/api/mongodb'

const handleRequest = frames(async (ctx:any) => {

    if (!ctx.message.isValid) {
        throw new Error("Invalid Frame")
    }

    const buildingPackage = await getPackageFromDb(ctx.searchParams.name)

    if (!buildingPackage) {
        throw new Error("Can't find package")
    }

    console.log('buildingPackage:', buildingPackage)

    // check if fid has already claimed
    const claims = buildingPackage.claimed?.find(entry => entry.fid === ctx.message.requesterFid)?.claims || []
    const limit = process.env.PACKAGE_CLAIM_LIMIT !== undefined ? Number(process.env.PACKAGE_CLAIM_LIMIT) : 1

    console.log('claims:', claims, 'limit:', limit)
    if (claims.length >= limit) {
        return {
            image: (
                <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="flex flex-col absolute px-20 justify-center items-center">
                        <h1 tw="text-[50px] mb-5 leading-6">You have already claimed your package!</h1>
                        <p tw="text-3xl px-12 text-center">Stay tuned to /farconic for more opportunities!</p>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1"
            },
            buttons: [
                <Button action="link" target={process.env.NEXT_PUBLIC_APP_LINK as string}>
                    App 🌐
                </Button>
            ]
        }
    }

    const address = ctx.message.requesterVerifiedAddresses?.length > 0
        ? ctx.message.requesterVerifiedAddresses[0]
        : ctx.message.requesterCustodyAddress

    return {
        image: (
            <div tw="flex w-full h-full justify-center items-center" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                <div tw="flex flex-col absolute px-20 justify-center items-center">
                    <h2 tw="text-4xl my-5">Press the &quot;Claim&quot; button below to claim your package</h2>
                    <p tw="text-3xl mt-5">Your package will be delivered to your farcaster verfied address:</p>
                    <p tw="text-3xl">{ address }</p>
                </div>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1"
        },
        buttons: [
            <Button action="post" target={{ query: { to: address, buildingIds: JSON.stringify(buildingPackage.buildingIds) }, pathname: '/package/claimed' }}>
                Claim 🎉
            </Button>
        ]
    }
})

export const GET = handleRequest
export const POST = handleRequest