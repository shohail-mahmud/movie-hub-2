import { useState } from "react";
import { Movie, Actor } from "@/api/tmdb";
import Header, { SearchCategory } from "@/components/Header";
import HomePage from "@/pages/HomePage";
import ActorPage from "@/pages/ActorPage";
import MovieDetailPage from "@/pages/MovieDetailPage";
import SearchPage from "@/pages/SearchPage";
import ListPage, { ListKind } from "@/pages/ListPage";
import WatchPage from "@/pages/WatchPage";
import UserListPage from "@/pages/UserListPage";
import { ListKey } from "@/lib/userLists";

type View =
  | { type: "home" }
  | { type: "movie"; id: number }
  | { type: "watch"; id: number; mediaType?: "movie" | "tv" }
  | { type: "actor"; id: number }
  | { type: "search"; query: string; category: SearchCategory }
  | { type: "list"; kind: ListKind; navKey?: string }
  | { type: "userlist"; kind: ListKey }
  | { type: "about" };

const navMap: Record<string, { sub?: string; scroll?: "actors" | "categories"; list?: ListKind }> = {
  home: {},
  movies: { sub: "Recommended" },
  series: { list: "tvPopular" },
  live: { sub: "Trending" },
  categories: { scroll: "categories" },
  channels: { scroll: "categories" },
  stars: { list: "actors" },
  community: { sub: "Most Viewed" },
};

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [history, setHistory] = useState<View[]>([]);
  const [homeSubTab, setHomeSubTab] = useState<string | undefined>();
  const [homeScroll, setHomeScroll] = useState<"actors" | "categories" | null>(null);
  const [navTick, setNavTick] = useState(0);
  const [activeNav, setActiveNav] = useState<string>("home");

  const navigate = (next: View) => {
    setHistory((h) => [...h, view]);
    setView(next);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setView(prev);
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    } else {
      setView({ type: "home" });
      setActiveNav("home");
    }
  };

  const onMovieClick = (movie: Movie) => navigate({ type: "movie", id: movie.id });
  const onActorClick = (actor: Actor) => navigate({ type: "actor", id: actor.id });
  const onSearch = (query: string, category: SearchCategory) =>
    navigate({ type: "search", query, category });

  const onNav = (page: string) => {
    const cfg = navMap[page] ?? {};
    setActiveNav(page);

    // If this nav maps to a dedicated list page (e.g. Stars → actors)
    if (cfg.list) {
      setHistory((h) => (view.type === "list" && (view as any).navKey === page ? h : [...h, view]));
      setView({ type: "list", kind: cfg.list, navKey: page });
      if (typeof window !== "undefined") window.scrollTo(0, 0);
      return;
    }

    setHomeSubTab(cfg.sub);
    setHomeScroll(cfg.scroll ?? null);
    setNavTick((t) => t + 1);
    if (view.type !== "home") {
      setHistory((h) => [...h, view]);
      setView({ type: "home" });
    }
    if (!cfg.scroll && typeof window !== "undefined") window.scrollTo(0, 0);
  };

  const activePage =
    view.type === "home"
      ? activeNav
      : view.type === "list" && view.navKey
      ? view.navKey
      : "";

  const onWatch = (movieId: number, mediaType: "movie" | "tv" = "movie") =>
    navigate({ type: "watch", id: movieId, mediaType });
  const onTvClick = (m: Movie) => navigate({ type: "watch", id: m.id, mediaType: "tv" });

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-950 text-white">
      <ConsentGate />
      <Header
        onSearch={onSearch}
        onNav={onNav}
        activePage={activePage}
        onMovieClick={onMovieClick}
        onActorClick={onActorClick}
        onOpenWatchlist={() => navigate({ type: "userlist", kind: "watchlist" })}
        onOpenHistory={() => navigate({ type: "userlist", kind: "history" })}
      />

      {view.type === "home" && (
        <HomePage
          onMovieClick={onMovieClick}
          onActorClick={onActorClick}
          onSeeAll={(kind) => navigate({ type: "list", kind })}
          subTab={homeSubTab}
          scrollTarget={homeScroll}
          navTick={navTick}
        />
      )}

      {view.type === "list" && (
        <ListPage
          kind={view.kind}
          onBack={goBack}
          onMovieClick={onMovieClick}
          onActorClick={onActorClick}
          onTvClick={onTvClick}
        />
      )}

      {view.type === "movie" && (
        <MovieDetailPage
          movieId={view.id}
          onBack={goBack}
          onActorClick={onActorClick}
          onMovieClick={onMovieClick}
          onWatch={onWatch}
        />
      )}

      {view.type === "watch" && (
        <WatchPage
          movieId={view.id}
          mediaType={view.mediaType ?? "movie"}
          onBack={goBack}
          onActorClick={onActorClick}
          onMovieClick={onMovieClick}
        />
      )}

      {view.type === "actor" && (
        <ActorPage actorId={view.id} onBack={goBack} onMovieClick={onMovieClick} />
      )}

      {view.type === "search" && (
        <SearchPage
          query={view.query}
          category={view.category}
          onMovieClick={onMovieClick}
          onActorClick={onActorClick}
        />
      )}

      {view.type === "userlist" && (
        <UserListPage kind={view.kind} onBack={goBack} onMovieClick={onMovieClick} />
      )}

      {view.type === "about" && <AboutPage onBack={goBack} />}

      <footer className="mt-10 border-t border-neutral-800 bg-gradient-to-b from-black to-neutral-950">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand / About */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-3 flex items-center text-xl font-black">
                <span className="text-white">Movie</span>
                <span className="ml-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-black">Hub</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                MovieHub is a free movie streaming platform — discover, track, and watch
                thousands of titles in HD without ads, accounts, or paywalls. Built for
                cinema lovers.
              </p>
              {view.type !== "about" && (
                <button
                  onClick={() => navigate({ type: "about" })}
                  className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  Learn more →
                </button>
              )}
            </div>

            {/* Browse */}
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Browse</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li><button className="hover:text-amber-400" onClick={() => onNav("home")}>Home</button></li>
                <li><button className="hover:text-amber-400" onClick={() => onNav("movies")}>Movies</button></li>
                <li><button className="hover:text-amber-400" onClick={() => onNav("stars")}>Stars</button></li>
                <li><button className="hover:text-amber-400" onClick={() => navigate({ type: "userlist", kind: "watchlist" })}>My Watchlist</button></li>
                <li><button className="hover:text-amber-400" onClick={() => navigate({ type: "userlist", kind: "history" })}>Watch History</button></li>
              </ul>
            </div>

            {/* APIs / Tech */}
            <div className="hidden sm:block">
              <h4 className="mb-3 text-sm font-bold text-white">Powered By</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                <li>
                  <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                    TMDB API <span className="text-neutral-600">— metadata</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.vidking.net/" target="_blank" rel="noreferrer" className="hover:text-amber-400">
                    Vidking <span className="text-neutral-600">— streaming</span>
                  </a>
                </li>
                <li className="text-neutral-500">React + TanStack + Tailwind</li>
              </ul>
              <p className="mt-3 text-[10px] leading-relaxed text-neutral-600">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>

            {/* Credit */}
            <div className="hidden sm:block">
              <h4 className="mb-3 text-sm font-bold text-white">Crafted By</h4>
              <p className="mb-3 text-xs text-neutral-400">
                Designed &amp; built by <span className="font-semibold text-white">Shohail Mahmud</span>
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://instagram.com/shohailmahmud09"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8zm5.7-7.6a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/>
                  </svg>
                  @shohailmahmud09
                </a>
                <a
                  href="https://github.com/shohail-mahmud"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/>
                  </svg>
                  shohail-mahmud
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
            <p>© 2026 MovieHub. A free, ad-free fan project for movie discovery.</p>
            <p className="text-neutral-600">For educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-3 sm:px-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-amber-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <h1 className="text-sm font-semibold sm:text-base">About MovieHub</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-center text-3xl font-black">
          <span className="text-white">Movie</span>
          <span className="ml-1 rounded-sm bg-amber-500 px-2 py-0.5 text-black">Hub</span>
        </div>
        <p className="text-lg leading-relaxed text-neutral-300">
          A free, ad-free streaming companion for movie lovers — discover what to watch,
          track films, and play them instantly. No accounts. No subscriptions. No paywalls.
        </p>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <h2 className="mb-3 border-l-4 border-amber-500 pl-3 text-xl font-bold">What it does</h2>
        <ul className="mb-8 space-y-2 text-sm text-neutral-300">
          <li>🎬 Browse trending, popular, and top-rated movies updated daily</li>
          <li>⭐ Explore famous actors and their filmography</li>
          <li>📺 Watch any title instantly in HD with a built-in player</li>
          <li>💾 Save to a personal Watchlist &amp; auto-track your Watch History (stored locally on your device)</li>
          <li>🔎 Smart search across movies and stars</li>
        </ul>

        <h2 className="mb-3 border-l-4 border-amber-500 pl-3 text-xl font-bold">APIs we use</h2>
        <ul className="mb-8 space-y-2 text-sm text-neutral-300">
          <li><a className="text-amber-400 hover:underline" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a> — all movie, series, and actor metadata, posters, and ratings</li>
          <li><a className="text-amber-400 hover:underline" href="https://www.vidking.net/" target="_blank" rel="noreferrer">Vidking</a> — embedded streaming player</li>
        </ul>
        <p className="mb-8 text-xs text-neutral-500">
          MovieHub uses the TMDB API but is not endorsed or certified by TMDB. All content
          rights belong to their respective owners.
        </p>

        <h2 className="mb-3 border-l-4 border-amber-500 pl-3 text-xl font-bold">Crafted by</h2>
        <div className="rounded-sm border border-neutral-800 bg-neutral-900/60 p-5">
          <p className="text-base font-semibold text-white">Shohail Mahmud</p>
          <p className="mb-3 text-xs text-neutral-500">Designer &amp; Developer</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://instagram.com/shohailmahmud09" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:border-amber-500 hover:text-amber-400">
              Instagram · @shohailmahmud09
            </a>
            <a href="https://github.com/shohail-mahmud" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400">
              GitHub · shohail-mahmud
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
