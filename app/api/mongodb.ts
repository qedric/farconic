'use server'
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

type Raffle = {
    name: string
    buildingId: string
    winnerFids: number[]
    welcomeText?: string
    welcomeImage?: string
    wonImage?: string
    lostImage?: string
    claimed?: {
        fid: number
        claims: string[]
    }[]
}

type Package = {
    name: string
    buildingIds: string[]
    welcomeImage?: string
    claimed?: {
        fid: number
        claims: string[]
    }[]
}

type Trade = {
    buildingId: string
    minted: {
        quantity: number
        totalAmount: bigint
    }
    burned: {
        quantity: number
        totalAmount: bigint
    }
}

export type User = {
    fid: number
    trades: Array<Trade>
    streak?: number
    referrals?: number
}

export const getAllUsers = async (): Promise<string> => {
    try {
        await client.connect()
        const collection = client.db('farconic').collection('users')
        const records = await collection.find().toArray()
        console.log('User records:', records)
        return JSON.stringify(records)
    } catch (e:any) {
        console.error(e)
        return e
    }
}

export const addTradeToUser = async (fid: number, buildingId: string, amount: bigint, qty: number, isSell: boolean): Promise<number> => {
    try {
        await client.connect()
        const collection = client.db('farconic').collection('users')

        // Find the user by fid
        const userToUpdate = await collection.findOne({ fid }) as User | null

        if (userToUpdate) {
            // Check if the trade exists
            let trade: Trade | null = userToUpdate.trades?.find((trade) => trade.buildingId === buildingId) || null

            console.log('trade before update:', trade)

            if (trade) {
                // Update the existing trade
                if (isSell) {
                    trade.burned.quantity += Number(qty)
                    trade.burned.totalAmount = BigInt(trade.burned.totalAmount) + BigInt(amount)
                } else {
                    trade.minted.quantity += Number(qty)
                    trade.minted.totalAmount = BigInt(trade.minted.totalAmount) + BigInt(amount)
                }
            } else {
                // Add new trade
                trade = isSell
                    ? { buildingId, burned: { quantity: Number(qty), totalAmount: BigInt(amount) }, minted: { quantity: Number(0), totalAmount: BigInt(0) } }
                    : { buildingId, minted: { quantity: Number(qty), totalAmount: BigInt(amount) }, burned: { quantity: Number(0), totalAmount: BigInt(0) } }
                userToUpdate.trades.push(trade)
            }

            console.log('updated trade:', trade)


            // Update the user document
            const result = await collection.updateOne({ fid }, { $set: { trades: userToUpdate.trades } })
            console.log('Records updated:', result.modifiedCount)
            return result.modifiedCount
        } else {
            // User does not exist, create a new user with the trade
            const newUser: User = {
                fid,
                trades: [
                    isSell
                        ? { buildingId, burned: { quantity: Number(qty), totalAmount: BigInt(amount) }, minted: { quantity: Number(0), totalAmount: BigInt(0) } }
                        : { buildingId, minted: { quantity: Number(qty), totalAmount: BigInt(amount) }, burned: { quantity: Number(0), totalAmount: BigInt(0) } }
                ],
            }
            const result = await collection.insertOne(newUser)
            console.log('New user created:', result)
            return result.acknowledged ? 1 : 0
        }
    } catch (e) {
        console.error(e)
        return -1
    } finally {
        await client.close()
    }
}

export const getRaffleFromDb = async (name: string): Promise<Raffle | null> => {
    try {
        await client.connect() // `await client.connect()` will use the default database passed in the MONGODB_URI
        const collection = client.db('farconic').collection('raffles')
        const record = await collection.findOne({ name })
        const raffle:Raffle | null= record
            ? {
                name: record.name,
                buildingId: record.buildingId,
                winnerFids: record.winnerFids,
                welcomeText: record.welcomeText,
                welcomeImage: record.welcomeImage,
                claimed: record.claimed || null
            }
            : null
        return raffle
    } catch (e) {
        console.error(e)
        return null
    }
}

export const getPackageFromDb = async (name: string): Promise<Package | null> => {
    try {
        await client.connect() // `await client.connect()` will use the default database passed in the MONGODB_URI
        const collection = client.db('farconic').collection('packages')
        const record = await collection.findOne({ name })
        const buildingPackage:Package | null = record
            ? {
                name: record.name,
                buildingIds: record.buildingIds,
                welcomeImage: record.welcomeImage,
                claimed: record.claimed || null
            }
            : null
        return buildingPackage
    } catch (e) {
        console.error(e)
        return null
    }
}

export const markPackageWinnerAsClaimed = async (name: string, fid: number, buildingIds: string[]): Promise<number> => {

    try {
        await client.connect()
        const collection = client.db('farconic').collection('packages')
        const recordToUpdate = await collection.findOne({ name })

        console.log('name', name)
        console.log('recordToUpdate:', recordToUpdate)

        const claims: string[][] = recordToUpdate?.claimed?.find((entry: any) => entry.fid === fid).claims || []
        claims.push(buildingIds)
        const result = await collection.updateOne({ name }, { $set: { claimed: [{ fid, claims }] } })
        console.log(result.modifiedCount)
        return result.modifiedCount
    } catch (e) {
        console.error(e)
        return -1
    }

}

export const getRaffleClaims = async (name: string, fid: number): Promise<string[]> => {
    try {
        const recordToUpdate = await getRaffleFromDb(name)
        const claims: string[] = recordToUpdate?.claimed?.find(entry => entry.fid === fid)?.claims || []

        return claims

    } catch (e) {
        console.error(e)
        return []
    }
}

export const markRaffleWinnerAsClaimed = async (name: string, fid: number, txId: string): Promise<number> => {

    try {
        await client.connect()
        const collection = client.db('farconic').collection('raffles')
        const recordToUpdate = await collection.findOne({ name })

        console.log('recordToUpdate:', recordToUpdate)

        const claims: string[] = recordToUpdate?.claimed?.find((entry: any) => entry.fid === fid).claims || []

        if (!claims.includes(txId)) {
            claims.push(txId)
            const result = await collection.updateOne({ name }, { $set: { claimed: [{ fid, claims }] } })
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

const getAdminsFromDb = async (): Promise<string[]> => {
    try {
        await client.connect()
        const collection = client.db('farconic').collection('admins')
        const records = await collection.find().toArray()
        console.log('Admin records:', records)
        return records.map((record: any) => record.address)
    } catch (e) {
        console.error(e)
        return []
    }
}

export const isAdminUser = async (address: string): Promise<boolean> => {
    try {
        const admins = await getAdminsFromDb()
        if (admins.includes(address)) {
            return true
        }
    } catch (e) {
        return false
    }
    return false
}