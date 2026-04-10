import { parseSteamProfileInput } from "@/lib/steam";
import { createClient } from "@/lib/supabase/server";
import type { FriendCompareResponse } from "@/lib/friendCompare";
import { steamLibraryHours } from "@/lib/steamLibraryStats";
import { compareFriendProfilesAndCoop } from "@/services/friendCompareService";
import { fetchOwnedPlayableGames, resolveVanityToSteam64 } from "@/services/steamService";
import { NextResponse } from "next/server";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const friendInput = body?.friendSteamInput as string | undefined;
    if (!friendInput?.trim()) {
      return NextResponse.json({ error: "Friend Steam URL or ID is required." }, { status: 400 });
    }

    const parsed = parseSteamProfileInput(friendInput);
    if (!parsed) return NextResponse.json({ error: "Invalid friend Steam URL or ID." }, { status: 400 });

    const friendSteamId =
      parsed.kind === "steam64" ? parsed.steamId : await resolveVanityToSteam64(parsed.vanity);

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("steam_id")
      .eq("id", user.id)
      .single();

    if (!profile?.steam_id) {
      return NextResponse.json({ error: "Connect your Steam account first." }, { status: 400 });
    }

    if (friendSteamId === profile.steam_id) {
      return NextResponse.json({ error: "Enter a friend's Steam account, not your own." }, { status: 400 });
    }

    const { data: blacklistRows } = await supabase
      .from("blacklist")
      .select("game_name")
      .eq("user_id", user.id);

    const userBlacklist = (blacklistRows ?? []).map((r) => r.game_name);

    const [userGames, friendGames] = await Promise.all([
      fetchOwnedPlayableGames(profile.steam_id),
      fetchOwnedPlayableGames(friendSteamId)
    ]);

    const compared = await compareFriendProfilesAndCoop(userGames, friendGames, userBlacklist);
    const userHours = steamLibraryHours(userGames);
    const friendHours = steamLibraryHours(friendGames);

    const friendMask = `${friendSteamId.slice(0, 4)}…${friendSteamId.slice(-4)}`;

    let friendLibraryIssue: string | null = null;
    if (friendGames.length === 0) {
      friendLibraryIssue =
        "We loaded 0 games for that profile. This usually means Steam privacy: they need Profile → Edit Profile → Privacy Settings → Game details set to Public (not Friends only). You don’t need to be Steam friends—only their library must be visible to everyone.";
    }

    const payload: FriendCompareResponse = {
      friendSteamMasked: friendMask,
      friendLibraryIssue,
      userInsight: compared.userInsight,
      friendInsight: compared.friendInsight,
      userLibrarySize: userGames.length,
      friendLibrarySize: friendGames.length,
      userTotalHours: userHours.totalHours,
      userRecentHours: userHours.recentHours,
      friendTotalHours: friendHours.totalHours,
      friendRecentHours: friendHours.recentHours,
      userRecCount: compared.userRec.length,
      friendRecCount: compared.friendRec.length,
      sharedGenreOverlap: compared.sharedGenreOverlap,
      sharedCount: compared.sharedRecommendations.length,
      youOnlyCount: compared.youOnlyCount,
      friendOnlyCount: compared.friendOnlyCount,
      sharedRecommendations: compared.sharedRecommendations,
      coopRecommendations: compared.coopRecommendations
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not compare profiles. Libraries must be public.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
