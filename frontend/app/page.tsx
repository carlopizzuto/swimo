"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/lib/constants'
import LoadingSpinner from '@/components/LoadingSpinner'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function RootPage() {
  const router = useRouter()
  const { isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      // Always redirect to splash, regardless of auth status
      // Let the splash page handle the user flow naturally
      router.replace(ROUTES.SPLASH)
    }
  }, [isLoading, router])

  // Show loading while auth is initializing
  return <LoadingSpinner />
} 