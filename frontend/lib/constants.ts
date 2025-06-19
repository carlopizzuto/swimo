// Route definitions
export const ROUTES = {
  HOME: "/",
  SPLASH: "/splash", 
  AUTH: "/auth",
  DISCOVER: "/discover",  // Main app content
  PROFILE: "/profile",
  SEARCH: "/search",
  WATCHLIST: "/watchlist",
} as const

export const PUBLIC_ROUTES = [
  ROUTES.SPLASH,
  ROUTES.AUTH,
] as const

// Movie recommendation configuration
export const RECOMMENDATION_CONFIG = {
  INITIAL_BATCH: 5,
  REFILL_BATCH: 4,
  REFILL_TRIGGER: 2, // Load more when this many movies left
  FALLBACK_BATCH: 3, // Number of random movies to get as fallback
} as const

// UI Constants
export const LOADING_MESSAGES = {
  AUTHENTICATING: "Checking authentication...",
  LOADING_MOVIES: "Loading movies...",
  SAVING_SWIPE: "Saving your choice...",
} as const 