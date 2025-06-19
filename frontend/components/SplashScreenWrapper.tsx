"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import SplashScreen from './SplashScreen'

interface SplashScreenWrapperProps {
  children: React.ReactNode
}

export default function SplashScreenWrapper({ children }: SplashScreenWrapperProps) {
  const [showSplash, setShowSplash] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Show splash only on root path and if user hasn't seen it this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (pathname === '/' && hasSeenSplash !== 'true') {
      setShowSplash(true)
    } else {
      setShowSplash(false)
    }
  }, [pathname])

  const handleEnterApp = () => {
    sessionStorage.setItem('hasSeenSplash', 'true')
    setShowSplash(false)
    // Push a new history entry so back button works
    router.push('/?entered=true')
  }

  // Handle browser back button - reset splash screen state
  useEffect(() => {
    const handlePopState = () => {
      if (pathname === '/' && !window.location.search.includes('entered=true')) {
        // User navigated back to root without the entered parameter
        sessionStorage.removeItem('hasSeenSplash')
        setShowSplash(true)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname])

  if (showSplash) {
    return <SplashScreen onEnter={handleEnterApp} />
  }

  return <>{children}</>
} 