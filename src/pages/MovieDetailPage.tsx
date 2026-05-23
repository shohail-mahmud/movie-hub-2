import { useEffect, useState } from "react";
import { Movie, Actor, tmdb, posterUrl, backdropUrl, profileUrl } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

interface MovieDetailPageProps {
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

interface MovieDetailData extends Movie {
  cast: CastMember[];
  similar: Movie[];
  recommendations: Movie[];
}

export default function MovieDetailPage({ movieId, onBack, onActorClick, onMovieClick }: MovieDetailPageProps) {
  const [data, setData] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    const fetchAll = async () => {
      const [details, credits, similar, recommendations] = await Promise.all([
        tmdb.movieDetails(movieId),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=8265bd1679663a7ea12ac168da84d2e8`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=8265bd1679663a7ea12ac168da84d2e8`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=8265bd1679663a7ea12ac168da84d2e8`).then((r) => r.json()),
      ]);
      setData({
        ...details,
        cast: credits.cast?.slice(0, 12) ?? [],
        similar: similar.results?.filter((m: Movie) => m.poster_path).slice(0, 8) ?? [],
        recommendations: recommendations.results?.filter((m: Movie) => m.poster_path).slice(0, 8) ?? [],
      });
    };
    fetchAll().finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
          <p className="text-neutral-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const rating = Math.round(data.vote_average * 10);
  const year = data.release_date?.slice(0, 4);
  const ratingColor = rating >= 70 ? "text-green-400" : rating >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Back */}
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

      {/* Backdrop */}
      <div className="relative mt-4 h-[380px] w-full overflow-hidden sm:h-[480px]">
        <img
          src={backdropUrl(data.backdrop_path)}
          alt={data.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center px-6 sm:px-10">
          <div className="flex gap-6 max-w-5xl">
            <img
              src={posterUrl(data.poster_path, "w342")}
              alt={data.title}
              className="hidden w-36 shrink-0 border border-neutral-700 shadow-2xl sm:block"
            />
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <span className="bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">HD</span>
                {data.genres?.map((g) => (
                  <span key={g.id} className="border border-neutral-600 px-2 py-0.5 text-xs text-neutral-300">{g.name}</span>
                ))}
              </div>
              <h1 className="text-3xl font-bold sm:text-5xl">{data.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                <span className={`text-xl font-bold ${ratingColor}`}>{rating}%</span>
                <span>{year}</span>
                {data.runtime && <span>{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span>}
                <span>{data.vote_count.toLocaleString()} votes</span>
              </div>
              <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed max-w-lg">{data.overview}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button className="flex items-center gap-2 bg-amber-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M5 3l14 9-14 9V3z" /></svg>
                  Watch Now
                </button>
                <button className="border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                  + My List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-8 space-y-10">
        {/* Cast */}
        {data.cast.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold">
              <span className="border-l-4 border-amber-500 pl-3">Cast</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
              {data.cast.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onActorClick({ ...member, known_for_department: member.known_for_department, popularity: member.popularity })}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-full border-2 border-neutral-700 transition group-hover:border-amber-500">
                    <img
                      src={profileUrl(member.profile_path)}
                      alt={member.name}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-white group-hover:text-amber-400 line-clamp-1">{member.name}</p>
                  <p className="text-[10px] text-neutral-500 line-clamp-1">{member.character}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold">
              <span className="border-l-4 border-amber-500 pl-3">Recommended</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {data.recommendations.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {data.similar.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold">
              <span className="border-l-4 border-amber-500 pl-3">Similar Movies</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
