import { MongoClient, ServerApiVersion } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options)
  }
  client = globalWithMongo._mongoClient
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
}

// Export a module-scoped MongoClient
export default client

type ConnectionStatus = {
  isConnected: boolean
  raffle?: Raffle | null
}

export type Raffle = {
  name: string
  buildingId: number
  winnerFids: number[]
  welcomeText?: string
  welcomeImage?: string
  claimed?: {
    fid: number
    claims: string[]
  }[]
}

export const getRaffleFromDb = async (name:string): Promise<ConnectionStatus> => {
  try {
    await client.connect() // `await client.connect()` will use the default database passed in the MONGODB_URI
    const collection = client.db('farconic').collection('raffles')
    const record = await collection.findOne({ name })
    const raffle = record 
      ? {
        name: record.name,
        buildingId: record.buildingId,
        winnerFids : record.winnerFids,
        welcomeText: record.welcomeText,
        welcomeImage: record.welcomeImage,
        claimed: record.claimed || null
      }
      : null
    return {
      isConnected: true,
      raffle: raffle
    }
  } catch (e) {
    console.error(e)
    return {
      isConnected: false,
      raffle: null
    }
  }
}

export const getClaims = async (name:string, fid:number): Promise<string[]> => {
  try {
    const recordToUpdate = await getRaffleFromDb(name)
    const claims:string[] = recordToUpdate?.raffle?.claimed?.find(entry => entry.fid === fid)?.claims || []

    return claims
    
  } catch (e) {
    console.error(e)
    return []
  }
}

export const markWinnerAsClaimed = async (name:string, fid:number, txId:string): Promise<number> => {

    try {
      await client.connect()
      const collection = client.db('farconic').collection('raffles')
      const recordToUpdate = await collection.findOne({ name })
  
      console.log('recordToUpdate:', recordToUpdate)
  
      const claims:string[] = recordToUpdate?.claimed?.find((entry:any) => entry.fid === fid).claims || []
      
      if (!claims.includes(txId)) {
        claims.push(txId)
        const result = await collection.updateOne({ name }, { $set: { claimed: [{ fid, claims}] }})
        console.log(result.modifiedCount)
        return result.modifiedCount
      } else {
        return 0
      }
      
    } catch (e) {
      console.error(e)
      return -1
    }

}