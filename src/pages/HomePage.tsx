import { useEffect, useRef, useState } from "react";
import { Movie, Actor, Genre, tmdb } from "../api/tmdb";
import HeroSection from "../components/HeroSection";
import MovieCard from "../components/MovieCard";
import ActorCard from "../components/ActorCard";

interface HomePageProps {
  onMovieClick: (movie: Movie) => void;
  onActorClick: (actor: Actor) => void;
  subTab?: string;
  scrollTarget?: "actors" | "categories" | null;
  navTick?: number;
}

const subNav = ["Recommended", "New", "Trending", "Top Rated", "Most Viewed", "Coming Soon"];

export default function HomePage({ onMovieClick, onActorClick, subTab, scrollTarget, navTick }: HomePageProps) {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [activeSub, setActiveSub] = useState("Recommended");
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("All time");
  const [qualityFilter, setQualityFilter] = useState("All quality");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const actorsRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      tmdb.trending(),
      tmdb.popular(),
      tmdb.topRated(),
      tmdb.nowPlaying(),
      tmdb.upcoming(),
      tmdb.popularActors(),
      tmdb.genres(),
    ]).then(([trend, pop, top, now, up, act, gen]) => {
      setTrending(trend.results.filter((m) => m.backdrop_path && m.poster_path));
      setPopular(pop.results.filter((m) => m.poster_path));
      setTopRated(top.results.filter((m) => m.poster_path));
      setNowPlaying(now.results.filter((m) => m.poster_path));
      setUpcoming(up.results.filter((m) => m.poster_path));
      setActors(act.results.filter((a) => a.profile_path).slice(0, 12));
      setGenres(gen.genres);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeGenre !== null) {
      tmdb.moviesByGenre(activeGenre).then((res) => {
        setGenreMovies(res.results.filter((m) => m.poster_path));
      });
    }
  }, [activeGenre]);

  // Sync external sub-tab selection from top nav
  useEffect(() => {
    if (subTab && subNav.includes(subTab)) {
      setActiveSub(subTab);
      subRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [subTab]);

  useEffect(() => {
    if (scrollTarget === "actors") actorsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (scrollTarget === "categories") categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTarget]);

  const heroMovie = trending[0];

  const getSubMovies = () => {
    switch (activeSub) {
      case "Recommended": return popular;
      case "New": return nowPlaying;
      case "Trending": return trending;
      case "Top Rated": return topRated;
      case "Coming Soon": return upcoming;
      case "Most Viewed": return [...popular].sort((a, b) => b.popularity - a.popularity);
      default: return popular;
    }
  };

  const toggle = (k: string) => setExpanded((p) => ({ ...p, [k]: !p[k] }));
  const seeAllBtn = (k: string) => (
    <button
      type="button"
      onClick={() => toggle(k)}
      className="text-sm text-amber-400 hover:underline"
    >
      {expanded[k] ? "Show less" : "See all"}
    </button>
  );

  if (loading && trending.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-amber-500" />
          <p className="text-sm text-neutral-400">Loading MoveHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero */}
      {heroMovie && (
        <HeroSection movie={heroMovie} genres={genres} onPlay={onMovieClick} />
      )}

      {/* Sub-nav + filters */}
      <div ref={subRef} className="border-b border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-0 overflow-x-auto">
              {subNav.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSub(s)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeSub === s
                      ? "border-amber-500 text-white"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 text-xs text-neutral-400 md:flex shrink-0 pl-4">
              <span>Filter:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white focus:outline-none"
              >
                {["All time", "Today", "This week", "This month"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-white focus:outline-none"
              >
                {["All quality", "HD", "4K"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <main className="space-y-10 min-w-0">
          {/* Sub-nav movies */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">{activeSub}</span>
              </h2>
              {seeAllBtn("sub")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {getSubMovies().slice(0, expanded.sub ? undefined : 8).map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>

          {/* Top Actors */}
          <section ref={actorsRef}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">Top Actors</span>
              </h2>
              {seeAllBtn("actors")}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8">
              {actors.slice(0, expanded.actors ? undefined : 8).map((a) => (
                <ActorCard key={a.id} actor={a} onClick={onActorClick} />
              ))}
            </div>
          </section>

          {/* Trending */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">Trending This Week</span>
              </h2>
              {seeAllBtn("trending")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {trending.slice(1, expanded.trending ? undefined : 9).map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>

          {/* Top Rated */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">Top Rated All Time</span>
              </h2>
              {seeAllBtn("topRated")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {topRated.slice(0, expanded.topRated ? undefined : 8).map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>

          {/* Now Playing */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">Now Playing</span>
              </h2>
              {seeAllBtn("nowPlaying")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {nowPlaying.slice(0, expanded.nowPlaying ? undefined : 8).map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>

          {/* Genre movies */}
          {activeGenre !== null && genreMovies.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  <span className="border-l-4 border-amber-500 pl-3">
                    {genres.find((g) => g.id === activeGenre)?.name} Movies
                  </span>
                </h2>
                <button onClick={() => setActiveGenre(null)} className="text-sm text-neutral-500 hover:text-white">
                  Clear ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {genreMovies.slice(0, 12).map((m) => (
                  <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <span className="border-l-4 border-amber-500 pl-3">Coming Soon</span>
              </h2>
              {seeAllBtn("upcoming")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {upcoming.slice(0, expanded.upcoming ? undefined : 8).map((m) => (
                <MovieCard key={m.id} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          </section>


          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 pt-4 pb-6">
            {["‹", "1", "2", "3", "4", "5", "...", "20", "›"].map((p, i) => (
              <button
                key={i}
                className={`min-w-9 border px-3 py-1.5 text-sm transition ${
                  p === "1"
                    ? "border-amber-500 bg-amber-500 text-black font-bold"
                    : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:text-amber-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Categories */}
          <div ref={categoriesRef} className="border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              <span className="border-l-4 border-amber-500 pl-2">Categories</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGenre(activeGenre === g.id ? null : g.id)}
                  className={`border px-2.5 py-1 text-xs transition ${
                    activeGenre === g.id
                      ? "border-amber-500 bg-amber-500 text-black font-semibold"
                      : "border-neutral-700 text-neutral-300 hover:border-amber-500 hover:bg-amber-500 hover:text-black"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Top actors sidebar */}
          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              <span className="border-l-4 border-amber-500 pl-2">Top Actors</span>
            </h3>
            <ul className="space-y-3">
              {actors.slice(0, 6).map((actor, i) => (
                <li key={actor.id}>
                  <button
                    onClick={() => onActorClick(actor)}
                    className="flex w-full items-center gap-3 text-left group"
                  >
                    <span className="text-sm font-bold text-neutral-600 w-4 shrink-0">{i + 1}</span>
                    <img
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w45${actor.profile_path}` : "https://placehold.co/45x45/1a1a1a/555?text=?"}
                      alt={actor.name}
                      className="h-9 w-9 rounded-full object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-200 group-hover:text-amber-400 truncate">{actor.name}</p>
                      <p className="text-xs text-neutral-500">{actor.known_for_department}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Live now */}
          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              <span className="border-l-4 border-amber-500 pl-2">Live Right Now</span>
            </h3>
            <ul className="space-y-3 text-sm">
              {["Premiere Night: New Releases", "Director Q&A Live Stream", "Fan Reviews: Top Rated"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-neutral-300 hover:text-amber-400 cursor-pointer">
                  <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top channels */}
          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">
              <span className="border-l-4 border-amber-500 pl-2">Top Studios</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {["Warner Bros.", "Universal", "Paramount", "Sony Pictures", "A24", "Disney"].map((c, i) => (
                <li
                  key={c}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-neutral-300 group-hover:text-amber-400 transition">
                    <span className="mr-2 text-neutral-600">{i + 1}.</span>{c}
                  </span>
                  <span className="text-xs text-neutral-600">{(Math.random() * 9 + 1).toFixed(1)}M</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
