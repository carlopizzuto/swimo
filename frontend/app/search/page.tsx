"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MovieGrid from "@/components/MovieGrid"
import type { Movie } from "@/lib/types"
import { getMovies } from "@/lib/movies"

export default function SearchPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMovies = async () => {
      const movieData = await getMovies()
      setMovies(movieData)
      setFilteredMovies(movieData)
      setIsLoading(false)
    }
    loadMovies()
  }, [])

  useEffect(() => {
    let filtered = movies

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((movie) => movie.genres.includes(selectedGenre))
    }

    // Filter by year range
    if (startYear || endYear) {
      filtered = filtered.filter((movie) => {
        const movieYear = movie.year
        const start = startYear ? Number.parseInt(startYear) : 0
        const end = endYear ? Number.parseInt(endYear) : 9999
        return movieYear >= start && movieYear <= end
      })
    }

    setFilteredMovies(filtered)
  }, [searchQuery, selectedGenre, startYear, endYear, movies])

  const genres = ["all", ...Array.from(new Set(movies.flatMap((movie) => movie.genres)))]

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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Search Movies</h1>
        <p className="text-gray-400">Find your perfect movie match</p>
      </div>

      {/* Search and filters */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre} className="text-white hover:bg-slate-700">
                    {genre === "all" ? "All Genres" : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <Input
              type="number"
              placeholder="Start Year"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
              min="1900"
              max="2030"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <Input
              type="number"
              placeholder="End Year"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500"
              min="1900"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-400">
          {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <MovieGrid movies={filteredMovies} />
    </div>
  )
}
