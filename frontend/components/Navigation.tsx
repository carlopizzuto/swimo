"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, User, Bookmark, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    router.push(ROUTES.AUTH)
  }

  // Don't show navigation if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: ROUTES.DISCOVER, icon: Home, label: "Discover" },
    { href: ROUTES.SEARCH, icon: Search, label: "Search" },
    { href: ROUTES.WATCHLIST, icon: Bookmark, label: "Watchlist" },
    { href: ROUTES.PROFILE, icon: User, label: "Profile" },
  ]

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-b border-gray-700 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={ROUTES.DISCOVER} className="text-2xl font-bold text-white">
                SWIMO
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "text-blue-400 bg-blue-600/20"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                )
              })}
              
              <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-700">
                <span className="text-gray-300 text-sm">Welcome, {user?.username}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-t border-gray-700 z-50 pb-safe">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-400 bg-blue-600/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
