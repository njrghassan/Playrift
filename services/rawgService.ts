const BASE = "https://api.rawg.io/api";

type RawgGenre = { id: number; name: string; slug: string };
type RawgGame = {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  genres: RawgGenre[];
};

function getApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is missing.");
  return key;
}

export async function getGameGenresByName(gameName: string): Promise<RawgGenre[]> {
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("search", gameName);
  url.searchParams.set("page_size", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return [];

  const data = await response.json();
  return data?.results?.[0]?.genres ?? [];
}

export async function getGamesByGenres(genreSlugs: string[]): Promise<RawgGame[]> {
  if (genreSlugs.length === 0) return [];

  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("genres", genreSlugs.join(","));
  url.searchParams.set("ordering", "-rating");
  url.searchParams.set("page_size", "40");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) throw new Error("RAWG fetch failed.");

  const data = await response.json();
  return data?.results ?? [];
}
