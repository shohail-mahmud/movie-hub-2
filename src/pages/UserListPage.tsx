import { useEffect, useState } from "react";
import { Movie } from "@/api/tmdb";
import MovieCard from "@/components/MovieCard";
import { userLists, SavedMovie, ListKey } from "@/lib/userLists";

interface Props {
  kind: ListKey;
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
}

const META: Record<ListKey, { title: string; empty: string }> = {
  watchlist: { title: "My Watchlist", empty: "Your watchlist is empty. Tap + Watchlist on any movie to save it." },
  history: { title: "Watch History", empty: "No watch history yet. Movies you start playing show up here." },
};

export default function UserListPage({ kind, onBack, onMovieClick }: Props) {
  const [items, setItems] = useState<SavedMovie[]>([]);

  useEffect(() => {
    const sync = () => setItems(userLists.get(kind));
    sync();
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail === kind) sync();
    };
    window.addEventListener("userlists:change", handler);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("userlists:change", handler);
      window.removeEventListener("storage", sync);
    };
  }, [kind]);

  const meta = META[kind];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-amber-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <h1 className="truncate text-sm font-semibold sm:text-base">{meta.title}</h1>
          {items.length > 0 ? (
            <button
              onClick={() => { if (confirm(`Clear ${meta.title}?`)) userLists.clear(kind); }}
              className="text-xs text-neutral-400 hover:text-red-400"
            >
              Clear all
            </button>
          ) : <span className="w-12" />}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="border-l-4 border-amber-500 pl-3 text-base font-bold sm:text-lg">{meta.title}</span>
          <span className="text-xs text-neutral-500">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-neutral-800 bg-neutral-900/40 p-10 text-center text-sm text-neutral-400">
            {meta.empty}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((m) => (
              <div key={m.id} className="relative">
                <MovieCard movie={m as unknown as Movie} onClick={(mv) => onMovieClick(mv)} />
                <button
                  onClick={(e) => { e.stopPropagation(); userLists.remove(kind, m.id); }}
                  className="absolute right-1.5 top-1.5 z-10 h-7 w-7 items-center justify-center bg-black/80 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100 flex"
                  aria-label="Remove"
                  title="Remove"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
