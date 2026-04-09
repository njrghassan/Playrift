import { createClient } from "@/lib/supabase/server";
import { SteamOwnedGame } from "@/lib/types";
import { fetchOwnedGames } from "@/services/steamService";
import { NextResponse } from "next/server";

type SessionRow = {
  appid: number;
  name: string;
  recentHours: number;
  totalHours: number;
  lastPlayedAt: number | null;
  imageUrl: string;
};

function toHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

function computeCoreDnaMatch(games: SteamOwnedGame[]) {
  const longTermTop = [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 10)
    .map((g) => g.appid);
  const recentTop = games
    .filter((g) => (g.playtime_2weeks ?? 0) > 0)
    .sort((a, b) => (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0))
    .slice(0, 10)
    .map((g) => g.appid);

  if (recentTop.length === 0 || longTermTop.length === 0) return 0;
  const longSet = new Set(longTermTop);
  const overlap = recentTop.filter((id) => longSet.has(id)).length;
  return Math.round((overlap / recentTop.length) * 1000) / 10;
}

function computeDriftVelocity(games: SteamOwnedGame[]) {
  const recent = games.filter((g) => (g.playtime_2weeks ?? 0) > 0);
  const recentMinutes = recent.reduce((sum, g) => sum + (g.playtime_2weeks ?? 0), 0);
  if (recentMinutes === 0) return 0;

  const longTop = [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 10)
    .map((g) => g.appid);
  const coreSet = new Set(longTop);

  const nonCoreMinutes = recent.reduce((sum, g) => {
    if (!coreSet.has(g.appid)) return sum + (g.playtime_2weeks ?? 0);
    return sum;
  }, 0);

  return Math.round((nonCoreMinutes / recentMinutes) * 1000) / 10;
}

function buildTrajectory(games: SteamOwnedGame[]) {
  const longTop = [...games].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 6);
  const recentByApp = new Map<number, number>();
  games.forEach((g) => recentByApp.set(g.appid, g.playtime_2weeks ?? 0));

  const maxLong = Math.max(1, ...longTop.map((g) => g.playtime_forever));
  const maxRecent = Math.max(1, ...longTop.map((g) => recentByApp.get(g.appid) ?? 0));

  return longTop.map((g) => ({
    label: g.name.length > 14 ? `${g.name.slice(0, 14)}...` : g.name,
    corePct: Math.max(10, Math.round((g.playtime_forever / maxLong) * 100)),
    recentPct: Math.max(10, Math.round(((recentByApp.get(g.appid) ?? 0) / maxRecent) * 100))
  }));
}

function buildSessions(games: SteamOwnedGame[]): SessionRow[] {
  const sorted = [...games].sort((a, b) => {
    const aLast = a.rtime_last_played ?? 0;
    const bLast = b.rtime_last_played ?? 0;
    if (bLast !== aLast) return bLast - aLast;
    return (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0);
  });

  return sorted.slice(0, 5).map((g) => ({
    appid: g.appid,
    name: g.name,
    recentHours: toHours(g.playtime_2weeks ?? 0),
    totalHours: toHours(g.playtime_forever),
    lastPlayedAt: g.rtime_last_played ?? null,
    imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`
  }));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { data: profile } = await supabase.from("users").select("steam_id").eq("id", user.id).single();
    if (!profile?.steam_id) {
      return NextResponse.json({ error: "Steam account is not connected." }, { status: 400 });
    }

    const games = await fetchOwnedGames(profile.steam_id);
    const totalMinutes = games.reduce((sum, g) => sum + g.playtime_forever, 0);
    const recentMinutes = games.reduce((sum, g) => sum + (g.playtime_2weeks ?? 0), 0);

    return NextResponse.json({
      totalGames: games.length,
      totalHours: toHours(totalMinutes),
      recentHours: toHours(recentMinutes),
      coreDnaMatch: computeCoreDnaMatch(games),
      driftVelocity: computeDriftVelocity(games),
      trajectory: buildTrajectory(games),
      sessions: buildSessions(games)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load Steam stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
