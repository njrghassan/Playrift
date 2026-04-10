import { resolvePositiveReviewPercent, type RawgRatingBucket } from "@/lib/rawgRatings";

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
  rating?: number;
  rating_top?: number;
  ratings?: RawgRatingBucket[];
};

type RawgGame = RawgGameSummary;

function getApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is missing.");
  return key;
}

function mapSummary(r: Record<string, unknown> | undefined): RawgGameSummary | null {
  if (!r || typeof r.id !== "number" || typeof r.slug !== "string" || typeof r.name !== "string") return null;
  const genres = (Array.isArray(r.genres) ? r.genres : []) as RawgGenre[];
  const ratings = Array.isArray(r.ratings) ? (r.ratings as RawgRatingBucket[]) : undefined;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    background_image: (r.background_image as string | null | undefined) ?? null,
    genres,
    added: r.added as number | undefined,
    ratings_count: r.ratings_count as number | undefined,
    rating: r.rating as number | undefined,
    rating_top: r.rating_top as number | undefined,
    ratings
  };
}

export async function getFirstRawgMatchByName(gameName: string): Promise<RawgGameSummary | null> {
  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("search", gameName);
  url.searchParams.set("page_size", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return null;

  const data = await response.json();
  return mapSummary(data?.results?.[0] as Record<string, unknown> | undefined);
}

export async function getGameGenresByName(gameName: string): Promise<RawgGenre[]> {
  const match = await getFirstRawgMatchByName(gameName);
  return match?.genres ?? [];
}

export async function getGamesByGenres(genreSlugs: string[], options?: { tags?: string }): Promise<RawgGame[]> {
  if (genreSlugs.length === 0) return [];

  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("genres", genreSlugs.join(","));
  url.searchParams.set("ordering", "-added");
  url.searchParams.set("page_size", "60");
  if (options?.tags) url.searchParams.set("tags", options.tags);

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) throw new Error("RAWG fetch failed.");

  const data = await response.json();
  const results = (data?.results ?? []) as Record<string, unknown>[];
  return results.map((row) => mapSummary(row)).filter(Boolean) as RawgGame[];
}

