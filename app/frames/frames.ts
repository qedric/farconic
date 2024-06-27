import { createFrames } from "frames.js/next"
import { farcasterHubContext } from "frames.js/middleware"
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker"

export type State = {
  searchMode: boolean
}

export const frames = createFrames<State>({
  basePath: "/frames",
  initialState: { searchMode: false },
  middleware: [
    farcasterHubContext({
      ...(process.env.NODE_ENV === "production"
        ? {
            hubHttpUrl: "https://hubs.airstack.xyz",
            hubRequestOptions: {
              headers: {
                "x-airstack-hubs": process.env.AIRSTACK_API_KEY as string,
              },
            },
          }
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
    imagesWorkerMiddleware({
      imagesRoute: "/images"
    }),
  ],
})