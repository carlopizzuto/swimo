"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"
import { PUBLIC_ROUTES, ROUTES } from "@/lib/constants"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname as any)

  // Wait for auth context to initialize
  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true)
    }
  }, [isLoading])

  // Handle authentication redirects
  useEffect(() => {
    if (!isInitialized) return

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.replace(ROUTES.AUTH)
      return
    }

    // If authenticated and on public route (except root), redirect to main app
    if (isAuthenticated && (pathname === ROUTES.AUTH || pathname === ROUTES.SPLASH)) {
      router.replace(ROUTES.DISCOVER)
      return
    }
  }, [isAuthenticated, isInitialized, isPublicRoute, pathname, router])

  // Show loading while initializing
  if (!isInitialized) {
    return <LoadingSpinner />
  }

  return <>{children}</>
} 