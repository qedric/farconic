import Image from 'next/image'
import { fetchMetadata } from "frames.js/next"
import { NFT, getBuildingByName } from "@/app/utils"

// Update to accept context or query parameters
export async function generateMetadata(props:any) {

  const url = new URL(
    `/frames/${ props.searchParams.mode == 'search' ? 'farconic' : 'building' }?buildingName=${ props.params.building }`,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )

  return {
    title: "A Farconic Building Frame",
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

  const building:NFT = getBuildingByName(params.building.replaceAll('-', ' '))

  console.log(building)

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
    <>
      <div className="m-20">
          <div className="flex justify-center items-center">
              <Image
                alt={ building.metadata.name }
                className="w-2/3"
                src={ building.metadata.image.replace("ipfs://", `${process.env.NEXT_PUBLIC_GATEWAY_URL}`) as string }
                width='2000'
                height='2000'
              />
          </div>
      </div>
    </>
  )
}