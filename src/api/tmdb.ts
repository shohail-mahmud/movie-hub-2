const API_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const BASE = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p";

export const posterUrl = (path: string | null, size = "w500") =>
  path ? `${IMG}/${size}${path}` : "https://placehold.co/300x450/1a1a1a/555?text=No+Image";

export const backdropUrl = (path: string | null, size = "w1280") =>
  path ? `${IMG}/${size}${path}` : "https://placehold.co/1280x720/1a1a1a/555?text=No+Image";

export const profileUrl = (path: string | null, size = "w185") =>
  path ? `${IMG}/${size}${path}` : "https://placehold.co/185x278/1a1a1a/555?text=No+Image";

async function get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export interface Paged<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  popularity: number;
}

export interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for?: Movie[];
}

export interface Genre {
  id: number;
  name: string;
}

export const tmdb = {
  trending: (page = 1) => get<Paged<Movie>>("/trending/movie/week", { page: String(page) }),
  popular: (page = 1) => get<Paged<Movie>>("/movie/popular", { page: String(page) }),
  topRated: (page = 1) => get<Paged<Movie>>("/movie/top_rated", { page: String(page) }),
  nowPlaying: (page = 1) => get<Paged<Movie>>("/movie/now_playing", { page: String(page) }),
  upcoming: (page = 1) => get<Paged<Movie>>("/movie/upcoming", { page: String(page) }),
  genres: () => get<{ genres: Genre[] }>("/genre/movie/list"),
  popularActors: (page = 1) => get<Paged<Actor>>("/person/popular", { page: String(page) }),
  actorDetails: (id: number) =>
    get<Actor & { biography: string; birthday: string; place_of_birth: string }>(`/person/${id}`),
  actorMovies: (id: number) => get<{ cast: Movie[] }>(`/person/${id}/movie_credits`),
  movieDetails: (id: number) => get<Movie>(`/movie/${id}`),
  moviesByGenre: (genreId: number, page = 1) =>
    get<Paged<Movie>>("/discover/movie", { with_genres: String(genreId), sort_by: "popularity.desc", page: String(page) }),
  search: (query: string, page = 1) => get<Paged<Movie>>("/search/movie", { query, page: String(page) }),
  searchActors: (query: string, page = 1) => get<Paged<Actor>>("/search/person", { query, page: String(page) }),
};
