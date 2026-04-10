import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlayTogetherClient from "@/components/PlayTogetherClient";
import { displayNameFromUserMetadataOrEmail } from "@/lib/displayName";
import { steamLibraryHours } from "@/lib/steamLibraryStats";
import { fetchOwnedPlayableGames, fetchPlayerSummary } from "@/services/steamService";
import { generateRecommendations } from "@/services/recommendationService";

export default async function PlayTogetherPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("steam_id, display_name")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata as { display_name?: string; avatar_url?: string } | undefined;
  const displayName = profile?.display_name?.trim() || displayNameFromUserMetadataOrEmail(meta, user.email);
  const appAvatar =
    typeof meta?.avatar_url === "string" && meta.avatar_url.startsWith("http") ? meta.avatar_url : null;

  const steamId = profile?.steam_id ?? null;
  let steamAvatar: string | null = null;
  let librarySize = 0;
  let totalHours = 0;
  let recentHours = 0;
  let suggestions = 0;

  if (steamId) {
    const [games, summary] = await Promise.all([
      fetchOwnedPlayableGames(steamId),
      fetchPlayerSummary(steamId)
    ]);
    const hours = steamLibraryHours(games);
    librarySize = games.length;
    totalHours = hours.totalHours;
    recentHours = hours.recentHours;
    steamAvatar = summary?.avatarfull ?? summary?.avatarmedium ?? summary?.avatar ?? null;

    // Keep this lightweight for initial render.
    const { data: blacklistRows } = await supabase
      .from("blacklist")
      .select("game_name")
      .eq("user_id", user.id);
    const blacklist = (blacklistRows ?? []).map((r) => r.game_name);
    const rec = await generateRecommendations(games, blacklist, { maxResolvedSteamNames: 80 });
    suggestions = rec.recommendations.length;
  }

  const preferredAvatar = appAvatar || steamAvatar;

  return (
    <PlayTogetherClient
      steamConnected={Boolean(steamId)}
      userDisplayName={displayName}
      userAvatarUrl={preferredAvatar ?? undefined}
      userLibrarySize={librarySize}
      userTotalHours={totalHours}
      userRecentHours={recentHours}
      userRecCount={suggestions}
    />
  );
}
