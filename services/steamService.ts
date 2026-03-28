import { SteamOwnedGame } from "@/lib/types";

const BASE = "https://api.steampowered.com";

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
