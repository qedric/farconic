import type { Metadata } from "next"
import localFont from 'next/font/local'
import "./globals.css"

// load the Quicksand-Bold.ttf font from the public directory
const quicksandFont = localFont({
  src: '../public/Quicksand-Bold.ttf',
  display: 'swap',
  variable: '--font-quicksand',
})

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
      <body><main className={`${quicksandFont.className} flex items-center justify-center `}>{children}</main></body>
    </html>
  )
}