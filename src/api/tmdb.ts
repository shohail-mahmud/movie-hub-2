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

// Normalize a TV show into the Movie shape so existing cards/pages can render it.
interface RawTv {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  seasons?: { season_number: number; episode_count: number; name: string; air_date: string | null }[];
}

export function tvToMovie(t: RawTv): Movie {
  return {
    id: t.id,
    title: t.name,
    poster_path: t.poster_path,
    backdrop_path: t.backdrop_path,
    overview: t.overview,
    release_date: t.first_air_date,
    vote_average: t.vote_average,
    vote_count: t.vote_count,
    popularity: t.popularity,
    genre_ids: t.genre_ids,
    genres: t.genres,
  };
}

export interface TvDetails extends Movie {
  number_of_seasons: number;
  seasons: { season_number: number; episode_count: number; name: string; air_date: string | null }[];
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
  movieVideos: (id: number) =>
    get<{ results: { key: string; site: string; type: string; official: boolean }[] }>(
      `/movie/${id}/videos`,
    ),
  moviesByGenre: (genreId: number, page = 1) =>
    get<Paged<Movie>>("/discover/movie", { with_genres: String(genreId), sort_by: "popularity.desc", page: String(page) }),
  search: (query: string, page = 1) => get<Paged<Movie>>("/search/movie", { query, page: String(page) }),
  searchActors: (query: string, page = 1) => get<Paged<Actor>>("/search/person", { query, page: String(page) }),
  searchTv: async (query: string, page = 1) => {
    const r = await get<Paged<RawTv>>("/search/tv", { query, page: String(page) });
    return { ...r, results: r.results.map(tvToMovie) };
  },

  // TV
  popularTv: async (page = 1) => {
    const r = await get<Paged<RawTv>>("/tv/popular", { page: String(page) });
    return { ...r, results: r.results.map(tvToMovie) };
  },
  trendingTv: async (page = 1) => {
    const r = await get<Paged<RawTv>>("/trending/tv/week", { page: String(page) });
    return { ...r, results: r.results.map(tvToMovie) };
  },
  topRatedTv: async (page = 1) => {
    const r = await get<Paged<RawTv>>("/tv/top_rated", { page: String(page) });
    return { ...r, results: r.results.map(tvToMovie) };
  },
  tvDetails: async (id: number): Promise<TvDetails> => {
    const t = await get<RawTv>(`/tv/${id}`);
    return { ...tvToMovie(t), number_of_seasons: t.number_of_seasons ?? 1, seasons: t.seasons ?? [] };
  },
  tvRecommendations: async (id: number) => {
    const r = await get<Paged<RawTv>>(`/tv/${id}/recommendations`);
    return { ...r, results: r.results.map(tvToMovie) };
  },
  tvCredits: (id: number) => get<{ cast: { id: number; name: string; character: string; profile_path: string | null; known_for_department: string; popularity: number }[] }>(`/tv/${id}/credits`),
};
