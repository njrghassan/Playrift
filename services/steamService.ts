import { SteamOwnedGame } from "@/lib/types";
import { filterOwnedGamesToPlayableGames } from "@/services/steamStoreGameFilter";

const BASE = "https://api.steampowered.com";

/** Resolves a Steam custom URL slug to 17-digit SteamID64 (ResolveVanityURL). */
export async function resolveVanityToSteam64(vanity: string): Promise<string> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) throw new Error("STEAM_API_KEY is missing.");

  const url = new URL(`${BASE}/ISteamUser/ResolveVanityURL/v0001/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", vanity);

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) throw new Error("Steam API request failed.");

  const payload = await response.json();
  const steamid = payload?.response?.steamid as string | undefined;
  const success = payload?.response?.success as number | undefined;

  if (success !== 1 || !steamid || !/^\d{17}$/.test(steamid)) {
    throw new Error("Could not resolve that Steam custom URL. Check the link or try your numeric profile URL.");
  }

  return steamid;
}

export async function fetchOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) throw new Error("STEAM_API_KEY is missing.");

  const url = new URL(`${BASE}/IPlayerService/GetOwnedGames/v0001/`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) throw new Error("Steam API request failed.");

  const payload = await response.json();
  const games = payload?.response?.games as SteamOwnedGame[] | undefined;

  if (!games) {
    throw new Error("Unable to fetch Steam games. Profile might be private.");
  }

  return games;
}

/** Owned games with non-game / utility Steam listings removed (for sessions + recommender). */
export async function fetchOwnedPlayableGames(steamId: string): Promise<SteamOwnedGame[]> {
  const games = await fetchOwnedGames(steamId);
  return filterOwnedGamesToPlayableGames(games);
}
