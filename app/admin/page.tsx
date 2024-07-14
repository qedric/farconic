'use client'
import { useState } from 'react'
import mainnet_buildings from '@/data/buildings.json'
import testnet_buildings from '@/data/buildings_testnet.json'
import { useWallet, WalletProvider } from "@/context/WalletContext"
import WalletConnect from "@/components/WalletConnect"


const buildings = process.env.NEXT_PUBLIC_CHAIN == 'MAINNET' ? mainnet_buildings : testnet_buildings

const AdminContent = () => {
    const { address, isAdmin } = useWallet()  // Use the context values

    return (
        <section className="w-full">
            {address && isAdmin 
                ? (
                    <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                        <h4>You&apos;ve reached the admin zone</h4>
                    </div>
                )
                : (
                <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                   <h4>You need to be an admin to access this page</h4>
                </div>
                )}
        </section>
    )
}

export default function Admin() {
    return (
        <WalletProvider>
            <WalletConnect />
            <AdminContent />
        </WalletProvider>
    )
}