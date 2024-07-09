import Image from 'next/image'
import { fetchMetadata } from "frames.js/next"
import { NFT, getBuildingByName } from "@/lib/utils"
import CardSVG from "@/components/CardSVG"

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

export default function Page({
  params
}: {
  params: { building: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {

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

  return (

    <div className="">
      <div className="flex justify-center items-center w-2/3 mx-auto">
        <CardSVG
          colour={building.building_color}
          imageUrl={building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`)}
          country={building.metadata.attributes.find(attr => attr.trait_type == 'Country')?.value || ''}
          city={building.metadata.attributes.find(attr => attr.trait_type == 'City')?.value || ''}
          name={building.metadata.name}
          price="XXX ETH"
          minted="XXX"
          liquidity="XXX ETH"
          holders="XXX"
        />
      </div>
    </div>

  )
}