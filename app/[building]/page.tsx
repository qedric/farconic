import { fetchMetadata } from "frames.js/next"
import { type Building, getBuildingByName, formatWeiToETH } from "@/lib/utils"
import { getDetail } from "@/app/api/mintclub"
import CardSVG from "@/components/CardSVG"
import { getOwnersOfToken } from '@/app/api/alchemy'
import ReactDOM from 'react-dom'
import Trade from '@/components/Trade'

// Update to accept context or query parameters
export async function generateMetadata(props: any) {

  const url = new URL(
    `/frames/${props.searchParams.mode == 'search' ? 'farconic' : 'building'}?buildingName=${props.params.building}`,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )

  return {
    title: "Farconic: Collect Buildings",
    // provide the full URL to /frames endpoint with query parameters
    other: await fetchMetadata(url),
  }
}

const PageContent = async ({
  params
}: {
  params: { building: string }
}) => {

  const building: Building = getBuildingByName(params.building.replaceAll('-', ' '))

  if (!building) {
    return (
      <>
        <div className="m-20 h-screen">
          <h1>Building not found</h1>
        </div>
      </>
    )
  }

  ReactDOM.preload('/CardBG.jpeg', {
    as: 'image',
    fetchPriority: 'high',
  })

  const [holders, detail] = await Promise.all([
    getOwnersOfToken((building as Building).address),
    getDetail((building as Building).address)
  ])

  const priceForNextMintWithRoyalty = detail.info.priceForNextMint + (detail.info.priceForNextMint * BigInt(detail.mintRoyalty) / BigInt(10000))
  const currentPriceValue = formatWeiToETH(priceForNextMintWithRoyalty)

  return (
    <div>
      <div className="flex justify-center items-center mx-auto mt-5 lg:mt-0">
        <h2 className="text-2xl font-bold" style={{ color: building.building_color }}>{building.metadata.name}</h2>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center">
        <div className="flex flex-col justify-center items-center w-full lg:w-2/5 lg:ml-auto max-w-xl">
          <CardSVG
            colour={building.building_color}
            imageUrl={building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)}
            country={building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value || ''}
            city={building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value || ''}
            name={building.metadata.name}
            price={currentPriceValue}
            minted={detail.info.currentSupply.toString()}
            liquidity={formatWeiToETH(detail.info.reserveBalance)}
            holders={holders?.length.toString() || '0'}
          />
          {/* <button className="btn">Share</button> */}
        </div>

        <div className="flex flex-col my-6 justify-start items-center w-full lg:w-2/5 lg:mr-auto max-w-xl">
          <Trade building={building} />
        </div>
      </div>
    </div>

  )
}

export default function Page({
  params
}: {
  params: { building: string }
}) {
  return (
    <PageContent params={params} />
  )
}