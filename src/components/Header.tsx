import { useEffect, useRef, useState } from "react";
import { tmdb, posterUrl, profileUrl, Movie, Actor } from "@/api/tmdb";

const topNav = ["Home", "Movies", "Series", "Live", "Categories", "Channels", "Stars", "Community"];

export type SearchCategory = "Movies" | "Stars" | "Series";

interface HeaderProps {
  onSearch: (query: string, category: SearchCategory) => void;
  onNav: (page: string) => void;
  activePage: string;
  onMovieClick?: (movie: Movie) => void;
  onActorClick?: (actor: Actor) => void;
  onTvClick?: (movie: Movie) => void;
  onOpenWatchlist?: () => void;
  onOpenHistory?: () => void;
}

export default function Header({ onSearch, onNav, activePage, onMovieClick, onActorClick, onTvClick, onOpenWatchlist, onOpenHistory }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("Movies");
  const [movieSugs, setMovieSugs] = useState<Movie[]>([]);
  const [actorSugs, setActorSugs] = useState<Actor[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingSugs, setLoadingSugs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setMovieSugs([]);
      setActorSugs([]);
      return;
    }
    setLoadingSugs(true);
    const handle = setTimeout(async () => {
      try {
        if (category === "Stars") {
          const res = await tmdb.searchActors(q);
          setActorSugs(res.results.filter((a) => a.profile_path).slice(0, 6));
          setMovieSugs([]);
        } else {
          const res = await tmdb.search(q);
          setMovieSugs(res.results.filter((m) => m.poster_path).slice(0, 6));
          setActorSugs([]);
        }
      } catch {
        setMovieSugs([]);
        setActorSugs([]);
      } finally {
        setLoadingSugs(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query, category]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    onSearch(q, category);
  };

  const hasSugs = movieSugs.length > 0 || actorSugs.length > 0;

  const handleNavClick = (page: string) => {
    setMenuOpen(false);
    onNav(page);
  };

  return (
    <header className="sticky top-0 z-50 w-full">

      <div className="border-b border-neutral-800 bg-black">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="-ml-1 shrink-0 p-2 text-neutral-300 hover:text-amber-400"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <button
            onClick={() => handleNavClick("home")}
            className="flex shrink-0 items-center text-base font-black tracking-tight sm:text-2xl"
          >
            <span className="text-white">Movie</span>
            <span className="ml-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-black sm:px-2">Hub</span>
          </button>

          <div ref={wrapRef} className="relative flex min-w-0 flex-1 sm:max-w-2xl">
            <form onSubmit={submit} className="flex w-full min-w-0 items-stretch overflow-hidden rounded-sm">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SearchCategory)}
                className="shrink-0 border-r border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-200 focus:outline-none sm:px-3 sm:text-sm"
                aria-label="Search category"
              >
                <option value="Movies">Movies</option>
                <option value="Stars">Stars</option>
                <option value="Series">Series</option>
              </select>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={`Search ${category.toLowerCase()}...`}
                className="w-full min-w-0 flex-1 bg-neutral-800 px-2 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none sm:px-3"
              />
              <button type="submit" aria-label="Search" className="shrink-0 bg-amber-500 px-3 text-black transition hover:bg-amber-400 sm:px-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 sm:h-5 sm:w-5">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            {open && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-[70vh] overflow-y-auto border border-neutral-700 bg-neutral-900 shadow-xl">
                {loadingSugs && !hasSugs && (
                  <div className="px-3 py-3 text-xs text-neutral-500">Searching…</div>
                )}
                {!loadingSugs && !hasSugs && (
                  <div className="px-3 py-3 text-xs text-neutral-500">No matches. Press Enter to search anyway.</div>
                )}
                {movieSugs.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setOpen(false); setQuery(""); onMovieClick?.(m); }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-800"
                  >
                    <img src={posterUrl(m.poster_path, "w92")} alt={m.title} className="h-12 w-8 shrink-0 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{m.title}</p>
                      <p className="text-xs text-neutral-500">
                        {m.release_date?.slice(0, 4) || "—"} · ★ {m.vote_average?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                  </button>
                ))}
                {actorSugs.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setOpen(false); setQuery(""); onActorClick?.(a); }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-800"
                  >
                    <img src={profileUrl(a.profile_path, "w185")} alt={a.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{a.name}</p>
                      <p className="text-xs text-neutral-500">{a.known_for_department}</p>
                    </div>
                  </button>
                ))}
                {hasSugs && (
                  <button
                    type="button"
                    onClick={() => submit()}
                    className="block w-full border-t border-neutral-800 px-3 py-2 text-left text-xs font-semibold text-amber-400 hover:bg-neutral-800"
                  >
                    See all results for "{query}" →
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-amber-500 hover:text-amber-400"
              title="Watch History"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 3v5h5M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:inline">History</span>
            </button>
            <button
              onClick={onOpenWatchlist}
              className="flex items-center gap-1.5 bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-amber-400"
              title="Watchlist"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <path d="M5 4h14v17l-7-4-7 4V4z" strokeLinejoin="round" />
              </svg>
              <span className="hidden lg:inline">Watchlist</span>
            </button>
          </div>
        </div>

        {/* Desktop nav removed per design — use search + hamburger on mobile */}

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <nav className="border-t border-neutral-800 bg-neutral-900">
            <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-neutral-800">
              {topNav.map((item) => {
                const key = item.toLowerCase();
                return (
                  <button
                    key={item}
                    onClick={() => handleNavClick(key)}
                    className={`bg-neutral-900 px-4 py-3 text-left text-sm font-medium transition ${
                      activePage === key
                        ? "text-amber-400"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-neutral-800 px-3 py-2">
              <button
                onClick={() => { setMenuOpen(false); onOpenHistory?.(); }}
                className="border border-neutral-700 px-3 py-2 text-sm text-neutral-200 transition hover:border-amber-500 hover:text-amber-400"
              >
                History
              </button>
              <button
                onClick={() => { setMenuOpen(false); onOpenWatchlist?.(); }}
                className="bg-amber-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Watchlist
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