export async function searchGamesOnRawg(query: string, limit = 20): Promise<RawgGameSummary[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL(`${BASE}/games`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("search", q);
  url.searchParams.set("page_size", String(Math.min(40, limit)));

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return [];

  const data = await response.json();
  const results = (data?.results ?? []) as Record<string, unknown>[];
  const out: RawgGameSummary[] = [];
  for (const row of results) {
    const m = mapSummary(row);
    if (m) out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function pickPcRequirementsFromPlatforms(
  platforms: unknown
): { minimum?: string; recommended?: string } {
  if (!Array.isArray(platforms)) return {};
  for (const p of platforms) {
    const row = p as { platform?: { slug?: string; name?: string }; requirements?: unknown };
    const slug = row.platform?.slug?.toLowerCase();
    const name = row.platform?.name?.toLowerCase() ?? "";
    if (slug !== "pc" && !name.includes("pc")) continue;
    const req = row.requirements as Record<string, string> | string | undefined;
    if (!req) continue;
    if (typeof req === "string") {
      const t = stripHtml(req);
      if (t) return { minimum: t };
      continue;
    }
    const minimum = req.minimum ? stripHtml(req.minimum) : undefined;
    const recommended = req.recommended ? stripHtml(req.recommended) : undefined;
    if (minimum || recommended) return { minimum, recommended };
  }
  return {};
}

function normalizeExternalUrl(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t || t.startsWith("javascript:") || t === "#") return null;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/")) return `https://rawg.io${t}`;
  if (!/^https?:\/\//i.test(t)) return `https://${t}`;
  return t;
}

export function pickRawgStoreUrl(store: Record<string, unknown>): string | null {
  const candidates = [store.url_en, store.url, store.url_ru, store.url_pl];
  for (const c of candidates) {
    const u = normalizeExternalUrl(typeof c === "string" ? c : undefined);
    if (u) return u;
  }
  return null;
}

export type RawgStoreLink = { name: string; url: string };

export type RawgGameDetails = {
  id: number;
  slug: string;
  name: string;
  description_raw: string;
  released: string | null;
  background_image: string | null;
  background_image_additional: string | null;
  website: string | null;
  reddit_url: string | null;
  metacritic_url: string | null;
  metacritic: number | null;
  playtime: number | null;
  genres: RawgGenre[];
  platforms: { id: number; name: string; slug?: string }[];
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  stores: RawgStoreLink[];
  screenshots: { id: number; image: string }[];
  ratings?: RawgRatingBucket[];
  rating?: number;
  rating_top?: number;
  ratings_count?: number;
  positive_review_percent: number | null;
  steam_app_id: number | null;
  pc_requirements_minimum: string | null;
  pc_requirements_recommended: string | null;
};

function mapRawgStores(
  stores: unknown,
  steamAppId: number | null
): RawgStoreLink[] {
  if (!Array.isArray(stores)) return [];
  const seen = new Set<string>();
  const out: RawgStoreLink[] = [];
  for (const row of stores) {
    const s = row as {
      store?: { name?: string; slug?: string };
      url_en?: string;
      url?: string;
    };
    const name = s.store?.name ?? "Store";
    const slug = (s.store?.slug ?? "").toLowerCase();
    let url = pickRawgStoreUrl(s as Record<string, unknown>);
    if ((slug === "steam" || name.toLowerCase() === "steam") && steamAppId) {
      url = `https://store.steampowered.com/app/${steamAppId}/`;
    }
    if (!url) continue;
    const key = `${name}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, url });
  }
  return out;
}

export async function getGameDetailsBySlug(slug: string): Promise<RawgGameDetails | null> {
  const url = new URL(`${BASE}/games/${encodeURIComponent(slug)}`);
  url.searchParams.set("key", getApiKey());

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("RAWG game details failed.");

  const g = (await response.json()) as Record<string, unknown>;
  const id = g.id as number;
  if (!id || typeof g.slug !== "string" || typeof g.name !== "string") return null;

  const steamRaw = g.steam_app_id;
  const steam_app_id =
    typeof steamRaw === "number" && Number.isFinite(steamRaw) ? steamRaw : null;

  let pcMin: string | null = null;
  let pcRec: string | null = null;
  const rootMin = g.pc_requirements as { minimum?: string; recommended?: string } | undefined;
  if (rootMin?.minimum) pcMin = stripHtml(rootMin.minimum) || null;
  if (rootMin?.recommended) pcRec = stripHtml(rootMin.recommended) || null;
  const fromPlatforms = pickPcRequirementsFromPlatforms(g.platforms);
  if (!pcMin && fromPlatforms.minimum) pcMin = fromPlatforms.minimum;
  if (!pcRec && fromPlatforms.recommended) pcRec = fromPlatforms.recommended;

  const ratings = Array.isArray(g.ratings) ? (g.ratings as RawgRatingBucket[]) : undefined;
  const rating = g.rating as number | undefined;
  const rating_top = g.rating_top as number | undefined;
  const positive_review_percent = resolvePositiveReviewPercent(ratings, rating, rating_top);

  const screenshotsRaw = Array.isArray(g.short_screenshots) ? g.short_screenshots : g.screenshots;
  const screenshots: { id: number; image: string }[] = [];
  if (Array.isArray(screenshotsRaw)) {
    for (const sh of screenshotsRaw) {
      const o = sh as { id?: number; image?: string };
      if (o.image) screenshots.push({ id: o.id ?? screenshots.length, image: o.image });
    }
  }

  const platforms = Array.isArray(g.platforms)
    ? (g.platforms as { platform?: { id: number; name: string; slug?: string } }[]).map((p) => ({
        id: p.platform?.id ?? 0,
        name: p.platform?.name ?? "",
        slug: p.platform?.slug
      }))
    : [];

  const genres = (Array.isArray(g.genres) ? g.genres : []) as RawgGenre[];

  return {
    id,
    slug: g.slug,
    name: g.name,
    description_raw: typeof g.description_raw === "string" ? g.description_raw : "",
    released: (g.released as string) ?? null,
    background_image: (g.background_image as string | null) ?? null,
    background_image_additional: (g.background_image_additional as string | null) ?? null,
    website: normalizeExternalUrl(g.website as string | undefined),
    reddit_url: normalizeExternalUrl(g.reddit_url as string | undefined),
    metacritic_url: normalizeExternalUrl(g.metacritic_url as string | undefined),
    metacritic: (g.metacritic as number | null) ?? null,
    playtime: (g.playtime as number | null) ?? null,
    genres,
    platforms,
    developers: (Array.isArray(g.developers) ? g.developers : []) as { id: number; name: string }[],
    publishers: (Array.isArray(g.publishers) ? g.publishers : []) as { id: number; name: string }[],
    stores: mapRawgStores(g.stores, steam_app_id),
    screenshots: screenshots.slice(0, 12),
    ratings,
    rating,
    rating_top,
    ratings_count: g.ratings_count as number | undefined,
    positive_review_percent,
    steam_app_id,
    pc_requirements_minimum: pcMin,
    pc_requirements_recommended: pcRec
  };
}
