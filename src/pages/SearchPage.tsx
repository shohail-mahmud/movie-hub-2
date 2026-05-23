import { useEffect, useState } from "react";
import { Movie, tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

interface SearchPageProps {
  query: string;
  onMovieClick: (movie: Movie) => void;
}

export default function SearchPage({ query, onMovieClick }: SearchPageProps) {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      // Try direct search first, then progressively shorter prefixes for typos
      const tokens = query.trim().split(/\s+/);
      const attempts = [query, tokens.slice(0, Math.max(1, tokens.length - 1)).join(" "), tokens[0]];
      for (const q of attempts) {
        if (!q) continue;
        try {
          const res = await tmdb.search(q);
          const filtered = res.results.filter((m) => m.poster_path);
          if (filtered.length > 0) {
            setResults(filtered);
            return;
          }
        } catch {
          // continue
        }
      }
      setResults([]);
    };
    run().finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <h2 className="mb-2 text-2xl font-bold">
          Search results for <span className="text-amber-400">"{query}"</span>
        </h2>
        <p className="mb-6 text-sm text-neutral-500">{results.length} movies found</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-xl font-semibold text-neutral-300">No results found</p>
            <p className="mt-2 text-sm text-neutral-500">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((m) => (
              <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
