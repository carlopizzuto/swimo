export interface Movie {
  id: number
  title: string
  overview?: string
  poster_url?: string
  score?: number
  year?: number
  genres?: string
}

// New types for authentication
export interface User {
  id: number
  username: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
}

// Swipe related types
export interface SwipeData {
  user_id: number
  movie_id: number
  direction: boolean
  ts?: string
}

export interface SwipeHistoryItem extends SwipeData {
  movie: Movie
}
