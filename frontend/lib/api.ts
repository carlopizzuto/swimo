import { Movie, User, AuthTokens, LoginCredentials, RegisterCredentials, SwipeData, SwipeHistoryItem } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

// Helper to set auth token in localStorage
const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

// Helper to remove auth token from localStorage
const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getAuthToken()

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, `Network error: ${error}`)
  }
}

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiRequest<AuthTokens>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    setAuthToken(response.access_token)
    return response
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    return await apiRequest<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async getCurrentUser(): Promise<User> {
    return await apiRequest<User>('/users/me')
  },

  logout() {
    removeAuthToken()
  },

  isAuthenticated(): boolean {
    return getAuthToken() !== null
  },
}

// Movies API
export const moviesApi = {
  async getRandomMovie(): Promise<Movie> {
    return await apiRequest<Movie>('/movies/random')
  },

  async getRecommendations(userId: number, topN: number = 5): Promise<Movie[]> {
    return await apiRequest<Movie[]>(`/movies/recommend/?user_id=${userId}&top_n=${topN}`)
  },
}

// Swipes API
export const swipesApi = {
  async createSwipe(swipeData: SwipeData): Promise<SwipeData> {
    return await apiRequest<SwipeData>('/swipes/', {
      method: 'POST',
      body: JSON.stringify(swipeData),
    })
  },

  async getSwipeHistory(userId: number): Promise<SwipeHistoryItem[]> {
    return await apiRequest<SwipeHistoryItem[]>(`/swipes/${userId}/history`)
  },

  async getUserSwipes(userId: number): Promise<SwipeData[]> {
    return await apiRequest<SwipeData[]>(`/swipes/${userId}`)
  },

  async clearSwipeHistory(userId: number): Promise<void> {
    return await apiRequest<void>(`/swipes/${userId}`, {
      method: 'DELETE',
    })
  },

  async deleteSwipe(userId: number, movieId: number): Promise<void> {
    return await apiRequest<void>(`/swipes/${userId}/${movieId}`, {
      method: 'DELETE',
    })
  },
}

// Combined API object for easier imports
export const api = {
  auth: authApi,
  movies: moviesApi,
  swipes: swipesApi,
}

export default api 