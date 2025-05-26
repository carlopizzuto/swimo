import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";

type Movie = {
  id: number;
  title: string;
  poster_url: string;
  year: number;
  genres: string;
  overview: string;
  score: number;
};

type Swipe = {
  user_id: number;
  movie_id: number;
  direction: boolean;
  ts: string;
};

export default function Home() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchMovie = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/movies/random/`);
      setMovie(await res.json());
    } catch (error) {
      console.error("Error fetching movie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const recommendMovie = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/movies/recommend/?user_id=${user?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const movies = await res.json();
      setMovie(movies[0]);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSwipe = useCallback(async (dir: boolean) => {
    if (!movie || !user) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/swipes/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          movie_id: movie.id,
          direction: dir,
          ts: new Date().toISOString(),
        }),
      });
      
      setSwipes([
        ...swipes,
        { user_id: user.id, movie_id: movie.id, direction: dir, ts: new Date().toISOString() },
      ]);
      
      recommendMovie();
    } catch (error) {
      console.error("Error sending swipe:", error);
    }
  }, [movie, user, token, swipes, recommendMovie]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!movie || isLoading) return;
      
      if (event.key === "ArrowLeft") {
        sendSwipe(false); // Dislike
      } else if (event.key === "ArrowRight") {
        sendSwipe(true); // Like
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [movie, isLoading, sendSwipe]);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset flip state when movie changes
  useEffect(() => {
    setIsFlipped(false);
  }, [movie]);

  const newSession = () => {
    setSwipes([]);
    setMovie(null);
  };

  const formatGenres = (genres: string) => {
    return genres.split(',').map(genre => genre.trim()).slice(0, 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-red-400";
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex flex-col">
      {/* Retro Header */}
      <header className="text-center py-6 relative border-b border-orange-200">
        <h1 className="text-4xl font-bold text-orange-900 mb-2 tracking-wider">SWIMO</h1>
        <p className="text-orange-700 font-medium">Discover Your Next Favorite Movie</p>
        
        {/* User Menu */}
        <div className="absolute top-6 right-6" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full flex items-center justify-center text-lg transition-colors shadow-sm"
          >
            {getUserInitial()}
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-orange-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
              </div>
              
              <button
                onClick={() => {
                  // Placeholder for swipe history
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              >
                Swipe History
              </button>
              
              <button
                onClick={() => {
                  // Placeholder for clear swipe history
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              >
                Clear Swipe History
              </button>
              
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
              >
                Log Out
              </button>
              
              <button
                onClick={() => {
                  // Placeholder for delete account
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {!movie && !isLoading && (
          <div className="text-center">
            <button 
              onClick={fetchMovie}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-8 rounded-lg text-lg shadow-sm transform hover:scale-105 transition-all duration-200"
            >
              Start Discovering Movies
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-orange-800 font-medium">Finding your next movie...</p>
          </div>
        )}

        {movie && !isLoading && (
          <div className="max-w-2xl w-full">
            {/* Movie Card - Responsive with Flip */}
            <div className="relative h-96 md:h-96 perspective-1000">
              <div 
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front of Card - Poster + Title (Mobile) / Full Layout (Desktop) */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 h-full">
                    {/* Mobile Layout */}
                    <div className="md:hidden h-full flex flex-col">
                      {/* Poster */}
                      <div className="relative flex-1 bg-gray-100">
                        <Image
                          src={movie.poster_url}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-movie.jpg";
                          }}
                        />
                        {/* Score Badge */}
                        <div className="absolute top-3 right-3 bg-black bg-opacity-80 rounded-md px-2 py-1">
                          <span className={`font-bold text-xs ${getScoreColor(movie.score)}`}>
                            {movie.score.toFixed(1)}
                          </span>
                        </div>
                        {/* Tap to flip indicator */}
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                          <span className="text-white text-xs">Tap for details</span>
                        </div>
                      </div>
                      {/* Title Bar */}
                      <div className="p-4 bg-white">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                          {movie.title}
                        </h2>
                        <p className="text-gray-600 text-sm font-medium mt-1">
                          {movie.year}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex h-full">
                      {/* Movie Poster - Left Side */}
                      <div className="relative bg-gray-100 flex-shrink-0 w-64">
                        <Image
                          src={movie.poster_url}
                          alt={movie.title}
                          width={256}
                          height={384}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-movie.jpg";
                          }}
                        />
                        {/* Score Badge */}
                        <div className="absolute top-3 right-3 bg-black bg-opacity-80 rounded-md px-2 py-1">
                          <span className={`font-bold text-xs ${getScoreColor(movie.score)}`}>
                            {movie.score.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Movie Info - Right Side */}
                      <div className="flex-1 p-6 flex flex-col h-full">
                        {/* Title and Year */}
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                            {movie.title}
                          </h2>
                          <p className="text-gray-600 text-sm font-medium">
                            {movie.year}
                          </p>
                        </div>

                        {/* Genres */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {formatGenres(movie.genres).map((genre, index) => (
                              <span
                                key={index}
                                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Overview - Scrollable */}
                        <div className="flex-1 overflow-hidden">
                          <div className="h-full overflow-y-auto pr-2 scrollbar-thin">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {movie.overview || "No description available."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back of Card - Details (Mobile Only) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 md:hidden">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 h-full p-6 flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {movie.title}
                      </h2>
                      <p className="text-gray-600 text-sm font-medium">
                        {movie.year}
                      </p>
                      {/* Score */}
                      <div className="mt-2">
                        <span className={`font-bold text-lg ${getScoreColor(movie.score)}`}>
                          ★ {movie.score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {formatGenres(movie.genres).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Overview - Scrollable */}
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full overflow-y-auto pr-2">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {movie.overview || "No description available."}
                        </p>
                      </div>
                    </div>

                    {/* Tap to flip back indicator */}
                    <div className="mt-4 text-center">
                      <span className="text-gray-500 text-xs">Tap to go back</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Outside Card */}
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => sendSwipe(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-12 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200"
              >
                Pass
              </button>
              <button
                onClick={() => sendSwipe(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-12 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200"
              >
                Like
              </button>
            </div>

            {/* Swipe Count */}
            <div className="mt-4 text-center">
              <p className="text-orange-600 text-sm font-medium">
                {swipes.length} swipes
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
