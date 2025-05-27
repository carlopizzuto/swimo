export const formatGenres = (genres: string): string[] => {
  return genres.split(',').map(genre => genre.trim()).slice(0, 3);
};
 
export const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-red-400";
}; 