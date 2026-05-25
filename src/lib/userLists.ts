import { Movie } from "@/api/tmdb";

export type SavedMovie = Pick<
  Movie,
  "id" | "title" | "poster_path" | "vote_average" | "vote_count" | "release_date"
> & { savedAt: number };

const KEYS = {
  watchlist: "mh.watchlist",
  history: "mh.history",
} as const;

export type ListKey = keyof typeof KEYS;

function read(key: ListKey): SavedMovie[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS[key]) || "[]");
  } catch {
    return [];
  }
}

function write(key: ListKey, items: SavedMovie[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS[key], JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("userlists:change", { detail: key }));
}

export const userLists = {
  get: read,
  has(key: ListKey, id: number) {
    return read(key).some((m) => m.id === id);
  },
  add(key: ListKey, movie: Movie) {
    const items = read(key).filter((m) => m.id !== movie.id);
    items.unshift({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      release_date: movie.release_date,
      savedAt: Date.now(),
    });
    write(key, items.slice(0, 200));
  },
  remove(key: ListKey, id: number) {
    write(key, read(key).filter((m) => m.id !== id));
  },
  toggle(key: ListKey, movie: Movie) {
    if (this.has(key, movie.id)) this.remove(key, movie.id);
    else this.add(key, movie);
  },
  clear(key: ListKey) {
    write(key, []);
  },
};

export function useUserListsKey(): typeof KEYS {
  return KEYS;
}
