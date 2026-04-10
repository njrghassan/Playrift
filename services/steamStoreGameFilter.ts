import type { SteamOwnedGame } from "@/lib/types";

/** Steam store `type` values we never treat as playable “games” for taste / sessions. */
const EXCLUDED_STEAM_TYPES = new Set([
  "dlc",
  "demo",
  "music",
  "movie",
  "episode",
  "series",
  "video",
  "hardware",
  "advertising"
]);

/**
 * Genres that usually mean “tool / creative app” on Steam (Wallpaper Engine, Blender, etc.).
 * We only drop the app if it also lacks any “core game” genre below.
 */
const SOFTWARE_LIKE_GENRE_IDS = new Set([
  "51", // Animation & Modeling
  "53", // Design & Illustration
  "55", // Photo Editing
  "56", // Audio Production
  "52", // Video Production (legacy id on some listings)
  "58", // Video Production (OBS Studio, Blender, etc.)
  "57", // Utilities
  "84", // Software Training
  "86", // Accounting
  "103", // Web Publishing
  "54" // Education
]);

/** Genres that indicate a normal playable game (keeps DDLC, puzzles, etc. that only tag Casual/Indie/F2P). */
const CORE_GAME_GENRE_IDS = new Set([
  "1", // Action
  "2", // Strategy
  "3", // RPG
  "9", // Racing
  "18", // Sports
  "25", // Adventure
  "28", // Simulation
  "29", // Massively Multiplayer
  "37" // Free To Play (weak signal but common on real games)
]);

type StoreAppPayload = {
  type?: string;
  genres?: { id?: string }[];
};

type StoreLookup =
  | { kind: "ok"; data: StoreAppPayload }
  | { kind: "unlisted" }
  | { kind: "unknown" };

function parseStoreEntry(json: unknown, appid: number): StoreLookup {
  const row = json as Record<string, { success?: boolean; data?: StoreAppPayload } | undefined>;
  const entry = row[String(appid)];
  if (!entry) return { kind: "unknown" };
  if (!entry.success) return { kind: "unlisted" };
  if (!entry.data) return { kind: "unlisted" };
  return { kind: "ok", data: entry.data };
}

function isPlayableGameEntry(data: StoreAppPayload): boolean {
  const t = typeof data.type === "string" ? data.type.toLowerCase() : "";
  if (t && EXCLUDED_STEAM_TYPES.has(t)) return false;

  const genreIds = new Set<string>();
  if (Array.isArray(data.genres)) {
    for (const g of data.genres) {
      if (g && typeof g.id === "string") genreIds.add(g.id);
    }
  }
  if (genreIds.size === 0) return true;

  const hasSoftwareLike = [...genreIds].some((id) => SOFTWARE_LIKE_GENRE_IDS.has(id));
  const hasCore = [...genreIds].some((id) => CORE_GAME_GENRE_IDS.has(id));
  if (hasSoftwareLike && !hasCore) return false;

  return true;
}

function keepGameFromStoreLookup(lookup: StoreLookup): boolean {
  if (lookup.kind === "unknown") return true;
  if (lookup.kind === "unlisted") return false;
  return isPlayableGameEntry(lookup.data);
}

const BATCH = 35;

const STEAM_STORE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; Playrift/1.0; +https://playrift.app) AppleWebKit/537.36 (KHTML, like Gecko)",
  "Accept-Language": "en-US,en;q=0.9"
} as const;

async function fetchStoreLookups(appids: number[]): Promise<Map<number, StoreLookup>> {
  const out = new Map<number, StoreLookup>();
  for (const id of appids) out.set(id, { kind: "unknown" });

  for (let i = 0; i < appids.length; i += BATCH) {
    const slice = appids.slice(i, i + BATCH);
    const url = `https://store.steampowered.com/api/appdetails?appids=${slice.join(",")}&filters=basic,genres`;
    let res = await fetch(url, {
      headers: STEAM_STORE_HEADERS,
      next: { revalidate: 86_400 }
    });
    if (!res.ok) {
      res = await fetch(url, { headers: STEAM_STORE_HEADERS, cache: "no-store" });
    }
    if (!res.ok) continue;

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      continue;
    }

    for (const id of slice) {
      out.set(id, parseStoreEntry(json, id));
    }
  }

  return out;
}

/** Drops DLC, non-game store types, and utility-style apps (e.g. Wallpaper Engine) from the Steam library. */
export async function filterOwnedGamesToPlayableGames(games: SteamOwnedGame[]): Promise<SteamOwnedGame[]> {
  if (games.length === 0) return games;

  const ids = [...new Set(games.map((g) => g.appid))];
  const meta = await fetchStoreLookups(ids);

  return games.filter((g) => keepGameFromStoreLookup(meta.get(g.appid) ?? { kind: "unknown" }));
}
