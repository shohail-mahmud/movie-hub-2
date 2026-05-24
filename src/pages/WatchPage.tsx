import { useEffect, useState } from "react";
import { Movie, Actor, tmdb, backdropUrl, profileUrl, posterUrl } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

interface WatchPageProps {
  movieId: number;
  onBack: () => void;
  onActorClick: (actor: Actor) => void;
  onMovieClick: (movie: Movie) => void;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

interface Data extends Movie {
  cast: CastMember[];
  recommendations: Movie[];
  similar: Movie[];
}

const API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

export default function WatchPage({ movieId, onBack, onActorClick, onMovieClick }: WatchPageProps) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    (async () => {
      const [details, credits, recs, sim] = await Promise.all([
        tmdb.movieDetails(movieId),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${API_KEY}`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`).then((r) => r.json()),
      ]);
      setData({
        ...details,
        cast: credits.cast?.slice(0, 12) ?? [],
        recommendations: recs.results?.filter((m: Movie) => m.poster_path).slice(0, 12) ?? [],
        similar: sim.results?.filter((m: Movie) => m.poster_path).slice(0, 8) ?? [],
      });
    })().finally(() => setLoading(false));
  }, [movieId]);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
      </div>
    );
  }

  const rating = Math.round(data.vote_average * 10);
  const year = data.release_date?.slice(0, 4);
  const ratingColor = rating >= 70 ? "text-green-400" : rating >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top bar */}
      <div className="border-b border-neutral-800 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-amber-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <p className="truncate text-xs text-neutral-500 sm:text-sm">Now Watching — <span className="text-neutral-300">{data.title}</span></p>
        </div>
      </div>

      {/* Player */}
      <div className="bg-black">
        <div className="mx-auto max-w-[1400px] px-0 sm:px-4 sm:py-4">
          <div className="relative w-full overflow-hidden bg-black shadow-2xl sm:rounded-sm" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={`https://www.vidking.net/embed/movie/${movieId}?color=f59e0b&autoPlay=true`}
              title={data.title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>

      {/* Hero / metadata */}
      <div className="relative overflow-hidden border-b border-neutral-800">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${backdropUrl(data.backdrop_path)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        <div className="relative mx-auto flex max-w-[1400px] flex-col gap-5 px-3 py-6 sm:flex-row sm:px-4 sm:py-8">
          <img
            src={posterUrl(data.poster_path, "w342")}
            alt={data.title}
            className="hidden w-40 shrink-0 self-start border border-neutral-700 shadow-xl sm:block"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">HD</span>
              {data.genres?.map((g) => (
                <span key={g.id} className="border border-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-300">{g.name}</span>
              ))}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 sm:text-sm">
              <span className={`text-lg font-bold ${ratingColor}`}>{rating}%</span>
              <span>{year}</span>
              {data.runtime ? <span>{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span> : null}
              <span>{data.vote_count.toLocaleString()} votes</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-300 sm:max-w-2xl">{data.overview}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setInList((v) => !v)}
                className={`px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  inList
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "border border-white/40 text-white hover:bg-white/10"
                }`}
              >
                {inList ? "✓ In Watchlist" : "+ Watchlist"}
              </button>
              <button className="border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm">
                Share
              </button>
              <button className="border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm">
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] space-y-10 px-3 py-6 sm:px-4 sm:py-8">
        {/* Cast */}
        {data.cast.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold sm:text-lg">
              <span className="border-l-4 border-amber-500 pl-3">Top Cast</span>
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {data.cast.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    onActorClick({
                      id: m.id,
                      name: m.name,
                      profile_path: m.profile_path,
                      known_for_department: m.known_for_department,
                      popularity: m.popularity,
                    })
                  }
                  className="group w-20 shrink-0 text-center sm:w-24"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-full border-2 border-neutral-700 transition group-hover:border-amber-500">
                    <img
                      src={profileUrl(m.profile_path)}
                      alt={m.name}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-white group-hover:text-amber-400">{m.name}</p>
                  <p className="truncate text-[10px] text-neutral-500">{m.character}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold sm:text-lg">
              <span className="border-l-4 border-amber-500 pl-3">Recommended For You</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 xl:grid-cols-6">
              {data.recommendations.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>
        )}

        {/* Comments placeholder */}
        <section>
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            <span className="border-l-4 border-amber-500 pl-3">Comments</span>
          </h2>
          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800" />
              <textarea
                placeholder="Share what you thought about this movie..."
                rows={2}
                className="min-w-0 flex-1 resize-none border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button className="bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-400">
                Post comment
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-neutral-500">Be the first to comment.</p>
          </div>
        </section>

        {/* Similar */}
        {data.similar.length > 0 && (
          <section>
            <h2 className="mb-4 text-base font-bold sm:text-lg">
              <span className="border-l-4 border-amber-500 pl-3">More Like This</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
              {data.similar.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
