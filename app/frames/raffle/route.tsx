/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next"
import { frames } from "../frames"

const handleRequest = frames(async (ctx) => {

    return {
        image: (
            <div>
                <h1>🎉 Raffle 🎉</h1>
                <p>Coming soon...</p>
            </div>
        ),
        imageOptions: {
            aspectRatio: "1.91:1"
        },
        buttons: [
            <Button action="post" target='/raffle/joined'>
                Enter Raffle
            </Button>
        ],
        headers: {  
            "Cache-Control": "max-age=0", 
        }
    }
})

export const GET = handleRequest
export const POST = handleRequest