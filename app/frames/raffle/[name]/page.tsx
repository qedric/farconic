import client from '@/lib/db'
import { fetchMetadata } from "frames.js/next"

// Update to accept context or query parameters
export async function generateMetadata(props:any) {

  const url = new URL(
    `/frames/raffle?name=${ props.params.name }`,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  )

  return {
    title: "A Farconic Building Raffle Frame",
    // provide the full URL to /frames endpoint with query parameters
    other: await fetchMetadata(url),
  }
}

type ConnectionStatus = {
  isConnected: boolean
  record?: any
}

const getRaffleFromDb = async (name:string): Promise<ConnectionStatus> => {
  try {
    await client.connect() // `await client.connect()` will use the default database passed in the MONGODB_URI
    const collection = client.db('farconic').collection('raffles')
    const record = await collection.findOne({ name })
    return {
      isConnected: true,
      record: record
    }
  } catch (e) {
    console.error(e)
    return {
      isConnected: false,
      record: null
    }
  }
}

export default async function Page({
  params
}: {
  params: { name: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  const { isConnected, record } = await getRaffleFromDb(params.name)

  return (
    <>
      {isConnected ? (
        <h2 className="subtitle">You are connected to MongoDB</h2>
      ) : (
        <h2 className="subtitle">
          You are NOT connected to MongoDB.
        </h2>
      )}

      <div className="m-20">
        <div className="flex justify-center items-center">
          <h1>Farconic Raffle</h1>
        </div>
      </div>

      {isConnected && record ? (
        <div className="record">
          <h3>Raffle Record:</h3>
          <p>{JSON.stringify(record)}</p>
        </div>
      ) : (
        <div className="record text-center">
          <p>Raffle with name {params.name} not found.</p>
        </div>
      )}
    </>
  )
}
