/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ethers } from 'ethers'
import { type NFT } from '@/lib/utils'
import { getDetail } from '@/app/api/mintclub'
import { getOwnersOfToken } from '@/app/api/alchemy'

export const CardImage = async (
    building:NFT,
    userImg:string | undefined = undefined,
    userName:string | undefined = undefined,
    scale:string | undefined = undefined,
    noStats:boolean = false
) => {

    const getStats = async () => {
        const [tokenHolders, mc_detail] = await Promise.all([
            getOwnersOfToken((building as NFT).address),
            getDetail((building as NFT).address)
        ])
        return [tokenHolders, mc_detail]
    }

    let currentPriceValue = `XXX ETH`
    let holders:any
    let detail:any

    if (!noStats) {
        [holders, detail] = await getStats()
        if (detail && holders) {
            const priceForNextMintWithRoyalty = detail.info.priceForNextMint + (detail.info.priceForNextMint * BigInt(detail.mintRoyalty) / BigInt(10000))
            currentPriceValue = `${Math.round(parseFloat(ethers.formatEther(priceForNextMintWithRoyalty))*1e6) / 1e6} ETH`
        }
    }

    const buildingName = building.metadata.name
    let buildingNameFontSize:string = buildingName.length > 28 
        ? 'text-2xl'
        : 'text-4xl'

    const scaleFactor = scale ? Number(scale) : 1
    const scaleTransform = scale ? `scale(${scale})` : 'scale(1)'
    const containerStyle:string = `flex items-center bg-[${building.building_color}] rounded-[16px] uppercase`

    const InfoDisplay: React.FC<{ label: string, value: string }> = ({ label, value }) => {
        return (
            <div tw="flex flex-col w-[24vw]">
                <div tw="text-[24px] font-bold mb-1">{ label }</div>
                <div tw={ `px-4 h-[5.25vw] text-[36px] ${containerStyle}` }>
                    { value }
                </div>
            </div>
        )
    }

    const containerSize = `w-[${1200*scaleFactor}px] h-[${1200*scaleFactor}px]`

    return (
        <div tw={`relative flex ${containerSize} items-center justify-center`}>
            <img tw="absolute w-full h-full" width="1200" height="1200" src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmYHgaiorK3VJaab1qnHytF4csJ9ELPcmLZ6zK5wWfSeE5`} />
            <div tw="flex flex-wrap relative w-[53vw] text-white p-0 m-0" style={{ transform: scaleTransform }}>
                <div tw={ `flex flex-col w-full ${ containerStyle } h-[64.5vw]` }>
                    <div tw="flex flex-1 text-[24px] w-[48vw] mb-2 items-end justify-between">
                        <div>{ building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value }</div>
                        <div>{ building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value }</div>
                    </div>
                    <div tw="flex items-center">
                        <img tw="w-[48vw]" src={building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)} />
                    </div>
                    <div tw={`flex w-full flex-1 items-center justify-center px-8`}>
                        <h1 tw={ `m-0 text-center ${buildingNameFontSize}` }>{ buildingName }</h1>
                    </div>
                </div>
                <div tw="mt-4 w-full flex justify-between">
                    <InfoDisplay label="Current Price:" value={ currentPriceValue } />
                    <InfoDisplay label="Total Minted:" value={ detail ? detail?.info.currentSupply.toString() : 'XXX' } />
                </div>
                <div tw="mt-2 w-full flex justify-between">
                    <InfoDisplay label="Liquidity:" value={ detail ? `${Math.round(parseFloat(ethers.formatEther(detail.info.reserveBalance))*1e6) / 1e6} ETH` : 'XXX ETH' } />
                    <InfoDisplay label="Holders:" value={ holders ? holders.length.toString() : 'XXX' } />
                </div>
            </div>
            { userImg && 
                <div tw="absolute top-[37px] w-full flex flex-col justify-center items-center">
                    <img src={userImg} tw="w-[8.75vw] h-[8.75vw] rounded-full" />
                    {/* <div tw="flex flex-col w-[8.75vw] h-[8.75vw] rounded-full">
                        <div tw="flex justify-center items-center bg-green-200 w-full h-1/2 rounded-t-full text-center"><div>T</div></div>
                        <div tw="flex justify-center items-center bg-red-200 w-full h-1/2 rounded-b-full text-center"><div>B</div></div>
                    </div> */}
                    <div tw="flex lowercase mt-1 text-[24px] text-white">@{ userName }</div>
                </div>
            }
        </div>
    )
}