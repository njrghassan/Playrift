import { createClient } from "@/lib/supabase/server";
import { countryToCurrency, isSupportedCurrency } from "@/lib/currency";
import { RecommendedGame } from "@/lib/types";
import { getCheapestPriceUsdByTitle } from "@/services/cheapSharkService";
import { convertFromUsd } from "@/services/exchangeRateService";
import { fetchOwnedPlayableGames } from "@/services/steamService";
import { generateRecommendations } from "@/services/recommendationService";
import type { NextRequest } from "next/server";
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

    const displayCurrency = resolveDisplayCurrency(
      request,
      request.nextUrl.searchParams.get("currency")
    );

    const ownedGames = await fetchOwnedPlayableGames(profile.steam_id);
    const { recommendations, recentTopGenres, longTopGenres } = await generateRecommendations(
      ownedGames,
      (blacklistRows ?? []).map((row) => row.game_name)
    );

    const withPrices = await Promise.all(
      recommendations.map(async (game): Promise<RecommendedGame> => {
        const price_usd = await getCheapestPriceUsdByTitle(game.name);
        let price: number | null = null;
        if (price_usd != null && Number.isFinite(price_usd)) {
          if (displayCurrency === "USD") {
            price = price_usd;
          } else {
            price = await convertFromUsd(price_usd, displayCurrency);
          }
        }
        return { ...game, price_usd, price };
      })
    );

    return NextResponse.json({
      insight: buildBehavioralInsight(recentTopGenres, longTopGenres),
      currency: displayCurrency,
      recommendations: withPrices
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate recommendations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
