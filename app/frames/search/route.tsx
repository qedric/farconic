/* eslint-disable react/jsx-key, @next/next/no-img-element, jsx-a11y/alt-text */
import { Button } from "frames.js/next"
import { frames } from "../frames"
import { searchJsonArray, getFavouriteBuildings, getTokenBalancesForAddresses } from '@/lib/utils'
import { CardImage } from '@/components/FrameCard'
import { getUserDataForFid } from 'frames.js'

const handleRequest = frames(async (ctx: any) => {

    let searchTerm = ctx.searchParams?.searchTerm || ctx.message.inputText

    // there is a search term, find matches in the metadata
    if (searchTerm) {
        const searchResults = searchJsonArray(searchTerm)

        //console.log('results', searchResults)

        let page: number = ctx.searchParams?.page ? parseInt(ctx.searchParams.page) : 1
        
        //console.log('currentBuilding:', currentBuilding)
        //console.log('page:', page)

        if (searchResults.length == 0) {
            console.log('no results')
            // add getFavouriteBuildings() to the search results
            searchResults.push(...getFavouriteBuildings().sort(() => Math.random() - 0.5))
        }

        const building = searchResults[page-1]

        // find how many of this building the user has among their verified addresses
        const addresses = ctx.message?.requesterVerifiedAddresses || []
        const { balances, totalBalance } = await getTokenBalancesForAddresses(building.address as `0x${string}`, addresses)

        // get the userData to load PFP on the card
        const userData = await getUserDataForFid({ fid: (ctx.message?.requesterFid as number) })

        //console.log(`balance:`, balance)

        return {
            image: await CardImage( searchResults[page-1], userData?.profileImage, userData?.username, undefined),
            imageOptions: {
                aspectRatio: "1:1",
            },
            textInput: "Search, or Set Buy/Sell Quantity",
            headers: {  
                "Cache-Control": "max-age=0", 
            },
            state: { searchMode: true },
            buttons: searchResults.length == 1 // just one result
            ?   [
                    <Button action={ totalBalance > 0 ? 'post' : 'link' } target={ totalBalance > 0 ? { query: { building: JSON.stringify(building), isSell:true, balances:JSON.stringify(balances) }, pathname: "/trade/" } : "https://farconic.xyz" }>
                        { totalBalance > 0 ? 'Sell 💰' : 'App 🌐' }
                    </Button>,
                    <Button action="post" target={{ query: { building: JSON.stringify(building) }, pathname: "/trade/" }}>
                        Buy 🛒
                    </Button>,
                    <Button action="post" target={{ query: { searchTerm: 'random' }, pathname: "/search" }}>
                        Random 🎲
                    </Button>,
                    <Button action="post" target="/search">
                        Search 🔎
                    </Button>
                ]
            :   page > 1 && searchResults.length > page // multiple results and we are somewhere in the middle
                ?   [
                        <Button action="post" target={{ query: { building: JSON.stringify(building), balances:JSON.stringify(balances) }, pathname: "/trade/" }}>
                            { totalBalance > 0 ? 'Buy/Sell' : 'Buy 🛒' }
                        </Button>,
                        <Button action="post" target={{ query: { page: page-1, searchTerm: searchTerm }, pathname: "/search" }}>
                            ◀ Prev
                        </Button>,
                        <Button action="post" target={{ query: { page: page+1, searchTerm: searchTerm }, pathname: "/search" }}>
                            Next ▶
                        </Button>,
                        <Button action="post" target="/search">
                            Search 🔎
                        </Button>
                    ]
                :   page > 1 && searchResults.length == page // multiple results and we are at the end
                    ?   [
                            <Button action="post" target={{ query: { building: JSON.stringify(building) }, pathname: "/trade/" }}>
                                Buy 🛒
                            </Button>,
                            <Button action="post" target={ totalBalance > 0 ? { query: { building: JSON.stringify(building), isSell:true, balances:JSON.stringify(balances) }, pathname: "/trade/" } : "/farconic" }>
                                { totalBalance > 0 ? 'Sell 💰' : 'Home' }
                            </Button>,
                            <Button action="post" target={{ query: { page: page-1, searchTerm: searchTerm }, pathname: "/search" }}>
                                ◀ Prev
                            </Button>,
                            <Button action="post" target="/search">
                                Search 🔎
                            </Button>
                        ]
                    :   [ // multiple results and we are at the start
                            <Button action="post" target={{ query: { building: JSON.stringify(building) }, pathname: "/trade/" }}>
                                Buy 🛒
                            </Button>,
                            <Button action="post" target={ totalBalance > 0 ? { query: { building: JSON.stringify(building), isSell:true, balances:JSON.stringify(balances) }, pathname: "/trade/" } : "/farconic" }>
                                { totalBalance > 0 ? 'Sell 💰' : 'Home' }
                            </Button>,
                            <Button action="post" target={{ query: { page: page+1, searchTerm: searchTerm }, pathname: "/search" }}>
                                Next ▶
                            </Button>,
                            <Button action="post" target="/search">
                                Search 🔎
                            </Button>
                        ]
        }
    }

    return { 
        image: (
            <div tw="flex w-full h-full" style={{ translate: '200%', backgroundSize: '100% 100%', backgroundImage: `url(${process.env.NEXT_PUBLIC_GATEWAY_URL}/QmT4qQyVaCaYj5NPSK3RnLTcDp1J7cZpSj4RkVGG1fjAos)`}}>
                <div tw="flex flex-col px-20 justify-center items-center">
                    <h1 tw="text-[50px] mb-5 leading-6">Search for a building</h1>
                    <p tw="text-[30px] text-center">or enter a keyword like &apos;bridge&apos;, &apos;Shanghai&apos;, or perhaps &apos;magnificent Flemish Renaissance style building&apos;</p>
                </div>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1:1",
        },
        textInput: "e.g. 'Bridge', 'Rome', 'Eiffel'",
        buttons: [
            <Button action="post" target="/farconic">
                Home
            </Button>,
            <Button action="post" target={{ query: { searchTerm: 'random' }, pathname: "/search" }}>
                Random 🎲
            </Button>,
            <Button action="post" target="/search">
                Search 🔎
            </Button>
        ],
        headers: {  
            "Cache-Control": "max-age=0", 
        },
        state: { searchMode: true }
    }
})

export const GET = handleRequest
export const POST = handleRequest