import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Montserrat } from 'next/font/google'
import "./globals.css"
import { MainNav } from "@/components/MainNav"

const montserratFont = Montserrat({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Farconic",
  description: "Collect buildings and claim cities!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${montserratFont.className} flex flex-col justify-between overflow-x-hidden`}>
        <header className="flex justify-between h-32 p-6">
          <Link href="/">
            <figure >
              <Image className="w-[180px] lg:w-[225px]" width="2560" height="128" src="/logo.png" priority={true} alt="logo" sizes="(max-width: 2560px) 100vw, 2560px" />
            </figure>
          </Link>
          <MainNav />
        </header>
        <main className="flex flex-col items-center justify-center mx-auto lg:w-[940px]">{children}</main>
        <footer className="bg-black">
          <figure >
            <Image width="2560" height="639" src="/bottom-strip-1.webp" alt="" sizes="(max-width: 2560px) 100vw, 2560px" />
          </figure>

          <div className="w-full lg:w-3/4 mx-auto flex flex-col lg:flex-row gap-y-6 justify-between my-5 lg:mb-12 lg:mt-2">
            <div className="flex flex-col gap-y-3 justify-center items-center">
              <figure >
                <Image width="100" height="100" src="/gil-alter-logo.webp" alt="" />
              </figure>
              <ul className="flex gap-x-4">
                <li className="stroke-white"><Link href="https://web3.gilalter.com" ><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M15.6,7.2H14v1.5h1.6c2,0,3.7,1.7,3.7,3.7s-1.7,3.7-3.7,3.7H14v1.5h1.6c2.8,0,5.2-2.3,5.2-5.2,0-2.9-2.3-5.2-5.2-5.2zM4.7,12.4c0-2,1.7-3.7,3.7-3.7H10V7.2H8.4c-2.9,0-5.2,2.3-5.2,5.2,0,2.9,2.3,5.2,5.2,5.2H10v-1.5H8.4c-2,0-3.7-1.7-3.7-3.7zm4.6.9h5.3v-1.5H9.3v1.5z"></path></svg></Link> </li>
                <li className="stroke-white"><Link href="https://x.com/gilalter" ><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387l-4.745-6.787Z"></path></svg></Link> </li>
                <li className="stroke-white fill-white"><Link href="https://facebook.com/gil.alter.7" ><svg className="fill-white" width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path></svg></Link> </li>
                <li className="stroke-white"><Link href="http://warpcast.com/gilalter.eth" ><Image width="22" height="20" src="/farconic-white-icon.webp" alt="Farcaster" sizes="(max-width: 22px) 100vw, 22px" /></Link> </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-3 justify-center items-center">
              <figure>
                <Image className="my-5" width="60" height="50" src="/yoni_alter_logo.webp" alt="" sizes="(max-width: 1024px) 100vw, 1024px" />
              </figure>
              <ul className="flex gap-x-4">
                <li className="stroke-white"><Link href="https://yoniishappy.com" ><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M15.6,7.2H14v1.5h1.6c2,0,3.7,1.7,3.7,3.7s-1.7,3.7-3.7,3.7H14v1.5h1.6c2.8,0,5.2-2.3,5.2-5.2,0-2.9-2.3-5.2-5.2-5.2zM4.7,12.4c0-2,1.7-3.7,3.7-3.7H10V7.2H8.4c-2.9,0-5.2,2.3-5.2,5.2,0,2.9,2.3,5.2,5.2,5.2H10v-1.5H8.4c-2,0-3.7-1.7-3.7-3.7zm4.6.9h5.3v-1.5H9.3v1.5z"></path></svg></Link> </li>
                <li className="stroke-white"><Link href="https://x.com/yonialter" ><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387l-4.745-6.787Z"></path></svg></Link> </li>
                <li className="fill-white stroke-0"><Link href="https://instagram.com/yonialter" >
                  <svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path>
                  </svg></Link> </li>
                <li className="stroke-white"><Link href="http://warpcast.com/gilalter.eth" ><Image width="22" height="20" src="/farconic-white-icon.webp" alt="Farcaster" sizes="(max-width: 22px) 100vw, 22px" /></Link> </li>
              </ul>
            </div>

            <div className="flex flex-col gap-y-6 justify-around items-center">
              <p className="text-sm"><strong className="text-white">In Collaboration with:</strong></p>
              <figure>
                <Link href="https://mint.club/"><Image className="my-2 lg:mt-0 w-[35vw] lg:w-[8vw]" width="1000" height="1000" src="/mintclub.webp" alt="" sizes="(max-width: 612px) 100vw, 612px" /></Link>
              </figure>
            </div>
          </div>

          <div className="my-5">
            <p className="text-center text-sm"><strong className="text-white">Shapes of Cities Featured in:</strong></p>
            <div className="px-14 lg-px-0 mx-auto my-10 lg:mt-8 flex flex-col lg:flex-row gap-y-8 justify-center">
              <div className="w-fit mr-4 flex gap-x-10 lg:gap-x-8 justify-center items-center">
                <figure ><Link href="https://www.thisiscolossal.com/2014/05/colorful-city-silhouette-prints-by-yoni-alter/"><Image className="w-24" width="1000" height="188" src="/colossal-logo.webp" alt="" sizes="(max-width: 1000px) 100vw, 1000px" /></Link> </figure>
                <figure ><Link href="https://www.fastcompany.com/3029992/city-landmarks-distilled-into-their-basic-shapes"><Image className="w-24" width="567" height="89" src="/fastcompany.webp" alt="" sizes="(max-width: 567px) 100vw, 567px" /></Link> </figure>
                <figure ><Link href="https://gizmodo.com/these-gorgeous-screenprints-showcase-a-citys-most-famo-1540461547"><Image className="w-24" width="982" height="148" src="/gizmodo-logo.webp" alt="" sizes="(max-width: 982px) 100vw, 982px" /></Link> </figure>
                <figure ><Link href="https://www.creativereview.co.uk/work/submission-shapes-cities-game/"><Image className="w-24" width="436" height="230" src="/creative_review.webp" alt="" sizes="(max-width: 436px) 100vw, 436px" /></Link> </figure>
              </div>
              <div className="ml-4 flex gap-x-10 lg:gap-x-8 justify-center items-center">
                <figure ><Link href="widewalls.ch/artists/yoni-alter"><Image className="w-24" width="504" height="100" src="/widewalls.webp" alt="" sizes="(max-width: 504px) 100vw, 504px" /></Link> </figure>
                <figure ><Link href="https://www.printmag.com/color-design/famous-skylines-interpreted-with-art/"><Image className="w-24" width="704" height="216" src="/print.webp" alt="" sizes="(max-width: 704px) 100vw, 704px" /></Link> </figure>
                <figure ><Link href="https://www.designweek.co.uk/inspiration/shapes-cities-app-yoni-alter/"><Image className="w-24" width="354" height="160" src="/design_week.webp" alt="" sizes="(max-width: 354px) 100vw, 354px" /></Link> </figure>
                <figure ><Link href="designboom.com/design/shapes-of-cities-yoni-alter-09-10-2015/"><Image className="w-24" width="2400" height="1200" src="/design_boom.webp" alt="" sizes="(max-width: 2400px) 100vw, 2400px" /></Link> </figure>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
