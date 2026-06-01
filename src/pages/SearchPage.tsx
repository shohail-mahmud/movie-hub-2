import { useEffect, useState } from "react";
import { Movie, Actor, tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import ActorCard from "../components/ActorCard";
import type { SearchCategory } from "../components/Header";

interface SearchPageProps {
  query: string;
  category: SearchCategory;
  onMovieClick: (movie: Movie) => void;
  onActorClick: (actor: Actor) => void;
  onTvClick?: (movie: Movie) => void;
}

export default function SearchPage({ query, category, onMovieClick, onActorClick, onTvClick }: SearchPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);

  const isActors = category === "Stars";
  const isSeries = category === "Series";

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      const tokens = query.trim().split(/\s+/);
      const attempts = Array.from(
        new Set([
          query,
          tokens.slice(0, Math.max(1, tokens.length - 1)).join(" "),
          tokens[0],
        ].filter(Boolean))
      );
      for (const q of attempts) {
        try {
          if (isActors) {
            const res = await tmdb.searchActors(q);
            const filtered = res.results.filter((a) => a.profile_path);
            if (filtered.length > 0) {
              setActors(filtered);
              setMovies([]);
              return;
            }
          } else if (isSeries) {
            const res = await tmdb.searchTv(q);
            const filtered = res.results.filter((m) => m.poster_path);
            if (filtered.length > 0) {
              setMovies(filtered);
              setActors([]);
              return;
            }
          } else {
            const res = await tmdb.search(q);
            const filtered = res.results.filter((m) => m.poster_path);
            if (filtered.length > 0) {
              setMovies(filtered);
              setActors([]);
              return;
            }
          }

        } catch {
          // continue
        }
      }
      setMovies([]);
      setActors([]);
    };
    run().finally(() => setLoading(false));
  }, [query, category, isActors, isSeries]);

  const count = isActors ? actors.length : movies.length;
  const label = isActors ? "actors" : "movies";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <h2 className="mb-2 text-2xl font-bold">
          Search results for <span className="text-amber-400">"{query}"</span>
          <span className="ml-2 text-sm font-normal text-neutral-500">in {category}</span>
        </h2>
        <p className="mb-6 text-sm text-neutral-500">{count} {label} found</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
          </div>
        ) : count === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-xl font-semibold text-neutral-300">No {label} found</p>
            <p className="mt-2 text-sm text-neutral-500">Check the spelling or try a shorter title.</p>
          </div>
        ) : isActors ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
            {actors.map((a) => (
              <ActorCard key={a.id} actor={a} onClick={onActorClick} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} onClick={isSeries ? (onTvClick ?? onMovieClick) : onMovieClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
