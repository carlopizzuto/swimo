import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types';
import { formatGenres, getScoreColor } from '@/utils/movie';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: boolean) => void;
}

export default function MovieCard({ movie, onSwipe }: MovieCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when movie changes
  useEffect(() => {
    setIsFlipped(false);
  }, [movie]);

  const handleCardClick = () => {
    // Only allow flipping on mobile (screens smaller than md breakpoint)
    if (window.innerWidth < 768) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleSwipeClick = (direction: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe(direction);
  };

  return (
    <div className="max-w-2xl w-full">
      {/* Movie Card - Responsive with Flip */}
      <div className="relative perspective-1000 h-auto md:h-96">
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''} md:cursor-default cursor-pointer`}
          onClick={handleCardClick}
        >
          {/* Front of Card - Poster + Title (Mobile) / Full Layout (Desktop) */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
              {/* Mobile Layout */}
              <div className="md:hidden flex flex-col items-center">
                {/* Poster Container with 2:3 aspect ratio */}
                <div className="relative w-full max-w-[300px] aspect-[2/3] bg-gray-700 p-4">
                  <div className="relative w-full h-full">
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-movie.jpg";
                      }}
                    />
                    {/* Score Badge */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-80 rounded-md px-2 py-1">
                      <span className={`font-bold text-xs ${getScoreColor(movie.score)}`}>
                        {movie.score.toFixed(1)}
                      </span>
                    </div>
                    {/* Tap to flip indicator */}
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 rounded-md px-2 py-1">
                      <span className="text-white text-xs">Tap for details</span>
                    </div>
                  </div>
                </div>
                {/* Title Bar */}
                <div className="p-4 w-full">
                  <h2 className="text-lg font-bold text-gray-100 leading-tight line-clamp-2 text-center">
                    {movie.title}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 text-center">
                    {movie.year}
                  </p>
                </div>
                
                {/* Action Buttons - Inside Mobile Card */}
                <div className="flex gap-4 justify-center pb-6 px-4 w-full">
                  <button
                    onClick={(e) => handleSwipeClick(false, e)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200 flex-1 max-w-[120px]"
                  >
                    Pass
                  </button>
                  <button
                    onClick={(e) => handleSwipeClick(true, e)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200 flex-1 max-w-[120px]"
                  >
                    Like
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex h-96">
                {/* Movie Poster - Left Side */}
                <div className="relative bg-gray-700 flex-shrink-0 w-64">
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    width={256}
                    height={384}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-movie.jpg";
                    }}
                  />
                  {/* Score Badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-80 rounded-md px-2 py-1">
                    <span className={`font-bold text-xs ${getScoreColor(movie.score)}`}>
                      {movie.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Movie Info - Right Side */}
                <div className="flex-1 p-6 flex flex-col h-full">
                  {/* Title and Year */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-100 mb-2 leading-tight line-clamp-2">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">
                      {movie.year}
                    </p>
                  </div>

                  {/* Genres */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {formatGenres(movie.genres).map((genre, index) => (
                        <span
                          key={index}
                          className="bg-orange-700 text-orange-200 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Overview - Scrollable */}
                  <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {movie.overview || "No description available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of Card - Details (Mobile Only) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 md:hidden">
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 w-full max-w-[300px] mx-auto">
              {/* Content with same aspect ratio as front */}
              <div className="aspect-[2/3] p-4 flex flex-col justify-between">
                {/* Header */}
                <div className="flex-shrink-0">
                  <h2 className="text-lg font-bold text-gray-100 mb-1 leading-tight line-clamp-2">
                    {movie.title}
                  </h2>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm font-medium">
                      {movie.year}
                    </p>
                    {/* Score */}
                    <span className={`font-bold text-sm ${getScoreColor(movie.score)}`}>
                      ★ {movie.score.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Genres */}
                <div className="mb-3 flex-shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {formatGenres(movie.genres).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-orange-700 text-orange-200 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Overview - Scrollable */}
                <div className="flex-1 overflow-hidden mb-3 min-h-0">
                  <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {movie.overview || "No description available."}
                    </p>
                  </div>
                </div>

                {/* Tap to flip back indicator */}
                <div className="text-center flex-shrink-0">
                  <span className="text-gray-400 text-xs">Tap to go back</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Desktop Only (Outside Card) */}
      <div className="hidden md:flex gap-4 justify-center mt-6">
        <button
          onClick={(e) => handleSwipeClick(false, e)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-12 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200"
        >
          Pass
        </button>
        <button
          onClick={(e) => handleSwipeClick(true, e)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-12 rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200"
        >
          Like
        </button>
      </div>
    </div>
  );
} 