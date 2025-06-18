"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { SwipeHistoryItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, X, Calendar, Star, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
  }, [isAuthenticated, router])

  // Load swipe history
  useEffect(() => {
    const loadSwipeHistory = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const history = await api.swipes.getSwipeHistory(user.id)
        setSwipeHistory(history)
      } catch (error) {
        console.error('Failed to load swipe history:', error)
        setError('Failed to load swipe history')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadSwipeHistory()
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  const handleClearHistory = async () => {
    if (!user) return

    try {
      await api.swipes.clearSwipeHistory(user.id)
      setSwipeHistory([])
    } catch (error) {
      console.error('Failed to clear swipe history:', error)
      setError('Failed to clear swipe history')
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // Calculate stats
  const totalSwipes = swipeHistory.length
  const likedMovies = swipeHistory.filter(item => item.direction === true)
  const dislikedMovies = swipeHistory.filter(item => item.direction === false)
  const likeRate = totalSwipes > 0 ? Math.round((likedMovies.length / totalSwipes) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* User Profile Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <CardTitle className="text-2xl text-white">{user.username}</CardTitle>
            <p className="text-gray-400">Movie Enthusiast</p>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{totalSwipes}</div>
              <div className="text-gray-400">Total Swipes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{likedMovies.length}</div>
              <div className="text-gray-400">Movies Liked</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{likeRate}%</div>
              <div className="text-gray-400">Like Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Swipe History */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Swipe History</CardTitle>
              {totalSwipes > 0 && (
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="bg-red-900/20 border-red-900/50 text-red-400 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : totalSwipes === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No swipe history yet. Start swiping to see your activity here!
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                  <TabsTrigger value="all" className="text-gray-300 data-[state=active]:text-white">
                    All ({totalSwipes})
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="text-gray-300 data-[state=active]:text-white">
                    Liked ({likedMovies.length})
                  </TabsTrigger>
                  <TabsTrigger value="disliked" className="text-gray-300 data-[state=active]:text-white">
                    Passed ({dislikedMovies.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-4">
                    {swipeHistory.slice(0, 20).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-16 h-24 relative">
                          <Image
                            src={item.movie.poster_url || "/placeholder.svg"}
                            alt={item.movie.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{item.movie.title}</h3>
                            {item.movie.year && (
                              <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                                {item.movie.year}
                              </Badge>
                            )}
                          </div>
                          {item.movie.score && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-300">{item.movie.score.toFixed(1)}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {item.movie.overview || "No description available"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            item.direction ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {item.direction ? <Heart className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                          {item.ts && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.ts).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="liked" className="mt-6">
                  <div className="space-y-4">
                    {likedMovies.slice(0, 20).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-16 h-24 relative">
                          <Image
                            src={item.movie.poster_url || "/placeholder.svg"}
                            alt={item.movie.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{item.movie.title}</h3>
                            {item.movie.year && (
                              <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                                {item.movie.year}
                              </Badge>
                            )}
                          </div>
                          {item.movie.score && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-300">{item.movie.score.toFixed(1)}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {item.movie.overview || "No description available"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                            <Heart className="w-5 h-5" />
                          </div>
                          {item.ts && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.ts).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="disliked" className="mt-6">
                  <div className="space-y-4">
                    {dislikedMovies.slice(0, 20).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-16 h-24 relative">
                          <Image
                            src={item.movie.poster_url || "/placeholder.svg"}
                            alt={item.movie.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white truncate">{item.movie.title}</h3>
                            {item.movie.year && (
                              <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                                {item.movie.year}
                              </Badge>
                            )}
                          </div>
                          {item.movie.score && (
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-300">{item.movie.score.toFixed(1)}</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {item.movie.overview || "No description available"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                            <X className="w-5 h-5" />
                          </div>
                          {item.ts && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.ts).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator className="bg-gray-700" />
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full md:w-auto"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
