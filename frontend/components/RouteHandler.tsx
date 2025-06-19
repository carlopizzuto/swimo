"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import AppLayout from "./AppLayout"
import { PUBLIC_ROUTES } from "@/lib/constants"

interface RouteHandlerProps {
  children: React.ReactNode
}

export default function RouteHandler({ children }: RouteHandlerProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname as any)
  const shouldShowNavigation = isAuthenticated && !isPublicRoute

  return (
    <AppLayout showNavigation={shouldShowNavigation}>
      {children}
    </AppLayout>
  )
} 