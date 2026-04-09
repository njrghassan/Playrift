const BASE = "https://api.rawg.io/api";

type RawgGenre = { id: number; name: string; slug: string };
export type RawgGameSummary = {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  genres: RawgGenre[];
  added?: number;
  ratings_count?: number;
};

type RawgGame = RawgGameSummary;

function getApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is missing.");
  return key;
}

export async function getFirstRawgMatchByName(gameName: string): Promise<RawgGameSummary | null> {
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("search", gameName);
  url.searchParams.set("page_size", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return null;

  const data = await response.json();
  const r = data?.results?.[0] as
    | {
        id: number;
        slug: string;
        name: string;
        background_image?: string | null;
        genres?: RawgGenre[];
        added?: number;
        ratings_count?: number;
      }
    | undefined;
  if (!r?.id || !r.slug) return null;

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    background_image: r.background_image ?? null,
    genres: r.genres ?? [],
    added: r.added,
    ratings_count: r.ratings_count
  };
}

export async function getGameGenresByName(gameName: string): Promise<RawgGenre[]> {
  const match = await getFirstRawgMatchByName(gameName);
  return match?.genres ?? [];
}

export async function getGamesByGenres(genreSlugs: string[]): Promise<RawgGame[]> {
  if (genreSlugs.length === 0) return [];

  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("genres", genreSlugs.join(","));
  // Prefer globally popular titles for recommendation candidates.
  url.searchParams.set("ordering", "-added");
  url.searchParams.set("page_size", "60");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) throw new Error("RAWG fetch failed.");

  const data = await response.json();
  return data?.results ?? [];
}
