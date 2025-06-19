"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import MovieCard from "@/components/MovieCard"
import type { Movie } from "@/lib/types"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const RECOMMENDATION_CONFIG = {
  INITIAL_BATCH: 5,
  REFILL_BATCH: 4,
  REFILL_TRIGGER: 2, // Load more when this many movies left
  FALLBACK_BATCH: 3, // Number of random movies to get as fallback
} as const

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
      return
    }
  }, [authLoading, isAuthenticated, router])

  // Load movies (recommendations if user has swipe history, otherwise random)
  useEffect(() => {
    const loadMovies = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)
      
      try {
        // Try to get recommendations first
        let movieData: Movie[] = []
        try {
          movieData = await api.movies.getRecommendations(user.id, RECOMMENDATION_CONFIG.INITIAL_BATCH)
        } catch (error) {
          console.log('No recommendations available, falling back to random movies')
          // If recommendations fail (e.g., no swipe history), get random movies
          for (let i = 0; i < RECOMMENDATION_CONFIG.FALLBACK_BATCH; i++) {
            try {
              const randomMovie = await api.movies.getRandomMovie()
              // Avoid duplicates
              if (!movieData.find(m => m.id === randomMovie.id)) {
                movieData.push(randomMovie)
              }
            } catch (e) {
              console.error('Failed to fetch random movie:', e)
            }
          }
        }
        
        setMovies(movieData)
        setCurrentIndex(0)
      } catch (error) {
        console.error('Failed to load movies:', error)
        setError('Failed to load movies. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadMovies()
    }
  }, [user])

  const handleSwipe = useCallback(async (direction: "left" | "right" | "up") => {
    if (!user || currentIndex >= movies.length) return

    const currentMovie = movies[currentIndex]
    const isLike = direction === "right"
    const isWatchlist = direction === "up"

    try {
      // For "up" swipe (watchlist), we'll treat it as a like for now
      // since the backend doesn't have a separate watchlist concept
      await api.swipes.createSwipe({
        user_id: user.id,
        movie_id: currentMovie.id,
        direction: isLike || isWatchlist, // both like and watchlist are "true"
      })

      // Move to next movie
      setCurrentIndex(currentIndex + 1)

      // If we're running low on movies, try to load more recommendations
      if (currentIndex + RECOMMENDATION_CONFIG.REFILL_TRIGGER >= movies.length) {
        try {
          const moreMovies = await api.movies.getRecommendations(user.id, RECOMMENDATION_CONFIG.REFILL_BATCH)
          // Filter out movies we've already seen
          const seenMovieIds = new Set(movies.map(m => m.id))
          const newMovies = moreMovies.filter(m => !seenMovieIds.has(m.id))
          if (newMovies.length > 0) {
            setMovies(prev => [...prev, ...newMovies])
          }
        } catch (error) {
          console.log('Could not load more recommendations')
        }
      }
    } catch (error) {
      console.error('Failed to save swipe:', error)
      // Still move to next movie even if save failed
      setCurrentIndex(currentIndex + 1)
    }
  }, [user, currentIndex, movies])

  const handleLike = useCallback(() => handleSwipe("right"), [handleSwipe])
  const handleDislike = useCallback(() => handleSwipe("left"), [handleSwipe])
  const handleWatchlist = useCallback(() => handleSwipe("up"), [handleSwipe])

  // Keyboard controls for desktop
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleDislike()
      } else if (event.key === "ArrowRight") {
        handleLike()
      } else if (event.key === "ArrowUp") {
        handleWatchlist()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleLike, handleDislike, handleWatchlist])

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-8 md:py-16">
      <div className="text-center mb-8 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">SWIMO</h1>
        <p className="text-gray-400">Swipe to discover your next favorite movie</p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full">
        <div className="relative h-full md:h-[400px] mb-8 md:mb-8">
          {currentIndex < movies.length ? (
            <>
              {/* Next card (behind) */}
              {currentIndex + 1 < movies.length && (
                <div className="absolute inset-0 transform scale-95 opacity-30">
                  <MovieCard movie={movies[currentIndex + 1]} onSwipe={() => {}} isActive={false} />
                </div>
              )}

              {/* Current card */}
              <div className="absolute inset-0">
                <MovieCard movie={movies[currentIndex]} onSwipe={handleSwipe} isActive={true} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-2xl border border-gray-700">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">No more movies!</h2>
                <p className="text-gray-400 mb-6">You've seen all available movies</p>
                <Button 
                  onClick={() => {
                    setCurrentIndex(0)
                    setMovies([])
                    // This will trigger the useEffect to reload movies
                  }} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Get More Recommendations
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop instructions only */}
        <div className="hidden md:block text-center text-gray-400 text-sm">
          Use ← → ↑ arrow keys to dislike/like/watchlist movies
        </div>
      </div>
    </div>
  )
}
