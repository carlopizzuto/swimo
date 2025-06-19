"use client"

import SplashScreen from '@/components/SplashScreen'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/lib/constants'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleEnterApp = () => {
    if (isAuthenticated) {
      // User is already logged in, go straight to discover
      router.push(ROUTES.DISCOVER)
    } else {
      // User needs to authenticate first
      router.push(ROUTES.AUTH)
    }
  }

  return <SplashScreen onEnter={handleEnterApp} />
} 