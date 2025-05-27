import { useState, useCallback } from 'react';
import { Movie, Swipe } from '@/types';
import { movieApi, swipeApi } from '@/services/api';

export const useMovies = (userId?: number, token?: string) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomMovie = async () => {
    setIsLoading(true);
    try {
      const newMovie = await movieApi.getRandomMovie();
      setMovie(newMovie);
    } catch (error) {
      console.error("Error fetching movie:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendedMovie = useCallback(async () => {
    if (!userId || !token) return;
    
    setIsLoading(true);
    try {
      const movies = await movieApi.getRecommendedMovies(userId, token);
      setMovie(movies[0]);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, setIsLoading, setMovie]);

  const sendSwipe = useCallback(async (direction: boolean) => {
    if (!movie || !userId || !token) return;
    
    try {
      await swipeApi.createSwipe({
        user_id: userId,
        movie_id: movie.id,
        direction
      }, token);
      
      const newSwipe: Swipe = {
        user_id: userId,
        movie_id: movie.id,
        direction,
        ts: new Date().toISOString()
      };
      
      setSwipes(prev => [...prev, newSwipe]);
      await fetchRecommendedMovie();
    } catch (error) {
      console.error("Error sending swipe:", error);
    }
  }, [movie, userId, token, fetchRecommendedMovie, setSwipes]);

  return {
    movie,
    swipes,
    isLoading,
    fetchRandomMovie,
    sendSwipe
  };
}; 