"use client"

import type React from "react"
import Navigation from "./Navigation"

interface AppLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export default function AppLayout({ children, showNavigation = false }: AppLayoutProps) {
  if (showNavigation) {
    return (
      <div className="mobile-container md:min-h-screen bg-gray-900">
        <Navigation />
        <main className="h-full md:pt-20 flex flex-col overflow-hidden mobile-main-content">
          {children}
        </main>
      </div>
    )
  }

  return <>{children}</>
}
