import { NFT } from "@/lib/utils"
import cardSVG from '@/data/card.svg'
import { CardImage } from "@/components/Card"
import buildings from '@/data/buildings.json'
import CardSVG from "@/components/CardSVG"

export default function Gallery() {
    
    return (
        <section className="w-11/12 lg:w-1/2 mx-auto">

            <div className="flex px-20 justify-center items-center">
                filter & sort will be here
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 lg:gap-x-12 lg:gap-y-5 lg:pt-7 lg:max-w-90 lg:mx-auto mb-5 lg:mb-20">
            {
                (buildings as NFT[]).slice(0, 50).map((nft) => (
                    <div className="" key={ nft.metadata.name }>
                        <div className="flex items-end justify-center h-20">
                            <h2 className={ `m-0 text-center text-base leading-0` }>{ nft.metadata.name }</h2>
                        </div>
                        <div className="relative w-full overflow-hidden">
                            <CardSVG 
                                colour={ nft.building_color }
                                imageUrl={ nft.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) }
                                country={ nft.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value || '' }
                                city={ nft.metadata.attributes.find(attr => attr.trait_type == 'City')?.value || '' }
                                name={ nft.metadata.name }
                                price="XXX ETH"
                                minted="XXX"
                                liquidity="XXX ETH"
                                holders="XXX"
                            />
                        </div>
                        <div className="mt-2 flex justify-center">
                            <button className="text-xs font-bold tracking-widest bg-black text-white rounded-full py-1 px-5 w-fit">TRADE</button>
                        </div>
                    </div>
                ))
            }
            </div>
        </section>
    )
}