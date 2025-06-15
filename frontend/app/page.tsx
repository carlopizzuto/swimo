"use client"

import { useState, useEffect, useCallback } from "react"
import MovieCard from "@/components/MovieCard"
import type { Movie } from "@/lib/types"
import { getMovies } from "@/lib/movies"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedMovies, setLikedMovies] = useState<string[]>([])
  const [dislikedMovies, setDislikedMovies] = useState<string[]>([])
  const [watchlistMovies, setWatchlistMovies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMovies = async () => {
      const movieData = await getMovies()
      setMovies(movieData)
      setIsLoading(false)
    }
    loadMovies()

    // Load preferences from localStorage
    const saved = localStorage.getItem("moviePreferences")
    if (saved) {
      const { liked, disliked, watchlist } = JSON.parse(saved)
      setLikedMovies(liked || [])
      setDislikedMovies(disliked || [])
      setWatchlistMovies(watchlist || [])
    }
  }, [])

  const savePreferences = (liked: string[], disliked: string[], watchlist: string[]) => {
    localStorage.setItem("moviePreferences", JSON.stringify({ liked, disliked, watchlist }))
  }

  const handleLike = useCallback(() => {
    if (currentIndex < movies.length) {
      const movieId = movies[currentIndex].id
      const newLiked = [...likedMovies, movieId]
      setLikedMovies(newLiked)
      savePreferences(newLiked, dislikedMovies, watchlistMovies)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, movies, likedMovies, dislikedMovies, watchlistMovies])

  const handleDislike = useCallback(() => {
    if (currentIndex < movies.length) {
      const movieId = movies[currentIndex].id
      const newDisliked = [...dislikedMovies, movieId]
      setDislikedMovies(newDisliked)
      savePreferences(likedMovies, newDisliked, watchlistMovies)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, movies, likedMovies, dislikedMovies, watchlistMovies])

  const handleWatchlist = useCallback(() => {
    if (currentIndex < movies.length) {
      const movieId = movies[currentIndex].id
      const newWatchlist = [...watchlistMovies, movieId]
      setWatchlistMovies(newWatchlist)
      savePreferences(likedMovies, dislikedMovies, newWatchlist)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, movies, likedMovies, dislikedMovies, watchlistMovies])

  const handleSwipe = (direction: "left" | "right" | "up") => {
    if (direction === "right") {
      handleLike()
    } else if (direction === "left") {
      handleDislike()
    } else if (direction === "up") {
      handleWatchlist()
    }
  }

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
                <Button onClick={() => setCurrentIndex(0)} className="bg-blue-600 hover:bg-blue-700">
                  Start Over
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
