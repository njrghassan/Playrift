import type { SteamOwnedGame } from "@/lib/types";

export function steamLibraryHours(games: SteamOwnedGame[]): {
  totalHours: number;
  recentHours: number;
} {
  const totalMinutes = games.reduce((acc, g) => acc + (g.playtime_forever ?? 0), 0);
  const recentMinutes = games.reduce((acc, g) => acc + (g.playtime_2weeks ?? 0), 0);
  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    recentHours: Math.round((recentMinutes / 60) * 10) / 10
  };
}
