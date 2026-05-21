import { Movie, backdropUrl, posterUrl } from "../api/tmdb";

interface HeroProps {
  movie: Movie;
  genres: { id: number; name: string }[];
  onPlay: (movie: Movie) => void;
}

export default function HeroSection({ movie, genres, onPlay }: HeroProps) {
  const movieGenres = (movie.genre_ids ?? [])
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  const rating = Math.round(movie.vote_average * 10);
  const year = movie.release_date?.slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "520px" }}>
      {/* Backdrop */}
      <img
        src={backdropUrl(movie.backdrop_path)}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-12">
        <div className="flex items-end gap-6 max-w-5xl w-full">
          {/* Poster */}
          <img
            src={posterUrl(movie.poster_path, "w342")}
            alt={movie.title}
            className="hidden md:block w-36 shrink-0 shadow-2xl border border-neutral-700"
          />
          <div className="space-y-4 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">FEATURED</span>
              <span className="bg-red-600 px-2 py-0.5 text-xs font-bold text-white">HD</span>
              {movieGenres.map((g) => (
                <span key={g} className="border border-neutral-600 px-2 py-0.5 text-xs text-neutral-300">{g}</span>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight sm:text-5xl drop-shadow-lg">
              {movie.title}
            </h1>

            <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
              {movie.overview}
            </p>

            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <span className="text-amber-400 font-bold text-base">{rating}%</span>
              <span>{year}</span>
              <span>{movie.vote_count.toLocaleString()} votes</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => onPlay(movie)}
                className="flex items-center gap-2 bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                Watch Now
              </button>
              <button className="flex items-center gap-2 border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                My List
              </button>
              <button className="flex items-center gap-2 border border-white/20 px-4 py-2.5 text-sm text-neutral-300 transition hover:border-white/40 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" strokeLinecap="round" />
                </svg>
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
