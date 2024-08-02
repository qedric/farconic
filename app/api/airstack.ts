'use server'
import { init, useQuery, fetchQuery } from "@airstack/airstack-react"
init(`${process.env.AIRSTACK_API_KEY}`)


 const queryUserNameFromFid = (fid: string) => {
    return (
      `query MyQuery {
        Socials(
          input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
        ) {
          Social {
            profileHandle
          }
        }
      }`
  )
}

export const queryProfileNamesFromFids = async (fids:string[])=> {

  const query = `query GetProfileNamesByFIDs($fids: [String!]) {
    Socials(
      input: {filter: {userId: {_in: $fids}}, blockchain: ethereum, limit: 50}
    ) {
      Social {
        userId,
        profileName
      }
    }
  }`

  const { data, error } = await fetchQuery(query, {
    "fids": fids
  })

  if (error) return error

  return data

}

export const queryFrameShares = async (frameUrl:string)=> {

  const query = `query FindSharedFarcasterFrame {
    FarcasterCasts(
      input: {blockchain: ALL, filter: {frameUrl: {_eq: "https://farconic.xyz/cn-tower"}}}
    ) {
      Cast {
        castedAtTimestamp
        url
        text
        numberOfReplies
        numberOfRecasts
        numberOfLikes
        castedBy {
          profileName
          followerCount
        }
      }
    }
  }`

  const { data, error } = await fetchQuery(query, {
    "frameUrl": frameUrl
  })

  if (error) return error

  return data
}


/* const TrackFrameCasts = {
    FarcasterCasts(
      input: {blockchain: ALL, filter: {frameUrl: {_eq: "https://farconic.xyz/cn-tower"}}}
    ) {
      Cast {
        castedAtTimestamp
        text
        castedBy {
          profileName
          socialCapital {
            socialCapitalRank
          }
          location
          followerCount
        }
        frame {
          frameUrl
        }
        fid
      }
    }
  } */
/* 
import { init, useQuery } from "@airstack/airstack-react"

init("api-key"); */

// example for component:
/* const runQuery = (query:string, variables:any) => {
  const { data, loading, error } = useQuery(query, variables, { cache: false });

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  // Render your component using the data returned by the query
}; */