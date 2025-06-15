"use client"

import { useState, useEffect } from "react"
import { User, Heart, X, Settings, Trash2, Bookmark, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MovieGrid from "@/components/MovieGrid"
import type { Movie } from "@/lib/types"
import { getMovies } from "@/lib/movies"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [likedMovies, setLikedMovies] = useState<Movie[]>([])
  const [dislikedMovies, setDislikedMovies] = useState<Movie[]>([])
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const movieData = await getMovies()
      setMovies(movieData)

      // Load user data
      const user = localStorage.getItem("user")
      if (user) {
        const userData = JSON.parse(user)
        setUsername(userData.username)
      }

      // Load preferences from localStorage
      const saved = localStorage.getItem("moviePreferences")
      if (saved) {
        const { liked, disliked, watchlist } = JSON.parse(saved)

        const likedMovieData = movieData.filter((movie) => liked?.includes(movie.id))
        const dislikedMovieData = movieData.filter((movie) => disliked?.includes(movie.id))
        const watchlistMovieData = movieData.filter((movie) => watchlist?.includes(movie.id))

        setLikedMovies(likedMovieData)
        setDislikedMovies(dislikedMovieData)
        setWatchlistMovies(watchlistMovieData)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  const clearAllPreferences = () => {
    localStorage.removeItem("moviePreferences")
    setLikedMovies([])
    setDislikedMovies([])
    setWatchlistMovies([])
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("moviePreferences")
    router.push("/auth")
  }

  const getRecommendations = () => {
    if (likedMovies.length === 0) return []

    // Get genres from liked movies
    const likedGenres = likedMovies.flatMap((movie) => movie.genres)
    const genreCount = likedGenres.reduce(
      (acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Sort genres by frequency
    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre)

    // Find movies with similar genres that haven't been liked or disliked
    const likedIds = likedMovies.map((m) => m.id)
    const dislikedIds = dislikedMovies.map((m) => m.id)

    return movies
      .filter(
        (movie) =>
          !likedIds.includes(movie.id) &&
          !dislikedIds.includes(movie.id) &&
          movie.genres.some((genre) => topGenres.includes(genre)),
      )
      .slice(0, 6)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const recommendations = getRecommendations()

  return (
    <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600">
          <User className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Welcome, {username}</h1>
        <p className="text-gray-400">Manage your movie preferences</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{likedMovies.length}</div>
            <div className="text-gray-400">Liked</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <X className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{dislikedMovies.length}</div>
            <div className="text-gray-400">Passed</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Bookmark className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{watchlistMovies.length}</div>
            <div className="text-gray-400">Watchlist</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Settings className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{recommendations.length}</div>
            <div className="text-gray-400">Recommended</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="liked" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
          <TabsTrigger
            value="liked"
            className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
          >
            Liked
          </TabsTrigger>
          <TabsTrigger
            value="passed"
            className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
          >
            Passed
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked" className="mt-6 flex-1">
          {likedMovies.length > 0 ? (
            <MovieGrid movies={likedMovies} />
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No liked movies yet</h3>
              <p className="text-gray-400">Start swiping to build your collection!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="passed" className="mt-6 flex-1">
          {dislikedMovies.length > 0 ? (
            <MovieGrid movies={dislikedMovies} />
          ) : (
            <div className="text-center py-12">
              <X className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No passed movies yet</h3>
              <p className="text-gray-400">Movies you pass on will appear here!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6 flex-1">
          {recommendations.length > 0 ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Recommended for you</h3>
                <p className="text-gray-400">Based on your liked movies</p>
              </div>
              <MovieGrid movies={recommendations} />
            </>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
              <p className="text-gray-400">Like some movies to get personalized recommendations!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 flex-1">
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Logout</h4>
                    <p className="text-gray-400 text-sm">Sign out of your account</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Clear All Data</h4>
                    <p className="text-gray-400 text-sm">Remove all your movie preferences</p>
                  </div>
                  <Button
                    onClick={clearAllPreferences}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
