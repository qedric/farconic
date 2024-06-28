import { NFT } from "@/lib/utils"
import { CardImage } from "@/components/Card"
import buildings from '@/data/buildings.json'

export default function Gallery() {

    const isNFT = (obj: any): obj is NFT => {
        return obj && typeof obj.address === 'string' && typeof obj.metadata === 'object'
    }

    const randomIndex = Math.floor(Math.random() * 454);
    const b = buildings[randomIndex] as NFT;
    
    return (
        <section className="w-11/12 lg:w-1/2 mx-auto">

            { b && <div className="relative w-[900px] h-[900px]"><CardImage building={ b } /></div> }

            <div className="flex px-20 justify-center items-center">
                filter & sort will be here
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 lg:gap-x-12 lg:gap-y-6 lg:pt-7 lg:pb-10 lg:max-w-90 lg:mx-auto">
            {
                (buildings as NFT[]).slice(0, 50).map((nft) => (
                    <div className="" key={ nft.metadata.name }>
                        <h1 className={ `m-0 text-center` } style={{ fontSize: '100%' }}>{ nft.metadata.name }</h1>
                        <div className="relative w-full pb-[100%] overflow-hidden">
                            <CardImage building={ nft } />
                        </div>
                    </div>
                ))
            }
            </div>
        </section>
    )
}