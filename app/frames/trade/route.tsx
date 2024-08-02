/* eslint-disable react/jsx-key, @next/next/no-img-element, jsx-a11y/alt-text */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { getUserDataForFid } from 'frames.js'
import { 
    type NFT,
    formatWeiToETH,
    abbreviateAddress,
    getTokenBalancesForAddresses
} from '@/lib/utils'
import { getDetail, getIsApproved, estimatePriceMiddleware } from '@/app/api/mintclub'
import { ErrorFrame } from "@/components/FrameError"
import { getOwnersOfToken } from '@/app/api/alchemy'

const handleRequest = frames(async (ctx:any) => {

    if (ctx.searchParams?.building) {

        let qty = ctx.qty 

        if (ctx.priceEstimate === undefined) {
            return ErrorFrame(
                "Couldn't Get Price Estimate", 
                null, 
                null, 
                "A fresh start might do the trick. If the problem persists, let us know!", 
                ctx.searchParams.mode == 'search' || ctx.state.searchMode ? 'search' : 'building'
            )
        }

        const estimation = BigInt(ctx.priceEstimate)
        const building:NFT = JSON.parse(ctx.searchParams.building)

        let isApproved = false
        let approvedAddresses: { address: string, balance: string }[] = []
        let buildingBalances: { address: string, balance: string }[] = []
        if (ctx.searchParams.balances) {
            buildingBalances = JSON.parse(ctx.searchParams.balances)
        } else {
            // find how many of this building the user has among their verified addresses
            const addresses = ctx.message?.requesterVerifiedAddresses || []
            console.log('addresses', addresses)
            const { balances } = await getTokenBalancesForAddresses(building.address as `0x${string}`, addresses)
            buildingBalances = balances
        }

        console.log('buildingBalances', buildingBalances)
        
        let totalBalance = buildingBalances.reduce((acc, b) => acc + BigInt(b.balance), BigInt(0))

        if (buildingBalances.length > 0) {
            if (ctx.searchParams.approvedAddress) {
                console.log(`Address ${JSON.parse(ctx.searchParams.approvedAddress)} approved`)
                approvedAddresses.push(JSON.parse(ctx.searchParams.approvedAddress))
                isApproved = true
            } else {
                // check that the seller has approved the contract to spend the NFT
                await Promise.all(buildingBalances.map(async (balance) => {
                    const approved = await getIsApproved((building.address as `0x${string}`), (balance.address as `0x${string}`))
                    if (approved) {
                        approvedAddresses.push({address: balance.address, balance: balance.balance});
                    }
                }))
                isApproved = approvedAddresses.length > 0
                isApproved && console.log("Approved Addresses:", approvedAddresses)
            }

            // sort by the largest balance
            buildingBalances = buildingBalances.sort((a, b) => Number(b.balance) - Number(a.balance))
            approvedAddresses = approvedAddresses.sort((a, b) => Number(b.balance) - Number(a.balance))

            if (ctx.isSell && isApproved && BigInt(buildingBalances[0].balance) < qty) {
                qty = BigInt(buildingBalances[0].balance)
            }
        }

        const [holders, detail] = await Promise.all([
            getOwnersOfToken((building as NFT).address),
            getDetail((building as NFT).address)
        ])
    
        const priceForNextMintWithRoyalty = detail.info.priceForNextMint + (detail.info.priceForNextMint * BigInt(detail.mintRoyalty) / BigInt(10000))
        const currentBuyValue = formatWeiToETH(priceForNextMintWithRoyalty)

        const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })

        const buildingName = building.metadata.name
        let buildingNameFontSize:string = buildingName.length > 28 
            ? 'text-xs'
            : 'text-lg'

        const containerStyle:string = `flex items-center bg-[${building.building_color}] rounded-[16px] uppercase`
        const InfoDisplay: React.FC<{ label: string, value: string }> = ({ label, value }) => {
            return (
                <div tw="flex flex-col w-[15.6vw]">
                    <div tw="text-[15.6px] font-bold mb-1">{ label }</div>
                    <div tw={ `px-2 h-[3.4125vw] text-[24px] ${containerStyle}` }>
                        { value }
                    </div>
                </div>
            )
        }

        const buttons:any = [
            <Button action="post" target={ ctx.searchParams.mode === 'search' || ctx.state.searchMode ? '/farconic' : { query: { building: JSON.stringify(building) }, pathname: "/building" } }>
                Home
            </Button>,
            <Button 
                action={ ctx.isSell ? "post" : "tx" }
                target={
                    ctx.isSell
                        ? { query: { building: JSON.stringify(building), qty: qty.toString(), balances:JSON.stringify(buildingBalances) }, pathname: "/trade" }
                        : { query: { contractAddress: building.address, qty: qty.toString(), estimation: estimation.toString() }, pathname: "/trade/txdata" }
                    }
                    post_url="/trade/txStatusTrade">
                { ctx.isSell ? 'Buy Preview' : 'Buy 🛒' }
            </Button>
        ]

        if (buildingBalances.length > 0) {
            buttons.push(
                <Button 
                    action={
                        ctx.isSell // tx will be either sell or approve
                            ? 'tx'
                            : 'post'
                    }
                    target={
                        ctx.isSell 
                            ? { query: { contractAddress: building.address, isSell:true, isApproved, qty: qty.toString(), estimation: estimation.toString() }, pathname: "/trade/txdata" }
                            : { query: { building: JSON.stringify(building), isSell:true, balance:JSON.stringify(buildingBalances) }, pathname: "/trade" }
                    }
                    post_url={
                        isApproved
                            ? "/trade/txStatusTrade"
                            : "/trade/txStatusApprove"
                    }
                >{
                    ctx.isSell 
                    ? (isApproved ? 'Sell 💰' : 'Approve Sell') 
                    : 'Sell Preview'
                  }
                </Button>
            )
        }

        buttons.push(
            <Button action="post" target={{ query: { building: JSON.stringify(building), qty: qty.toString(), isSell: ctx.isSell, balances:JSON.stringify(buildingBalances) }, pathname: "/trade" }}>
                Refresh Price
            </Button>
        )

        return {
            image: (
                <div tw="flex w-full h-full" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                    <div tw="flex flex-col mt-[100px] mb-[240px] w-full items-center justify-center">
                        <div tw="relative flex w-[780px] h-[780px] items-center justify-center" style={{ backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmYHgaiorK3VJaab1qnHytF4csJ9ELPcmLZ6zK5wWfSeE5)`}}>
                            <div tw="flex flex-wrap relative w-[34.45vw] text-white p-0 m-0">
                                <div tw={ `flex flex-col relative w-full ${ containerStyle } h-[41.925vw]` }>
                                    <div tw="flex flex-1 text-[31.2px] w-[31.2vw] mb-1.5 items-end justify-between">
                                        <div tw="text-[10px]">{ building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value }</div>
                                        <div tw="text-[10px]">{ building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value }</div>
                                    </div>
                                    <div tw="flex items-center">
                                        <img tw="bg-green-200 w-[31.2vw]" src={ building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) as string } />
                                    </div>
                                    <div tw={`flex w-full flex-1 items-center justify-center px-4`}>
                                        <h1 tw={ `m-0 text-center ${buildingNameFontSize}` }>{ buildingName }</h1>
                                    </div>
                                </div>
                                <div tw="mt-2 w-full flex justify-between">
                                    <InfoDisplay label="Current Price:" value={ currentBuyValue } />
                                    <InfoDisplay label="Total Minted:" value={ detail.info.currentSupply.toString() } />
                                </div>
                                <div tw="mt-1 w-full flex justify-between">
                                    <InfoDisplay label="Liquidity:" value={ formatWeiToETH(detail.info.reserveBalance) } />
                                    <InfoDisplay label="Holders:" value={ holders?.length.toString() || '0' } />
                                </div>
                            </div>
                            { userData && 
                                <div tw="absolute top-[19.5px] w-full flex flex-col justify-center items-center">
                                    <img src={userData.profileImage} tw="w-[5.915vw] h-[5.915vw] rounded-full" />
                                    {/* <div tw="flex flex-col w-[5.25vw] h-[5.25vw] rounded-full">
                                        <div tw="flex justify-center items-center bg-green-200 w-full h-1/2 rounded-t-full text-center"><div>T</div></div>
                                        <div tw="flex justify-center items-center bg-red-200 w-full h-1/2 rounded-b-full text-center"><div>B</div></div>
                                    </div> */}
                                    <div tw="flex lowercase text-[18px] text-white" style={{ transform: 'scale(0.78)' }}>@{ userData.username }</div>
                                </div>
                            }
                        </div>
                        { ctx.isSell && totalBalance == BigInt(0) && (
                            <div tw="flex flex-col px-20 justify-center items-center flex-grow">
                                <h1 tw="text-[40px] mb-4 text-center">{ `You don't own any ${ building.metadata.name } Cards, so you can't sell any.` }</h1>
                            </div>
                        )}
                        { ctx.isSell && isApproved && totalBalance > BigInt(0) && (
                            <div tw="flex flex-col px-20 justify-center items-center flex-grow">
                                <h1 tw="text-[50px] mb-6 leading-6">{ `Quantity: ${qty} | Total Value: ${ formatWeiToETH(estimation) }` }</h1>
                                <p tw="text-[30px] leading-6 text-center">
                                    {`${approvedAddresses.map(a => `Address: ${abbreviateAddress(a.address)} | Balance: ${a.balance}`).join(', ')}\n`}
                                </p>
                            </div>
                        )}
                        { ctx.isSell && !isApproved && totalBalance > BigInt(0) && (
                            <div tw="flex flex-col px-20 justify-center items-center flex-grow">
                                <h1 tw="text-[40px] mb-4 leading-8 text-center">{ `Your approval is required to sell your cards` }</h1>
                                <p tw="text-[30px] leading-6 text-center">
                                    {`${buildingBalances.map(a => `Address: ${abbreviateAddress(a.address)} | Balance: ${a.balance}`).join(', ')}\n`}
                                </p>
                            </div>
                        )}
                        { !ctx.isSell && (
                            <div tw="flex flex-col px-20 justify-center items-center flex-grow">
                                <h1 tw="text-[50px] mb-5 leading-6">{ `Quantity: ${qty} | Price: ${ formatWeiToETH(estimation) }` }</h1>
                            </div>
                        )} 
                    </div>
                    <div tw="flex justify-center top-4 absolute w-[1200px]">
                        <h1 tw="text-center text-[36px]">{ `${ctx.isSell ? isApproved || totalBalance == BigInt(0) ? 'Sell Preview' : 'Approve Selling' : 'Buy Preview'}` }</h1>
                    </div>
                </div>
            ),
            imageOptions: {
                aspectRatio: "1:1",
            },
            buttons: buttons,
            textInput: 'Set Quantity & Refresh Price',
            headers: {  
                "Cache-Control": "max-age=0", 
            }
        }
    } else {
        return ErrorFrame(
            "Building Not Found",
            null,
            null,
            "If the issue persists, let us know!",
            ctx.searchParams.mode == 'search' || ctx.state.searchMode ? 'search' : 'building'
        )
    }
},
{
    middleware: [estimatePriceMiddleware]
})

export const GET = handleRequest
export const POST = handleRequest