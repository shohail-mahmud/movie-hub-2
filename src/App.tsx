import { useState } from "react";
import { Movie, Actor } from "../api/tmdb";
import Header from "../components/Header";
import HomePage from "../pages/HomePage";
import ActorPage from "../pages/ActorPage";
import MovieDetailPage from "../pages/MovieDetailPage";
import SearchPage from "../pages/SearchPage";

type View =
  | { type: "home" }
  | { type: "movie"; id: number }
  | { type: "actor"; id: number }
  | { type: "search"; query: string };

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [history, setHistory] = useState<View[]>([]);

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
    }
  };

  const onMovieClick = (movie: Movie) => navigate({ type: "movie", id: movie.id });
  const onActorClick = (actor: Actor) => navigate({ type: "actor", id: actor.id });
  const onSearch = (query: string) => navigate({ type: "search", query });
  const onNav = (page: string) => {
    if (page === "home") navigate({ type: "home" });
  };

  const activePage = view.type === "home" ? "home" : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header onSearch={onSearch} onNav={onNav} activePage={activePage} />

      {view.type === "home" && (
        <HomePage onMovieClick={onMovieClick} onActorClick={onActorClick} />
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
        <SearchPage query={view.query} onMovieClick={onMovieClick} />
      )}

      <footer className="mt-10 border-t border-neutral-800 bg-black">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">MoveHub</h4>
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
              <span className="text-white">Move</span>
              <span className="ml-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-black text-base">Hub</span>
            </div>
            <p>© 2026 MoveHub. All rights reserved. Powered by TMDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
