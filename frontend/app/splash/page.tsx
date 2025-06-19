"use client"

import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/SplashScreen'
import { ROUTES } from '@/lib/constants'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SplashPage() {
  const router = useRouter()

  const handleEnterApp = () => {
    router.push(ROUTES.AUTH)
  }

  return <SplashScreen onEnter={handleEnterApp} />
} 