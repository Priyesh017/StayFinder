"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, User, Globe, Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-rose-500">StayFinder</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-gray-700 hover:text-gray-900 font-medium">
              Explore
            </Link>
            <Link href="/host" className="text-gray-700 hover:text-gray-900 font-medium">
              Become a host
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>EN</span>
            </Button>

            {user && (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">2</Badge>
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 rounded-full px-3 py-2">
                  <Menu className="h-4 w-4" />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user ? user.firstName.charAt(0) : <User className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/favorites">Favorites</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.isHost && (
                      <DropdownMenuItem asChild>
                        <Link href="/host">Host Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/host">Become a host</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Help Center</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign up</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Log in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/host">Become a host</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Help Center</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
