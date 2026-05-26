import { useEffect, useState } from "react";
import { Movie, Actor, tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import ActorCard from "../components/ActorCard";
import { MovieGridSkeleton, ActorGridSkeleton } from "../components/Skeletons";

export type ListKind =
  | "popular"
  | "trending"
  | "topRated"
  | "nowPlaying"
  | "upcoming"
  | "actors"
  | "tvPopular";

const titles: Record<ListKind, string> = {
  popular: "Recommended Movies",
  trending: "Trending This Week",
  topRated: "Top Rated All Time",
  nowPlaying: "Now Playing",
  upcoming: "Coming Soon",
  actors: "Top Actors",
  tvPopular: "Popular Series",
};

interface Props {
  kind: ListKind;
  onBack: () => void;
  onMovieClick: (m: Movie) => void;
  onActorClick: (a: Actor) => void;
  onTvClick?: (m: Movie) => void;
}

const MAX_PAGES = 5;

export default function ListPage({ kind, onBack, onMovieClick, onActorClick, onTvClick }: Props) {
  const handleMovie = (m: Movie) => (kind === "tvPopular" && onTvClick ? onTvClick(m) : onMovieClick(m));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const isActors = kind === "actors";

  useEffect(() => {
    setMovies([]);
    setActors([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const fetcher = (p: number) => {
    switch (kind) {
      case "popular": return tmdb.popular(p);
      case "trending": return tmdb.trending(p);
      case "topRated": return tmdb.topRated(p);
      case "nowPlaying": return tmdb.nowPlaying(p);
      case "upcoming": return tmdb.upcoming(p);
      case "actors": return tmdb.popularActors(p);
      case "tvPopular": return tmdb.popularTv(p);
      default: return tmdb.popular(p);
    }
  };

  const loadPage = async (p: number, reset = false) => {
    setLoading(true);
    try {
      const res = await fetcher(p);
      setTotalPages(Math.min(res.total_pages, MAX_PAGES));
      if (isActors) {
        const next = (res.results as Actor[]).filter((a) => a.profile_path);
        setActors((prev) => (reset ? next : [...prev, ...next]));
      } else {
        const next = (res.results as Movie[]).filter((m) => m.poster_path);
        setMovies((prev) => (reset ? next : [...prev, ...next]));
      }
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  const canLoadMore = page < totalPages;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-4 sm:py-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-amber-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <h1 className="mb-5 text-xl font-bold sm:text-2xl">
          <span className="border-l-4 border-amber-500 pl-3">{titles[kind]}</span>
        </h1>

        {isActors ? (
          <>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
              {actors.map((a) => (
                <ActorCard key={a.id} actor={a} onClick={onActorClick} />
              ))}
            </div>
            {loading && actors.length === 0 && <ActorGridSkeleton count={18} />}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={handleMovie} />
              ))}
            </div>
            {loading && movies.length === 0 && <MovieGridSkeleton count={10} />}
          </>
        )}

        <div className="mt-8 flex justify-center">
          {canLoadMore && (
            <button
              onClick={() => loadPage(page + 1)}
              disabled={loading}
              className="border border-amber-500 px-6 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
