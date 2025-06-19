"use client"

import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/SplashScreen'

export default function SplashPage() {
  const router = useRouter()

  const handleEnterApp = () => {
    // Just navigate to auth - splash should always be accessible
    router.push('/auth')
  }

  return <SplashScreen onEnter={handleEnterApp} />
} 