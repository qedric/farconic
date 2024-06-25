import { fetchMetadata } from "frames.js/next"

// Update to accept context or query parameters
export async function generateMetadata(props:any) {

  // Construct the URL
  const url = new URL(
    "/frames/farconic?mode=search",
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )

  // Append query parameters to the URL
  // props.searchParams.buildingName && url.searchParams.append('buildingName', props.searchParams.buildingName)

  return {
    title: "Farconic",
    // provide the full URL to /frames endpoint with query parameters
    other: await fetchMetadata(url),
  }
}

export default function Page() {
  return <span>A Farconic Frame</span>
}