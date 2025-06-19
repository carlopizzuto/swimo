import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import AuthGuard from "@/components/AuthGuard"
import RouteHandler from "@/components/RouteHandler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SWIMO - Swipe Movies",
  description:
    "Swipe to discover your next favorite movie. Find movies you'll love with our intuitive matching system.",
  keywords: "movies, film, recommendations, swipe, discover, entertainment",
  authors: [{ name: "SWIMO Team" }],
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.className} bg-gray-900`}>
        <AuthProvider>
          <AuthGuard>
            <RouteHandler>
              {children}
            </RouteHandler>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
