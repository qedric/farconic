import { fetchMetadata } from "frames.js/next"
import { NFT, getBuildingByName, getDetail, formatWeiToETH } from "@/lib/utils"
import CardSVG from "@/components/CardSVG"
import { getOwnersOfToken } from '@/app/api/alchemy'
import ReactDOM from 'react-dom'
import Trade from '@/components/Trade'
import { WalletProvider } from "@/context/WalletContext"

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

  const building: NFT = getBuildingByName(params.building.replaceAll('-', ' '))

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
    getOwnersOfToken((building as NFT).address),
    getDetail((building as NFT).address)
  ])

  const priceForNextMintWithRoyalty = detail.info.priceForNextMint + (detail.info.priceForNextMint * BigInt(detail.mintRoyalty) / BigInt(10000))
  const currentPriceValue = formatWeiToETH(priceForNextMintWithRoyalty)

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center items-center w-2/5 ml-auto max-w-xl">
        <CardSVG
          colour={building.building_color}
          imageUrl={building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)}
          country={building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value || ''}
          city={building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value || ''}
          name={building.metadata.name}
          price={currentPriceValue}
          minted={detail.info.currentSupply.toString()}
          liquidity={ formatWeiToETH(detail.info.reserveBalance) }
          holders={holders?.length.toString() || '0'}
        />
        <button className="btn">Share</button>
      </div>

      <div className="flex flex-col my-6 justify-start items-center w-2/5 mr-auto max-w-xl">
        <div className="flex justify-center items-center mx-auto">
          <h2 className="text-2xl font-bold">{building.metadata.name}</h2>
        </div>
        <WalletProvider>
          <Trade building={building} />
        </WalletProvider>
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