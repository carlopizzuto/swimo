import { useAuth } from "@/hooks/useAuth";
import { useMovies } from "@/hooks/useMovies";
import { useKeyboard } from "@/hooks/useKeyboard";
import AuthForm from "@/components/AuthForm";
import UserMenu from "@/components/UserMenu";
import MovieCard from "@/components/MovieCard";

export default function Home() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const { movie, swipes, isLoading, fetchRandomMovie, sendSwipe } = useMovies(user?.id, token || undefined);

  // Handle keyboard events for swiping
  useKeyboard({
    onLeftArrow: () => sendSwipe(false),
    onRightArrow: () => sendSwipe(true),
    enabled: !!movie && !isLoading
  });

  // Show loading spinner during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user || !token) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="text-center relative border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex flex-col py-6 px-6 items-start">
            <h1 className="text-4xl font-bold text-orange-300 mb-2 tracking-wider">SWIMO</h1>
            <p className="text-orange-400 font-medium">Discover Your Next Favorite Movie</p>
          </div>
          <UserMenu user={user!} onLogout={logout} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 pb-4">
        {!movie && !isLoading && (
          <div className="text-center">
            <button 
              onClick={fetchRandomMovie}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 px-8 rounded-lg text-lg shadow-sm transform hover:scale-105 transition-all duration-200"
            >
              Start Discovering Movies
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mb-3"></div>
            <p className="text-orange-300 font-medium">Finding your next movie...</p>
          </div>
        )}

        {movie && !isLoading && (
          <>
            <MovieCard movie={movie} onSwipe={sendSwipe} />
            
            {/* Swipe Count */}
            <div className="mt-4 text-center">
              <p className="text-orange-400 text-sm font-medium">
                {swipes.length} swipes
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
