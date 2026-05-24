import { useState } from "react";
import { Movie, Actor } from "@/api/tmdb";
import Header, { SearchCategory } from "@/components/Header";
import HomePage from "@/pages/HomePage";
import ActorPage from "@/pages/ActorPage";
import MovieDetailPage from "@/pages/MovieDetailPage";
import SearchPage from "@/pages/SearchPage";
import ListPage, { ListKind } from "@/pages/ListPage";

type View =
  | { type: "home" }
  | { type: "movie"; id: number }
  | { type: "actor"; id: number }
  | { type: "search"; query: string; category: SearchCategory }
  | { type: "list"; kind: ListKind };

const navMap: Record<string, { sub?: string; scroll?: "actors" | "categories"; list?: ListKind }> = {
  home: {},
  movies: { sub: "Recommended" },
  series: { sub: "New" },
  live: { sub: "Trending" },
  categories: { scroll: "categories" },
  channels: { scroll: "categories" },
  stars: { scroll: "actors" },
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
    setHomeSubTab(cfg.sub);
    setHomeScroll(cfg.scroll ?? null);
    setNavTick((t) => t + 1);
    if (view.type !== "home") {
      setHistory((h) => [...h, view]);
      setView({ type: "home" });
    }
    if (!cfg.scroll && typeof window !== "undefined") window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header
        onSearch={onSearch}
        onNav={onNav}
        activePage={view.type === "home" ? activeNav : ""}
        onMovieClick={onMovieClick}
        onActorClick={onActorClick}
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
        />
      )}

      {view.type === "movie" && (
        <MovieDetailPage
          movieId={view.id}
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

      <footer className="mt-10 border-t border-neutral-800 bg-black">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">MovieHub</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {["About", "Press", "Careers", "Blog"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-amber-400">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Help</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {["Support", "Contact", "Devices", "Accessibility"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-amber-400">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Watch</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {["Movies", "Series", "Live Events", "Originals"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-amber-400">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Legal</h4>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {["Terms", "Privacy", "Cookies", "DMCA"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-amber-400">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
            <div className="flex items-center text-xl font-black">
              <span className="text-white">Movie</span>
              <span className="ml-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-black text-base">Hub</span>
            </div>
            <p>© 2026 MovieHub. All rights reserved. Powered by TMDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
