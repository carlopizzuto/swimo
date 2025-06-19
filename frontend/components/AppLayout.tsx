"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "./Navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setIsAuthenticated(userData.isAuthenticated)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated === false && pathname !== "/auth" && pathname !== "/splash") {
      router.push("/auth")
    }
  }, [isAuthenticated, pathname, router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show auth and splash pages without navigation
  if (pathname === "/auth" || pathname === "/splash") {
    return <>{children}</>
  }

  // Show main app with persistent navigation
  if (isAuthenticated) {
    return (
      <div className="mobile-container md:min-h-screen bg-gray-900">
        <Navigation />
        <main className="h-full md:pt-20 flex flex-col overflow-hidden mobile-main-content">{children}</main>
      </div>
    )
  }

  return null
}
