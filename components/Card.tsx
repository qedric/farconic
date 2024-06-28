/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ethers } from 'ethers'
import { getOpenseaData, getDetail, NFT } from '@/lib/utils'

export const CardImage: React.FC<{ building: NFT }> = async ({ building }) => {

    /* const [openseaData, detail] = await Promise.all([
        getOpenseaData(building.address),
        getDetail(building.address)
    ]) */

    const buildingName = building.metadata.name

    const containerStyle:string = `flex items-center rounded-[16px] uppercase`

    const InfoDisplay: React.FC<{ label: string, value: string }> = ({ label, value }) => {
        return (
            <div className="flex flex-col w-[24%]">
                <div className="font-bold mb-1" style={{ fontSize: '50%' }}>{ label }</div>
                <div className={ `px-4 h-[5.25%] ${containerStyle}` } style={{ fontSize: '75%' }}>
                    { value }
                </div>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 flex w-full h-full items-center justify-center" style={{ backgroundSize: '100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmYHgaiorK3VJaab1qnHytF4csJ9ELPcmLZ6zK5wWfSeE5)`}}>
            <div className="flex flex-wrap relative w-[53%] pt-[6%] text-white p-0 m-0">
                <div className={ `flex flex-col w-full ${ containerStyle }` } style={{ backgroundColor: building.building_color }}>
                    <div className="flex items-center">
                        <img className="mx-auto w-[90%]" src={ building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) as string } />
                    </div>
                </div>
                {/* <div className="mt-4 w-full flex justify-between">
                    <InfoDisplay label="Current Price:" value={ `${Math.round(parseFloat(ethers.formatEther(detail.info.priceForNextMint))*1e6) / 1e6} ETH` } />
                    <InfoDisplay label="Supply:" value={ detail.info.currentSupply.toString() } />
                </div>
                <div className="mt-2 w-full flex justify-between">
                    <InfoDisplay label="Liquidity:" value={ `${Math.round(parseFloat(ethers.formatEther(detail.info.reserveBalance))*1e6) / 1e6} ETH` } />
                    <InfoDisplay label="Holders:" value={ openseaData.owners.length.toString() } />
                </div> */}
                <div className="mt-4 w-full flex justify-between">
                    <InfoDisplay label="Current Price:" value={ ` ETH` } />
                    <InfoDisplay label="Supply:" value=''/>
                </div>
                <div className="mt-2 w-full flex justify-between">
                    <InfoDisplay label="Liquidity:" value={ ` ETH` } />
                    <InfoDisplay label="Holders:" value='' />
                </div>
            </div>
        </div>
    )
}