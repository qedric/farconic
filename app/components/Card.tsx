/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ethers } from 'ethers'
import { getOpenseaData, getDetail, NFT } from '@/app/utils'

export const CardImage = async ( 
    building:NFT,
    userImg:string | undefined = undefined,
    userName:string | undefined = undefined,
    scale:string | undefined = undefined
) => {

    const [openseaData, detail] = await Promise.all([
        getOpenseaData((building as NFT).address),
        getDetail((building as NFT).address)
    ])

    const buildingName = building.metadata.name
    let buildingNameFontSize:string = buildingName.length > 28 
        ? 'text-2xl'
        : 'text-4xl'

    const scaleTransform = scale ? `scale(${scale})` : 'scale(1)'
    const containerStyle:string = `flex items-center bg-[${building.building_color}] rounded-[16px] uppercase`

    const InfoDisplay: React.FC<{ label: string, value: string }> = ({ label, value }) => {
        return (
            <div className="flex flex-col w-[24%]">
                <div className="text-[24px] font-bold mb-1">{ label }</div>
                <div className={ `px-4 h-[5.25%] text-[36px] ${containerStyle}` }>
                    { value }
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full h-full items-center justify-center" style={{ backgroundSize: '100%', transform: scaleTransform, backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmYHgaiorK3VJaab1qnHytF4csJ9ELPcmLZ6zK5wWfSeE5)`}}>
            <div className="flex flex-wrap relative w-[53%] text-white p-0 m-0">
                <div className={ `flex flex-col w-full ${ containerStyle } h-[64.5%]` }>
                    <div className="flex flex-1 text-[24px] w-[48%] mb-2 items-end justify-between">
                        <div>{ building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value }</div>
                        <div>{ building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value }</div>
                    </div>
                    <div className="flex items-center">
                        <img className="w-[48%]" src={ building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) as string } />
                    </div>
                    <div className={`flex w-full flex-1 items-center justify-center px-8`}>
                        <h1 className={ `m-0 text-center ${buildingNameFontSize}` }>{ buildingName }</h1>
                    </div>
                </div>
                <div className="mt-4 w-full flex justify-between">
                    <InfoDisplay label="Current Price:" value={ `${Math.round(parseFloat(ethers.formatEther(detail.info.priceForNextMint))*1e6) / 1e6} ETH` } />
                    <InfoDisplay label="Supply:" value={ detail.info.currentSupply.toString() } />
                </div>
                <div className="mt-2 w-full flex justify-between">
                    <InfoDisplay label="Liquidity:" value={ `${Math.round(parseFloat(ethers.formatEther(detail.info.reserveBalance))*1e6) / 1e6} ETH` } />
                    <InfoDisplay label="Holders:" value={ openseaData.owners.length } />
                </div>
            </div>
            { userImg && 
                <div className="absolute top-[37px] w-full flex flex-col justify-center items-center">
                    <img src={userImg} className="w-[8.75%] h-[8.75%] rounded-full" />
                    {/* <div className="flex flex-col w-[8.75%] h-[8.75%] rounded-full">
                        <div className="flex justify-center items-center bg-green-200 w-full h-1/2 rounded-t-full text-center"><div>T</div></div>
                        <div className="flex justify-center items-center bg-red-200 w-full h-1/2 rounded-b-full text-center"><div>B</div></div>
                    </div> */}
                    <div className="flex lowercase mt-1 text-[24px] text-white">@{ userName }</div>
                </div>
            }
        </div>
    )
}