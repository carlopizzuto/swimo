import { useState, useEffect } from "react";
import Image from "next/image";

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
  const [movie, setMovie] = useState<Movie | null>(null);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(1);

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
  }, [movie, isLoading]);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/movies/recommend/`);
      const movies = await res.json();
      setMovie(movies[0]);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSwipe = async (dir: boolean) => {
    if (!movie) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/swipes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          movie_id: movie.id,
          direction: dir,
          ts: new Date().toISOString(),
        }),
      });
      
      setSwipes([
        ...swipes,
        { user_id: userId, movie_id: movie.id, direction: dir, ts: new Date().toISOString() },
      ]);
      
      fetchMovie();
    } catch (error) {
      console.error("Error sending swipe:", error);
    }
  };

  const newSession = () => {
    setUserId(userId + 1);
    setSwipes([]);
    setMovie(null);
  };

  const formatGenres = (genres: string) => {
    return genres.split(',').map(genre => genre.trim()).slice(0, 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Compact Header */}
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-white mb-1">SWIMO</h1>
        <p className="text-sm text-purple-200">Discover Your Next Favorite Movie</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Top Controls */}
        <div className="flex justify-between items-center w-full max-w-md mb-4">
          <div className="text-white text-sm">
            User: <span className="font-bold text-purple-300">{userId}</span>
          </div>
          <button
            onClick={newSession}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            New Session
          </button>
          <div className="text-white text-sm">
            Swiped: <span className="font-bold text-purple-300">{swipes.length}</span>
          </div>
        </div>

        {!movie && !isLoading && (
          <div className="text-center">
            <button 
              onClick={recommendMovie}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🎬 Start Discovering Movies
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3"></div>
            <p className="text-white">Finding your next movie...</p>
          </div>
        )}

        {movie && !isLoading && (
          <div className="max-w-4xl w-full">
            {/* Movie Card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex">
                {/* Movie Poster - Left Side */}
                <div className="relative bg-gray-200 flex-shrink-0">
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="w-80 h-auto object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-movie.jpg";
                    }}
                  />
                  {/* Score Badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 rounded-full px-3 py-1">
                    <span className={`font-bold text-sm ${getScoreColor(movie.score)}`}>
                      ⭐ {movie.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Movie Info - Right Side */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    {/* Title and Year */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
                        {movie.title}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        📅 {movie.year}
                      </p>
                    </div>

                    {/* Genres */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-3">
                        {formatGenres(movie.genres).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="mb-8">
                      <p className="text-gray-600 text-base leading-relaxed">
                        {movie.overview || "No description available."}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-6 justify-center">
                    <button
                      onClick={() => sendSwipe(false)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 text-lg"
                    >
                      👎 Pass
                    </button>
                    <button
                      onClick={() => sendSwipe(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-3 text-lg"
                    >
                      👍 Like
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Hint */}
            <div className="mt-4 text-center">
              <p className="text-purple-200 text-sm">
                Use ← → arrow keys to swipe
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
