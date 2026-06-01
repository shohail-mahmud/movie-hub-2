import { useEffect, useRef, useState } from "react";
import { Movie, posterUrl, tmdb } from "../api/tmdb";

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
}

const trailerCache = new Map<number, string | null>();

async function fetchTrailerKey(movieId: number): Promise<string | null> {
  if (trailerCache.has(movieId)) return trailerCache.get(movieId)!;
  try {
    const { results } = await tmdb.movieVideos(movieId);
    const yt = results.filter((v) => v.site === "YouTube");
    const pick =
      yt.find((v) => v.type === "Trailer" && v.official) ??
      yt.find((v) => v.type === "Trailer") ??
      yt.find((v) => v.type === "Teaser") ??
      yt[0];
    const key = pick?.key ?? null;
    trailerCache.set(movieId, key);
    return key;
  } catch {
    trailerCache.set(movieId, null);
    return null;
  }
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [iframeNonce, setIframeNonce] = useState(0);

  const stopTimerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);

  const rating = Math.round(movie.vote_average * 10);
  const year = movie.release_date?.slice(0, 4) ?? "—";

  const clearTimers = () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
    stopTimerRef.current = null;
    startTimerRef.current = null;
  };

  useEffect(() => () => clearTimers(), []);

  const startPreview = (delay = 200) => {
    setHovered(true);
    clearTimers();
    startTimerRef.current = window.setTimeout(async () => {
      const key = trailerKey ?? (await fetchTrailerKey(movie.id));
      if (!key) return;
      setTrailerKey(key);
      setIframeNonce((n) => n + 1);
      setPlaying(true);
      stopTimerRef.current = window.setTimeout(() => {
        setPlaying(false);
      }, 10_000);
    }, delay);
  };

  const handleEnter = () => startPreview(200);

  const handleLeave = () => {
    setHovered(false);
    clearTimers();
    setPlaying(false);
    setIframeNonce((n) => n + 1);
  };

  const touchStartY = useRef<number | null>(null);
  const touchMoved = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchMoved.current = false;
    touchStartY.current = e.touches[0]?.clientY ?? null;
    startPreview(60);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const y = e.touches[0]?.clientY ?? null;
    if (touchStartY.current != null && y != null && Math.abs(y - touchStartY.current) > 12) {
      if (!touchMoved.current) {
        touchMoved.current = true;
        handleLeave();
      }
    }
  };

  const embedSrc =
    trailerKey && playing
      ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`
      : null;

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={() => onClick?.(movie)}
    >
      <div className="relative overflow-hidden rounded-lg bg-neutral-900 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/70 group-hover:ring-amber-500/30">
        <img
          src={posterUrl(movie.poster_path)}
          alt={movie.title}
          loading="lazy"
          className={`aspect-[2/3] w-full object-cover transition-opacity duration-500 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        />

        {embedSrc && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          >
            <iframe
              key={iframeNonce}
              src={embedSrc}
              title={`${movie.title} preview`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="pointer-events-none h-full w-full scale-[1.4] border-0"
            />
          </div>
        )}

        <div className="absolute left-1.5 top-1.5 z-10 flex gap-1">
          <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
            HD
          </span>
          {movie.vote_average >= 8 && (
            <span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              TOP
            </span>
          )}
        </div>

        <span className="absolute bottom-1.5 left-1.5 z-10 rounded-sm bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
          {rating}%
        </span>

        <span className="absolute bottom-1.5 right-1.5 z-10 rounded-sm bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-neutral-300">
          {year}
        </span>

        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${
            hovered && !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 backdrop-blur">
            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-5 w-5">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5">
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
