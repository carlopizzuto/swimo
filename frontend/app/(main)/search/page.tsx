"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Movie } from "@/lib/types"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"

export default function SearchPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
  }, [isAuthenticated, router])

  // Load movies (get a batch of random movies for searching)
  useEffect(() => {
    const loadMovies = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Since we don't have a search endpoint, get multiple random movies
        const moviePromises = Array.from({ length: 20 }, () => api.movies.getRandomMovie())
        const movieResults = await Promise.allSettled(moviePromises)
        
        const uniqueMovies: Movie[] = []
        const seenIds = new Set<number>()
        
        movieResults.forEach(result => {
          if (result.status === 'fulfilled' && !seenIds.has(result.value.id)) {
            uniqueMovies.push(result.value)
            seenIds.add(result.value.id)
          }
        })
        
        setMovies(uniqueMovies)
        setFilteredMovies(uniqueMovies)
      } catch (error) {
        console.error('Failed to load movies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadMovies()
    }
  }, [user])

  // Filter movies based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMovies(movies)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(query) ||
      (movie.overview && movie.overview.toLowerCase().includes(query)) ||
      (movie.genres && movie.genres.toLowerCase().includes(query))
    )
    setFilteredMovies(filtered)
  }, [searchQuery, movies])

  const loadMoreMovies = async () => {
    if (!user) return

    try {
      const moviePromises = Array.from({ length: 10 }, () => api.movies.getRandomMovie())
      const movieResults = await Promise.allSettled(moviePromises)
      
      const newMovies: Movie[] = []
      const existingIds = new Set(movies.map(m => m.id))
      
      movieResults.forEach(result => {
        if (result.status === 'fulfilled' && !existingIds.has(result.value.id)) {
          newMovies.push(result.value)
        }
      })
      
      if (newMovies.length > 0) {
        setMovies(prev => [...prev, ...newMovies])
      }
    } catch (error) {
      console.error('Failed to load more movies:', error)
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Search Movies</h1>
        <p className="text-gray-400">Discover movies from our collection</p>
      </div>

      {/* Search bar */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by title, description, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-400">
          {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} found
        </p>
        <Button 
          onClick={loadMoreMovies}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Load More Movies
        </Button>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:bg-gray-750 transition-colors">
              <div className="relative h-64">
                <Image
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                {movie.score && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{movie.score.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{movie.title}</h3>

                {movie.year && (
                  <div className="flex items-center gap-1 text-gray-400 mb-3 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.year}</span>
                  </div>
                )}

                {movie.genres && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.genres.split(',').slice(0, 2).map((genre, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs border border-blue-600/30"
                      >
                        {genre.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-gray-300 text-sm line-clamp-3">
                  {movie.overview || "No description available"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
          <p className="text-gray-400 mb-4">Try a different search term or load more movies</p>
        </div>
      )}
      </div>
    </div>
  )
}
