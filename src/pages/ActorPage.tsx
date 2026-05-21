import { useEffect, useState } from "react";
import { Actor, Movie, tmdb, profileUrl, posterUrl } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

interface ActorPageProps {
  actorId: number;
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
}

export default function ActorPage({ actorId, onBack, onMovieClick }: ActorPageProps) {
  const [actor, setActor] = useState<(Actor & { biography: string; birthday: string; place_of_birth: string }) | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"popularity" | "release_date" | "vote_average">("popularity");

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    Promise.all([tmdb.actorDetails(actorId), tmdb.actorMovies(actorId)])
      .then(([details, credits]) => {
        setActor(details);
        setMovies(
          credits.cast
            .filter((m) => m.poster_path && m.release_date)
            .sort((a, b) => b.popularity - a.popularity)
        );
      })
      .finally(() => setLoading(false));
  }, [actorId]);

  const sorted = [...movies].sort((a, b) => {
    if (sortBy === "popularity") return b.popularity - a.popularity;
    if (sortBy === "vote_average") return b.vote_average - a.vote_average;
    return (b.release_date ?? "").localeCompare(a.release_date ?? "");
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
          <p className="text-neutral-400">Loading actor...</p>
        </div>
      </div>
    );
  }

  if (!actor) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Back button */}
      <div className="mx-auto max-w-[1400px] px-4 pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-neutral-400 transition hover:text-amber-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      {/* Actor hero */}
      <section className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <img
            src={profileUrl(actor.profile_path, "w342")}
            alt={actor.name}
            className="w-40 shrink-0 rounded-sm border border-neutral-700 shadow-2xl sm:w-52"
          />
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{actor.name}</h1>
              <p className="mt-1 text-sm text-amber-500">{actor.known_for_department}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
              {actor.birthday && (
                <span>
                  <span className="text-neutral-200 font-medium">Born: </span>
                  {actor.birthday}
                </span>
              )}
              {actor.place_of_birth && (
                <span>
                  <span className="text-neutral-200 font-medium">From: </span>
                  {actor.place_of_birth}
                </span>
              )}
              <span>
                <span className="text-neutral-200 font-medium">Movies: </span>
                {movies.length}
              </span>
            </div>

            {actor.biography ? (
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 line-clamp-6">
                {actor.biography}
              </p>
            ) : (
              <p className="text-sm text-neutral-600 italic">No biography available.</p>
            )}

            {/* Known for quick row */}
            {actor.known_for && actor.known_for.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">Known for</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {actor.known_for.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onMovieClick(m)}
                      className="shrink-0 w-20 group"
                    >
                      <img
                        src={posterUrl(m.poster_path, "w154")}
                        alt={m.title}
                        className="w-full rounded-sm border border-neutral-700 transition group-hover:border-amber-500"
                      />
                      <p className="mt-1 text-[10px] text-neutral-400 line-clamp-1 group-hover:text-amber-400">{m.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-800" />

      {/* All movies */}
      <section className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            <span className="border-l-4 border-amber-500 pl-3">All Movies ({movies.length})</span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="release_date">Newest First</option>
              <option value="vote_average">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sorted.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
          ))}
        </div>

        {sorted.length === 0 && (
          <p className="py-16 text-center text-neutral-500">No movies found for this actor.</p>
        )}
      </section>
    </div>
  );
}
