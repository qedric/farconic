'use client'
import { useEffect, useState } from 'react'
import { useWallet, WalletProvider } from "@/context/WalletContext"
import WalletConnect from "@/components/WalletConnect"
import { getAllUsers, type User } from '@/app/api/mongodb'
import UsersComponent from '@/components/Users'

const AdminContent = () => {

    const { address, isAdmin } = useWallet()  // Use the context values
    const [users, setUsers] = useState<User[] | null>(null)

    useEffect(() => {
        if (isAdmin) {
            getUsers().then(users => setUsers(JSON.parse(users)))
        }
    }, [isAdmin])

    const getUsers = async () => await getAllUsers()

    return (
        <section className="w-full">
            {address && isAdmin 
                ? (
                    <>
                        <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                            <h4>You&apos;ve reached the admin zone</h4>
                        </div>
                        { users && 
                            <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
                                <UsersComponent users={users} />
                            </div>
                        }
                    </>                    
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
            <WalletConnect targetId='WalletConnect' />
            <AdminContent />
        </WalletProvider>
    )
}