"use client"

import { useState, useEffect } from "react"
import { Bookmark, Calendar, Clock, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Movie } from "@/lib/types"
import { getMovies } from "@/lib/movies"
import Image from "next/image"

export default function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const movieData = await getMovies()
      setMovies(movieData)

      // Load watchlist from localStorage
      const saved = localStorage.getItem("moviePreferences")
      if (saved) {
        const { watchlist } = JSON.parse(saved)
        const watchlistMovieData = movieData.filter((movie) => watchlist?.includes(movie.id))
        setWatchlistMovies(watchlistMovieData)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  const removeFromWatchlist = (movieId: string) => {
    const saved = localStorage.getItem("moviePreferences")
    const preferences = saved ? JSON.parse(saved) : { liked: [], disliked: [], watchlist: [] }

    const newWatchlist = preferences.watchlist.filter((id: string) => id !== movieId)
    preferences.watchlist = newWatchlist

    localStorage.setItem("moviePreferences", JSON.stringify(preferences))
    setWatchlistMovies(watchlistMovies.filter((movie) => movie.id !== movieId))
  }

  const clearWatchlist = () => {
    const saved = localStorage.getItem("moviePreferences")
    const preferences = saved ? JSON.parse(saved) : { liked: [], disliked: [], watchlist: [] }
    preferences.watchlist = []
    localStorage.setItem("moviePreferences", JSON.stringify(preferences))
    setWatchlistMovies([])
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
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-600/30">
          <Bookmark className="w-12 h-12 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your Watchlist</h1>
        <p className="text-gray-400">Movies you want to watch later</p>
      </div>

      {watchlistMovies.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            {watchlistMovies.length} movie{watchlistMovies.length !== 1 ? "s" : ""} in watchlist
          </p>
          <Button
            onClick={clearWatchlist}
            variant="outline"
            size="sm"
            className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

      {watchlistMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlistMovies.map((movie) => (
            <Card key={movie.id} className="bg-gray-800 border-gray-700 overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={movie.poster || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold">{movie.rating}</span>
                </div>
                <Button
                  onClick={() => removeFromWatchlist(movie.id)}
                  size="sm"
                  className="absolute top-3 left-3 w-8 h-8 rounded-full p-0 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{movie.title}</h3>

                <div className="flex items-center gap-3 text-gray-400 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{movie.duration}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {movie.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-600/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">{movie.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
          <p className="text-gray-400 mb-4">Swipe up on movies to add them to your watchlist!</p>
          <div className="text-sm text-gray-500">
            <p className="mb-1">Mobile: Swipe up on movie cards</p>
            <p>Desktop: Press ↑ arrow key</p>
          </div>
        </div>
      )}
    </div>
  )
}
