"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"
import { ROUTES } from "@/lib/constants"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Don't apply any auth logic to the root page - let it handle its own flow
  if (pathname === ROUTES.HOME) {
    return <>{children}</>
  }

  // Routes that require authentication
  const protectedRoutes = [ROUTES.DISCOVER, ROUTES.SEARCH, ROUTES.WATCHLIST, ROUTES.PROFILE]
  const isProtectedRoute = protectedRoutes.includes(pathname as any)

  // Show loading while auth is initializing
  if (isLoading) {
    return <LoadingSpinner />
  }

  // If trying to access a protected route without authentication, redirect to auth
  if (isProtectedRoute && !isAuthenticated) {
    router.replace(ROUTES.AUTH)
    return <LoadingSpinner />
  }

  // If authenticated user tries to access auth page, redirect to discover
  if (pathname === ROUTES.AUTH && isAuthenticated) {
    router.replace(ROUTES.DISCOVER)
    return <LoadingSpinner />
  }

  return <>{children}</>
} 