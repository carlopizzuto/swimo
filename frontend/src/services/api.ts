import { Movie, Swipe } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const movieApi = {
  getRandomMovie: async (): Promise<Movie> => {
    const res = await fetch(`${API_BASE_URL}/movies/random/`);
    if (!res.ok) throw new Error('Failed to fetch random movie');
    return res.json();
  },

  getRecommendedMovies: async (userId: number, token: string): Promise<Movie[]> => {
    const res = await fetch(`${API_BASE_URL}/movies/recommend/?user_id=${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  }
};

export const swipeApi = {
  createSwipe: async (swipe: Omit<Swipe, 'ts'>, token: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/swipes/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...swipe,
        ts: new Date().toISOString(),
      }),
    });
    if (!res.ok) throw new Error('Failed to create swipe');
  }
}; 