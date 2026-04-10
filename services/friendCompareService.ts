import { resolvePositiveReviewPercent } from "@/lib/rawgRatings";
import type { RecommendedGame, SteamOwnedGame } from "@/lib/types";
import {
  buildLibraryOwnershipContext,
  generateRecommendations,
  isAlreadyInLibrary
} from "@/services/recommendationService";
import { getGamesByGenres, type RawgGameSummary } from "@/services/rawgService";
import { behavioralInsightText } from "@/lib/behavioralInsight";

/** Caps RAWG title lookups so compare finishes inside server timeouts (full library × 2 was hundreds of requests). */
const COMPARE_RAWG_NAMES_PER_PROFILE = 100;
const COMPARE_RAWG_NAMES_COMBINED = 160;

function popularityOf(game: { added?: number; ratings_count?: number }) {
  return game.added ?? game.ratings_count ?? 0;
}

function coopLikely(name: string, genres: { slug: string }[]): boolean {
  const n = name.toLowerCase();
  if (n.includes("co-op") || n.includes("coop")) return true;
  const slugs = new Set(genres.map((g) => g.slug));
  if (slugs.has("massively-multiplayer")) return true;
  return false;
}

function genreTasteScore(gameGenres: string[], mergedSlugs: string[]): number {
  const weight = new Map<string, number>();
  mergedSlugs.forEach((s, i) => {
    weight.set(s, Math.max(weight.get(s) ?? 0, 20 - i));
  });
  return gameGenres.reduce((acc, slug) => acc + (weight.get(slug) ?? 0), 0);
}

export async function compareFriendProfilesAndCoop(
  userGames: SteamOwnedGame[],
  friendGames: SteamOwnedGame[],
  userBlacklist: string[]
): Promise<{
  userInsight: string;
  friendInsight: string;
  userRec: RecommendedGame[];
  friendRec: RecommendedGame[];
  sharedRecommendations: RecommendedGame[];
  coopRecommendations: RecommendedGame[];
  sharedGenreOverlap: string[];
  youOnlyCount: number;
  friendOnlyCount: number;
}> {
  const rawgOpts = { maxResolvedSteamNames: COMPARE_RAWG_NAMES_PER_PROFILE };
  const userOut = await generateRecommendations(userGames, userBlacklist, rawgOpts);
  const friendOut = await generateRecommendations(friendGames, [], rawgOpts);

  const userInsight = behavioralInsightText(userOut.recentTopGenres, userOut.longTopGenres, "you");
  const friendInsight = behavioralInsightText(friendOut.recentTopGenres, friendOut.longTopGenres, "they");

  const friendIds = new Set(friendOut.recommendations.map((g) => g.id));
  const userIds = new Set(userOut.recommendations.map((g) => g.id));

  const sharedRecommendations = userOut.recommendations.filter((g) => friendIds.has(g.id)).slice(0, 12);
  const youOnlyCount = userOut.recommendations.filter((g) => !friendIds.has(g.id)).length;
  const friendOnlyCount = friendOut.recommendations.filter((g) => !userIds.has(g.id)).length;

  const mergedGenreSlugs = [
    ...new Set([
      ...userOut.recentTopGenres,
      ...userOut.longTopGenres,
      ...friendOut.recentTopGenres,
      ...friendOut.longTopGenres
    ])
  ].slice(0, 8);

  const combinedLibrary = [...userGames, ...friendGames];
  const ctx = await buildLibraryOwnershipContext(combinedLibrary, {
    maxResolvedNames: COMPARE_RAWG_NAMES_COMBINED
  });
  const blacklistLower = new Set(userBlacklist.map((n) => n.toLowerCase()));

  let coopPool: RawgGameSummary[] = [];
  if (mergedGenreSlugs.length > 0) {
    try {
      coopPool = await getGamesByGenres(mergedGenreSlugs, { tags: "online-co-op" });
    } catch {
      coopPool = [];
    }
    if (coopPool.length < 8) {
      try {
        const more = await getGamesByGenres(mergedGenreSlugs);
        const seen = new Set(coopPool.map((g) => g.id));
        for (const g of more) {
          if (!seen.has(g.id)) {
            seen.add(g.id);
            coopPool.push(g);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  const sharedGenreOverlap = userOut.longTopGenres
    .filter((g) => friendOut.longTopGenres.includes(g))
    .slice(0, 6);

  const coopCandidates = coopPool.filter(
    (g) =>
      !isAlreadyInLibrary(g, ctx.ownedRawgIds, ctx.ownedRawgSlugs, ctx.ownedNormalizedTitles) &&
      !blacklistLower.has(g.name.toLowerCase()) &&
      coopLikely(g.name, g.genres)
  );

  const coopRecommendations = coopCandidates
    .map((g) => {
      const slugs = g.genres.map((x) => x.slug);
      const taste = genreTasteScore(slugs, mergedGenreSlugs);
      const rec: RecommendedGame = {
        ...g,
        score: taste,
        reason: "Co-op friendly pick aligned with combined tastes.",
        positive_review_percent: resolvePositiveReviewPercent(g.ratings, g.rating, g.rating_top)
      };
      return rec;
    })
    .sort((a, b) => {
      const p = popularityOf(b) - popularityOf(a);
      if (p !== 0) return p;
      return b.score - a.score;
    })
    .slice(0, 12);

  return {
    userInsight,
    friendInsight,
    userRec: userOut.recommendations,
    friendRec: friendOut.recommendations,
    sharedRecommendations,
    coopRecommendations,
    sharedGenreOverlap,
    youOnlyCount,
    friendOnlyCount
  };
}
