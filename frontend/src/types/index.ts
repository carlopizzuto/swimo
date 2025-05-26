export type Movie = {
  id: number;
  title: string;
  poster_url: string;
  year: number;
  genres: string;
  overview: string;
  score: number;
};

export type Swipe = {
  user_id: number;
  movie_id: number;
  direction: boolean;
  ts: string;
};

export type User = {
  id: number;
  username: string;
}; 