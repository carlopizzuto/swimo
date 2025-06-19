"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Calendar, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { SwipeHistoryItem } from "@/lib/types"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"

export default function WatchlistPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [likedMovies, setLikedMovies] = useState<SwipeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
  }, [isAuthenticated, router])

  // Load liked movies from swipe history
  useEffect(() => {
    const loadLikedMovies = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const swipeHistory = await api.swipes.getSwipeHistory(user.id)
        const liked = swipeHistory.filter(item => item.direction === true)
        setLikedMovies(liked)
      } catch (error) {
        console.error('Failed to load liked movies:', error)
        setError('Failed to load your liked movies')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadLikedMovies()
    }
  }, [user])

  const removeFromLiked = async (movieId: number) => {
    if (!user) return

    try {
      await api.swipes.deleteSwipe(user.id, movieId)
      setLikedMovies(likedMovies.filter(item => item.movie_id !== movieId))
    } catch (error) {
      console.error('Failed to remove movie:', error)
      setError('Failed to remove movie from liked list')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
      <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600/30">
          <Heart className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Liked Movies</h1>
        <p className="text-gray-400">Movies you've swiped right on</p>
      </div>

      {error && (
        <Alert className="bg-red-900/20 border-red-900/50 text-red-400 mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {likedMovies.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            {likedMovies.length} movie{likedMovies.length !== 1 ? "s" : ""} liked
          </p>
        </div>
      )}

      {likedMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {likedMovies.map((item) => (
            <Card key={item.movie_id} className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors">
              <div className="relative h-64">
                <Image
                  src={item.movie.poster_url || "/placeholder.svg"}
                  alt={item.movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {item.movie.score && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{item.movie.score.toFixed(1)}</span>
                  </div>
                )}
                <Button
                  onClick={() => removeFromLiked(item.movie_id)}
                  size="sm"
                  className="absolute top-3 left-3 w-8 h-8 rounded-full p-0 bg-red-600 hover:bg-red-700"
                  title="Remove from liked"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{item.movie.title}</h3>

                <div className="flex items-center gap-3 text-gray-400 mb-3 text-sm">
                  {item.movie.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.movie.year}</span>
                    </div>
                  )}
                  {item.ts && (
                    <div className="text-xs text-gray-500">
                      Liked {new Date(item.ts).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {item.movie.genres && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.movie.genres.split(',').slice(0, 2).map((genre, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 bg-green-600/20 text-green-400 text-xs border border-green-600/30"
                      >
                        {genre.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-gray-300 text-sm line-clamp-3">
                  {item.movie.overview || "No description available"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No liked movies yet</h3>
          <p className="text-gray-400 mb-4">Start swiping right on movies you like!</p>
          <div className="text-sm text-gray-500">
            <p className="mb-1">Mobile: Swipe right on movie cards</p>
            <p>Desktop: Press → arrow key or swipe up for watchlist</p>
          </div>
          <Button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Start Swiping
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
