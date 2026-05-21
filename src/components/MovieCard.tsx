import { useState } from "react";
import { Movie, posterUrl } from "../api/tmdb";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const rating = Math.round(movie.vote_average * 10);
  const year = movie.release_date?.slice(0, 4) ?? "—";

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(movie)}
    >
      <div className="relative overflow-hidden bg-neutral-900">
        <img
          src={posterUrl(movie.poster_path)}
          alt={movie.title}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* HD badge */}
        <div className="absolute left-1.5 top-1.5 flex gap-1">
          <span className="bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">HD</span>
          {movie.vote_average >= 8 && (
            <span className="bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">TOP</span>
          )}
        </div>

        {/* Rating bottom-left */}
        <span className="absolute bottom-1.5 left-1.5 bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
          {rating}%
        </span>

        {/* Year bottom-right */}
        <span className="absolute bottom-1.5 right-1.5 bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-neutral-300">
          {year}
        </span>

        {/* Progress bar on hover */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-800">
          <div
            className={`h-full bg-amber-500 transition-all duration-[3000ms] ease-linear ${hovered ? "w-full" : "w-0"}`}
          />
        </div>

        {/* Overlay play button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-black/50">
            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-5 w-5">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>

        {/* Add to list */}
        <button className="absolute right-1.5 top-8 hidden h-7 w-7 items-center justify-center bg-black/70 text-white group-hover:flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-1.5 px-0.5">
        <h3 className="line-clamp-1 text-sm font-medium text-neutral-100 transition group-hover:text-amber-400">
          {movie.title}
        </h3>
        <p className="mt-0.5 text-xs text-neutral-500">
          {year} &nbsp;·&nbsp; {movie.vote_count.toLocaleString()} votes
        </p>
      </div>
    </article>
  );
}
