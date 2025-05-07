import { useState } from "react";
import Image from "next/image";

type Movie = {
  id: number;
  title: string;
  poster_url: string;
  year: number;
  genres: string;
};

export default function Home() {
  const [movie, setMovie] = useState<Movie | null>(null);

  const fetchMovie = async () => {
    const res = await fetch("http://localhost:8000/movies/random/");
    setMovie(await res.json());
  };

  const sendSwipe = async (dir: boolean) => {
    if (!movie) return;
    fetch("http://localhost:8000/swipes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        movie_id: movie.id,
        direction: dir,
        ts: new Date().toISOString(),
      }),
    });
    fetchMovie();
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <button className="btn" onClick={fetchMovie}>
        Start
      </button>
      {movie && (
        <>
          <h1 className="text-2xl">{movie.title}</h1>
          <Image
            src={movie.poster_url}
            alt={movie.title}
            width={200}
            height={300}
            className="h-72"
          />
          <div className="flex gap-4">
            <button onClick={() => sendSwipe(false)}>👎</button>
            <button onClick={() => sendSwipe(true)}>👍</button>
          </div>
        </>
      )}
    </main>
  );
}
