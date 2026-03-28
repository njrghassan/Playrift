import { createClient } from "@/lib/supabase/server";
import { fetchOwnedGames } from "@/services/steamService";
import { generateRecommendations } from "@/services/recommendationService";
import { NextResponse } from "next/server";

function buildBehavioralInsight(recentTopGenres: string[], longTopGenres: string[]) {
  const recentPrimary = recentTopGenres[0];
  const longPrimary = longTopGenres[0];
  if (!recentPrimary || !longPrimary) {
    return "Not enough data yet. Play more games to unlock stronger insights.";
  }

  if (recentPrimary === longPrimary) {
    return `Your current behavior strongly aligns with your long-term ${recentPrimary} preference.`;
  }

  return `You've shifted from ${longPrimary} toward ${recentPrimary} based on your recent sessions.`;
}

export async function GET() {
  try {
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
      return NextResponse.json({ error: "Steam account is not connected." }, { status: 400 });
    }

    const { data: blacklistRows } = await supabase
      .from("blacklist")
      .select("game_name")
      .eq("user_id", user.id);

    const ownedGames = await fetchOwnedGames(profile.steam_id);
    const { recommendations, recentTopGenres, longTopGenres } = await generateRecommendations(
      ownedGames,
      (blacklistRows ?? []).map((row) => row.game_name)
    );

    return NextResponse.json({
      insight: buildBehavioralInsight(recentTopGenres, longTopGenres),
      recommendations
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate recommendations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
