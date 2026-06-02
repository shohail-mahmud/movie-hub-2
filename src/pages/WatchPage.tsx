import { useEffect, useState } from "react";
import { Movie, Actor, tmdb, backdropUrl, profileUrl, posterUrl, TvDetails } from "../api/tmdb";
import MovieCard from "../components/MovieCard";
import { userLists } from "@/lib/userLists";
import { toast } from "sonner";

export type MediaType = "movie" | "tv";

export interface StreamSource {
  id: string;
  name: string;
  getMovieUrl: (id: number) => string;
  getTvUrl: (id: number, season: number, episode: number) => string;
  description: string;
}

export const STREAM_SOURCES: StreamSource[] = [
  {
    id: "vidking",
    name: "VidKing",
    getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?color=f59e0b&autoPlay=true`,
    getTvUrl: (id, s, e) => `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=f59e0b&autoPlay=true&nextEpisode=true&episodeSelector=true`,
    description: "Default Server"
  },
  {
    id: "vidlink",
    name: "VidLink",
    getMovieUrl: (id) => `https://vidlink.pro/movie/${id}?primaryColor=f59e0b`,
    getTvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=f59e0b`,
    description: "Fast Stream"
  },
  {
    id: "vidsrc_to",
    name: "VidSrc.to",
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    description: "Super Backup"
  },
  {
    id: "vidsrc_xyz",
    name: "VidSrc.xyz",
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    description: "Multi-Server"
  },
  {
    id: "vidsrc_me",
    name: "VidSrc.me",
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    description: "Classic Server"
  },
  {
    id: "vidsrc_cc",
    name: "VidSrc.cc",
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    description: "Alternative Backup"
  },
  {
    id: "embed_su",
    name: "Embed.su",
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
    description: "Subtitles Backup"
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    getMovieUrl: (id) => `https://embed.smashystream.com/play/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.smashystream.com/play/tv/${id}/${s}/${e}`,
    description: "Dual Audio / Hindi"
  }
];

interface WatchPageProps {
  movieId: number;
  mediaType?: MediaType;
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
  // TV only
  seasons?: TvDetails["seasons"];
  number_of_seasons?: number;
}

const API_KEY = "8265bd1679663a7ea12ac168da84d2e8";

export default function WatchPage({ movieId, mediaType = "movie", onBack, onActorClick, onMovieClick }: WatchPageProps) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("vidking");
  const isTv = mediaType === "tv";

  const handleShare = () => {
    const shareData = {
      title: data?.title ?? "MovieHub",
      text: `Watch ${data?.title} for free on MovieHub!`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData)
        .then(() => toast.success("Shared successfully!"))
        .catch((err) => {
          if (err.name !== "AbortError") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
          }
        });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    setLoading(true);
    setSeason(1);
    setEpisode(1);
    window.scrollTo(0, 0);
    (async () => {
      if (isTv) {
        const [details, credits, recs] = await Promise.all([
          tmdb.tvDetails(movieId),
          tmdb.tvCredits(movieId),
          tmdb.tvRecommendations(movieId),
        ]);
        // Default to first non-special season
        const firstSeason = details.seasons.find((s) => s.season_number > 0) ?? details.seasons[0];
        if (firstSeason) setSeason(firstSeason.season_number);
        setData({
          ...details,
          cast: credits.cast?.slice(0, 12) ?? [],
          recommendations: recs.results?.filter((m: Movie) => m.poster_path).slice(0, 12) ?? [],
          similar: [],
          seasons: details.seasons,
          number_of_seasons: details.number_of_seasons,
        });
      } else {
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
      }
    })().finally(() => setLoading(false));
  }, [movieId, isTv]);

  useEffect(() => {
    if (data) {
      userLists.add("history", data);
      setInList(userLists.has("watchlist", data.id));
    }
  }, [data]);

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

  const currentSeason = data.seasons?.find((s) => s.season_number === season);
  const episodeCount = currentSeason?.episode_count ?? 1;

  const activeSource = STREAM_SOURCES.find((src) => src.id === selectedSourceId) ?? STREAM_SOURCES[0];
  const embedSrc = isTv
    ? activeSource.getTvUrl(movieId, season, episode)
    : activeSource.getMovieUrl(movieId);

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
          <p className="truncate text-xs text-neutral-500 sm:text-sm">
            Now Watching — <span className="text-neutral-300">{data.title}</span>
            {isTv && <span className="text-neutral-500"> · S{season}·E{episode}</span>}
          </p>
        </div>
      </div>

      {/* Player */}
      <div className="bg-black">
        <div className="mx-auto max-w-[960px] px-0 sm:px-4 sm:py-4">
          <div key={`${selectedSourceId}-${season}-${episode}`} className="relative mx-auto w-full overflow-hidden bg-black shadow-2xl sm:rounded-sm" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={embedSrc}
              title={data.title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>

      {/* Server/Source Selector */}
      <div className="border-b border-neutral-800 bg-neutral-950/60 py-4">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Server Source
              </h3>
              <p className="text-xs text-neutral-500">
                If the stream is slow, broken, or not loading, try switching to a backup server.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STREAM_SOURCES.map((src) => {
                const isActive = src.id === selectedSourceId;
                return (
                  <button
                    key={src.id}
                    onClick={() => setSelectedSourceId(src.id)}
                    className={`relative rounded-md px-3 py-1.5 text-xs font-semibold transition flex flex-col items-start gap-0.5 border cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/15"
                        : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    <span>{src.name}</span>
                    <span className={`text-[9px] font-normal leading-none ${isActive ? "text-black/75" : "text-neutral-500"}`}>
                      {src.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Season / Episode selector */}
      {isTv && data.seasons && data.seasons.length > 0 && (
        <div className="border-b border-neutral-800 bg-neutral-950">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-neutral-500">Season</span>
              <select
                value={season}
                onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}
                className="border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {data.seasons.filter((s) => s.season_number > 0).map((s) => (
                  <option key={s.season_number} value={s.season_number}>
                    {s.name} ({s.episode_count} ep)
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider text-neutral-500">Episode</span>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {Array.from({ length: episodeCount }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Episode {n}</option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex gap-2">
              <button
                disabled={episode <= 1}
                onClick={() => setEpisode((e) => Math.max(1, e - 1))}
                className="border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-amber-500 hover:text-amber-400 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                disabled={episode >= episodeCount}
                onClick={() => setEpisode((e) => Math.min(episodeCount, e + 1))}
                className="bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

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
              <span className="bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">{isTv ? "Series" : "HD"}</span>
              {data.genres?.map((g) => (
                <span key={g.id} className="border border-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-300">{g.name}</span>
              ))}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 sm:text-sm">
              <span className={`text-lg font-bold ${ratingColor}`}>{rating}%</span>
              <span>{year}</span>
              {isTv && data.number_of_seasons ? <span>{data.number_of_seasons} season{data.number_of_seasons > 1 ? "s" : ""}</span> : null}
              {!isTv && data.runtime ? <span>{Math.floor(data.runtime / 60)}h {data.runtime % 60}m</span> : null}
              <span>{data.vote_count.toLocaleString()} votes</span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-300 sm:max-w-2xl">{data.overview}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => { userLists.toggle("watchlist", data); setInList(userLists.has("watchlist", data.id)); }}
                className={`px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  inList
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "border border-white/40 text-white hover:bg-white/10"
                }`}
              >
                {inList ? "✓ In Watchlist" : "+ Watchlist"}
              </button>
              <button
                onClick={handleShare}
                className="border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm cursor-pointer"
              >
                Share
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
