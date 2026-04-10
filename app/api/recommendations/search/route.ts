import { createClient } from "@/lib/supabase/server";
import { countryToCurrency, isSupportedCurrency } from "@/lib/currency";
import {
  buildLibraryOwnershipContext,
  generateRecommendations,
  isAlreadyInLibrary,
  normalizeGameTitle
} from "@/services/recommendationService";
import { fetchOwnedPlayableGames } from "@/services/steamService";
import { searchGamesOnRawg } from "@/services/rawgService";
import { getCheapestPriceUsdByTitle } from "@/services/cheapSharkService";
import { convertFromUsd } from "@/services/exchangeRateService";
import { resolvePositiveReviewPercent } from "@/lib/rawgRatings";
import type { RecommendedGame } from "@/lib/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getCountryFromRequest(request: NextRequest): string | null {
  const raw =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("cloudfront-viewer-country") ||
    request.headers.get("x-country-code");
  if (!raw || raw.length !== 2) return null;
  return raw.toUpperCase();
}

function resolveDisplayCurrency(request: NextRequest, param: string | null): string {
  const q = param?.trim().toUpperCase() ?? "";
  if (q && q !== "AUTO" && isSupportedCurrency(q)) return q;
  return countryToCurrency(getCountryFromRequest(request));
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ games: [] as RecommendedGame[], currency: "USD" });
    }

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

    const blacklistNames = (blacklistRows ?? []).map((r) => r.game_name);
    const blacklistNorm = new Set(blacklistNames.map((n) => normalizeGameTitle(n)));
    const blacklistLower = new Set(blacklistNames.map((n) => n.toLowerCase()));

    const displayCurrency = resolveDisplayCurrency(
      request,
      request.nextUrl.searchParams.get("currency")
    );

    const ownedGames = await fetchOwnedPlayableGames(profile.steam_id);
    const ctx = await buildLibraryOwnershipContext(ownedGames);
    const { recommendations: mainRecs } = await generateRecommendations(ownedGames, blacklistNames);
    const mainIds = new Set(mainRecs.map((g) => g.id));

    const hits = await searchGamesOnRawg(q, 20);
    const extras: RecommendedGame[] = [];

    for (const game of hits) {
      if (mainIds.has(game.id)) continue;

      let kind: RecommendedGame["search_hit_kind"] = "low_match";
      if (isAlreadyInLibrary(game, ctx.ownedRawgIds, ctx.ownedRawgSlugs, ctx.ownedNormalizedTitles)) {
        kind = "library";
      } else if (
        blacklistLower.has(game.name.toLowerCase()) ||
        blacklistNorm.has(normalizeGameTitle(game.name))
      ) {
        kind = "blacklist";
      }

      const score = 0;
      const reason =
        kind === "library"
          ? "Already in your Steam library."
          : kind === "blacklist"
            ? "On your blacklist."
            : "Not in your current suggestion set — shown because you searched.";

      const price_usd = await getCheapestPriceUsdByTitle(game.name);
      let price: number | null = null;
      if (price_usd != null && Number.isFinite(price_usd)) {
        price =
          displayCurrency === "USD"
            ? price_usd
            : await convertFromUsd(price_usd, displayCurrency);
      }

      extras.push({
        ...game,
        score,
        reason,
        search_hit_kind: kind,
        positive_review_percent: resolvePositiveReviewPercent(
          game.ratings,
          game.rating,
          game.rating_top
        ),
        price_usd,
        price
      });
    }

    return NextResponse.json({ games: extras, currency: displayCurrency });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
