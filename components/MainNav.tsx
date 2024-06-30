'use client'
import { usePathname } from 'next/navigation'
import Link from "next/link"

export const MainNav = () => {

    const ActiveLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
        //const router = useRouter()
        const isActive = usePathname() === href
      
        return (
          <Link href={href} className={isActive ? 'active' : ''}>{children}</Link>
        )
    }

    return (
        <nav className="w-fit flex items-start lg:items-center">
            <ul className="flex gap-x-4 text-lg lg:text-3xl">
              <li>
                <ActiveLink href="/gallery">Gallery</ActiveLink>
              </li>
              <li>
                <ActiveLink href="/about">About</ActiveLink>
              </li>
              <li>
                <ActiveLink href="/team">Team</ActiveLink>
              </li>
            </ul>
          </nav>
    )
}