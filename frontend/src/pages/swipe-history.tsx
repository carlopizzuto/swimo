import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Movie, Swipe } from '@/types';
import { swipeApi } from '@/services/api';
import { FaTrash } from 'react-icons/fa';

type SwipeWithMovie = Swipe & {
  movie: Movie;
};

export default function SwipeHistory() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [swipes, setSwipes] = useState<SwipeWithMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'liked' | 'disliked'>('all');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchSwipeHistory = async () => {
      try {
        setLoading(true);
        const swipeHistory = await swipeApi.getSwipeHistory(user.id, token!);
        setSwipes(swipeHistory);
      } catch (error) {
        console.error('Failed to fetch swipe history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSwipeHistory();
  }, [user, token, router]);

  const filteredSwipes = swipes.filter(swipe => {
    if (filter === 'liked') return swipe.direction === true;
    if (filter === 'disliked') return swipe.direction === false;
    return true;
  });

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear your entire swipe history? This action cannot be undone.')) {
      return;
    }

    try {
      await swipeApi.clearSwipeHistory(user!.id, token!);
      setSwipes([]);
    } catch (error) {
      console.error('Failed to clear swipe history:', error);
      alert('Failed to clear swipe history. Please try again.');
    }
  };

  const deleteSwipe = async (movieId: number) => {
    if (!confirm('Are you sure you want to delete this swipe? This action cannot be undone.')) {
      return;
    }

    try {
      await swipeApi.deleteSwipe(user!.id, movieId, token!);
      setSwipes(swipes.filter(swipe => swipe.movie_id !== movieId));
    } catch (error) {
      console.error('Failed to delete swipe:', error);
      alert('Failed to delete swipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading swipe history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-orange-500 hover:text-orange-400 text-2xl"
            >
              ←
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Swipe History</h1>
          </div>
          
          <button
            onClick={clearHistory}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            Clear History
          </button>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
              filter === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({swipes.length})
          </button>
          <button
            onClick={() => setFilter('liked')}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
              filter === 'liked' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Liked ({swipes.filter(s => s.direction).length})
          </button>
          <button
            onClick={() => setFilter('disliked')}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
              filter === 'disliked' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Disliked ({swipes.filter(s => !s.direction).length})
          </button>
        </div>

        {filteredSwipes.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl mb-4">No swipes found</p>
            <p>Start swiping on movies to see your history here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredSwipes.map((swipe) => (
              <div
                key={`${swipe.movie_id}-${swipe.ts}`}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 movie-card"
                onClick={() => setSelectedCard(selectedCard === swipe.movie_id ? null : swipe.movie_id)}
              >
                <div className="relative group">
                  <Image
                    src={swipe.movie.poster_url}
                    alt={swipe.movie.title}
                    width={400}
                    height={600}
                    className="w-full h-64 object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer bg-black hover:bg-gray-800 ${
                    // Hide by default, show on hover for desktop (md and up), show when selected for mobile
                    selectedCard === swipe.movie_id 
                      ? 'opacity-100' 
                      : 'opacity-0 md:group-hover:opacity-100'
                  }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSwipe(swipe.movie_id);
                    }}
                  >
                    <FaTrash className="text-red-500" />
                  </div>
                </div>
                
                <div className={`p-4 ${swipe.direction ? 'bg-gradient-to-t from-green-400/20 to-gray-800' : 'bg-gradient-to-t from-red-400/20 to-gray-800'}`}>
                  <h3 className={`font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] ${
                    swipe.direction ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {swipe.movie.title}
                  </h3>
                  <div className="flex justify-between text-gray-400 text-sm mb-2">
                    <p>{swipe.movie.year}</p>
                    <p>{swipe.movie.score?.toFixed(1)} %</p>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                    {swipe.movie.overview}
                  </p>
                  <p className="text-xs text-gray-500">
                    Swiped {new Date(swipe.ts).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 