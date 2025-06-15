"use client"

import { useState } from "react"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { Star, Calendar, Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MovieGridProps {
  movies: Movie[]
}

export default function MovieGrid({ movies }: MovieGridProps) {
  const [likedMovies, setLikedMovies] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("moviePreferences")
      if (saved) {
        const { liked } = JSON.parse(saved)
        return liked || []
      }
    }
    return []
  })

  const handleLike = (movieId: string) => {
    const newLiked = likedMovies.includes(movieId)
      ? likedMovies.filter((id) => id !== movieId)
      : [...likedMovies, movieId]

    setLikedMovies(newLiked)

    // Update localStorage
    const saved = localStorage.getItem("moviePreferences")
    const preferences = saved ? JSON.parse(saved) : { liked: [], disliked: [] }
    preferences.liked = newLiked
    localStorage.setItem("moviePreferences", JSON.stringify(preferences))
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
        <p className="text-gray-400">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:bg-slate-750 transition-all duration-300"
        >
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
              onClick={() => handleLike(movie.id)}
              size="sm"
              className={`absolute top-3 left-3 w-8 h-8 rounded-full p-0 ${
                likedMovies.includes(movie.id) ? "bg-orange-500 hover:bg-orange-600" : "bg-black/50 hover:bg-black/70"
              }`}
            >
              <Heart className={`w-4 h-4 ${likedMovies.includes(movie.id) ? "fill-white" : ""}`} />
            </Button>
          </div>

          <div className="p-4">
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
                  className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded-full text-xs border border-orange-600/30"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-gray-300 text-sm line-clamp-2">{movie.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
