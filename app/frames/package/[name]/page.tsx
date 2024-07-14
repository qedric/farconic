import { fetchMetadata } from "frames.js/next"

// Update to accept context or query parameters
export async function generateMetadata(props:any) {

  const url = new URL(
    `/frames/package?name=${ props.params.name }`,
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

type ConnectionStatus = {
  isConnected: boolean
  record?: any
}

export default async function Page({
  params
}: {
  params: { name: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  return (
    <div className="m-20">
        <div className="flex justify-center items-center">
            <h1>Farconic Raffle</h1>
        </div>
    </div>
  )
}
