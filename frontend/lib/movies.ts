import type { Movie } from "./types"

// Mock movie data - in a real app, this would come from an API
const movies: Movie[] = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. This is jutsr some info to get why the text is so low. I also want to see what happens when there is a very ling tdescription, will it overflow, will it crop, or something else? We'lls see next. Actually, I need even more text to check for this contdition. I will now see let us see up next shaw boasd as.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 9.3,
    year: 1994,
    duration: "2h 22m",
    genres: ["Drama", "Crime"],
  },
  {
    id: "2",
    title: "The Godfather",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 9.2,
    year: 1972,
    duration: "2h 55m",
    genres: ["Crime", "Drama"],
  },
  {
    id: "3",
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 9.0,
    year: 2008,
    duration: "2h 32m",
    genres: ["Action", "Crime", "Drama"],
  },
  {
    id: "4",
    title: "Pulp Fiction",
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.9,
    year: 1994,
    duration: "2h 34m",
    genres: ["Crime", "Drama"],
  },
  {
    id: "5",
    title: "Forrest Gump",
    description:
      "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.8,
    year: 1994,
    duration: "2h 22m",
    genres: ["Drama", "Romance"],
  },
  {
    id: "6",
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.8,
    year: 2010,
    duration: "2h 28m",
    genres: ["Action", "Sci-Fi", "Thriller"],
  },
  {
    id: "7",
    title: "The Matrix",
    description:
      "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.7,
    year: 1999,
    duration: "2h 16m",
    genres: ["Action", "Sci-Fi"],
  },
  {
    id: "8",
    title: "Goodfellas",
    description:
      "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.7,
    year: 1990,
    duration: "2h 26m",
    genres: ["Biography", "Crime", "Drama"],
  },
  {
    id: "9",
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.6,
    year: 2014,
    duration: "2h 49m",
    genres: ["Adventure", "Drama", "Sci-Fi"],
  },
  {
    id: "10",
    title: "Parasite",
    description:
      "A poor family schemes to become employed by a wealthy family and infiltrate their household by posing as unrelated, highly qualified individuals.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.6,
    year: 2019,
    duration: "2h 12m",
    genres: ["Comedy", "Drama", "Thriller"],
  },
  {
    id: "11",
    title: "The Lion King",
    description: "A young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.5,
    year: 1994,
    duration: "1h 28m",
    genres: ["Animation", "Adventure", "Drama"],
  },
  {
    id: "12",
    title: "Avengers: Endgame",
    description:
      "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions.",
    poster: "/placeholder.svg?height=600&width=400",
    rating: 8.4,
    year: 2019,
    duration: "3h 1m",
    genres: ["Action", "Adventure", "Drama"],
  },
]

export async function getMovies(): Promise<Movie[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return movies
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return movies.find((movie) => movie.id === id)
}
