'use client'
import { useEffect, useState } from 'react'
import { useWallet, WalletProvider } from "@/context/WalletContext"
import WalletConnect from "@/components/WalletConnect"
import UsersComponent from '@/components/Users'
import { getAllUsers, type User } from '@/app/api/mongodb'

const AdminContent = async () => {
    const { address, isAdmin } = useWallet()
    const [users, setUsers] = useState<User[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (address && isAdmin) {
            getUsers()
                .then(users => setUsers(JSON.parse(users)))
                .catch(err => setError("Failed to load users."))
        } else if (address && !isAdmin) {
            setError("You do not have permission to access this content.")
        }
    }, [address, isAdmin])

    const getUsers = async () => await getAllUsers()
    
    return (
        <section className="w-full">
            {address && isAdmin 
                ? (
                    <>
                        <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                            <h4>You&apos;ve reached the admin zone</h4>
                        </div>
                        { users ? (
                            <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                                <UsersComponent users={users} />
                            </div>
                        ) : (
                            <p>Loading users...</p>
                        )}
                    </>
                )
                : (
                <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                   <h4>{error || "You need to be an admin to access this page"}</h4>
                </div>
                )}
        </section>
    )
}

export default function Admin() {
    return (
        <WalletProvider>
            <WalletConnect targetId='WalletConnect' />
            <AdminContent />
        </WalletProvider>
    )
}