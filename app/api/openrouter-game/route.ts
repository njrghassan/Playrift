import { createClient } from "@/lib/supabase/server";
import type { RecommendedGame } from "@/lib/types";
import { getGameDetailsBySlug } from "@/services/rawgService";
import { fetchOwnedPlayableGames } from "@/services/steamService";
import { generateRecommendations, normalizeGameTitle } from "@/services/recommendationService";
import { NextResponse } from "next/server";

type RequestBody = {
  prompt: string;
  blacklist?: string[];
  /** Titles already shown this session — pick a different candidate when regenerating. */
  excludeTitles?: string[];
  regenerate?: boolean;
};

function extractJsonObject(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch?.[1] ?? text;

  try {
    return JSON.parse(candidate);
  } catch {
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    if (!objMatch) return null;
    try {
      return JSON.parse(objMatch[0]);
    } catch {
      return null;
    }
  }
}

function briefFromDescription(raw: string, max = 240): string {
  const plain = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

function normalizedInSet(name: string, set: Set<string>): boolean {
  return set.has(normalizeGameTitle(name));
}

function resolvePickFromCandidates(
  titleFromLlm: string,
  candidates: RecommendedGame[]
): RecommendedGame | undefined {
  const t = normalizeGameTitle(titleFromLlm);
  const exact = candidates.find((c) => normalizeGameTitle(c.name) === t);
  if (exact) return exact;

  return candidates.find(
    (c) =>
      normalizeGameTitle(c.name).includes(t) ||
      t.includes(normalizeGameTitle(c.name))
  );
}

/** User is asking for newer / recently launched games. */
function wantsRecentReleases(prompt: string): boolean {
  const p = prompt.toLowerCase();
  const phrases = [
    "newly released",
    "new release",
    "new releases",
    "new game",
    "new games",
    "just released",
    "recently released",
    "just came out",
    "brand new",
    "brand-new",
    "most recent",
    "latest game",
    "newest game",
    "latest release",
    "newest release",
    "released this year",
    "released recently",
    "out now",
    "day one",
    "day-one",
    "fresh release",
    "current gen",
    "next-gen"
  ];
  if (phrases.some((x) => p.includes(x))) return true;
  if (/released in 20\d{2}/.test(p)) return true;
  return false;
}

function parseReleasedDate(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function filterByReleasedSince(games: RecommendedGame[], months: number): RecommendedGame[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  cutoff.setHours(0, 0, 0, 0);
  return games.filter((g) => {
    const d = parseReleasedDate(g.released);
    if (!d) return false;
    return d >= cutoff;
  });
}

function formatReleasedForUi(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      day: "numeric",
      timeZone: "UTC"
    });
  }
  return iso;
}

function buildRecencyPool(
  candidates: RecommendedGame[],
  wantsRecent: boolean
): {
  pool: RecommendedGame[];
  monthsUsed: number | null;
  relaxedNewestDated: boolean;
  relaxedFullPool: boolean;
} {
  if (!wantsRecent) {
    return { pool: candidates, monthsUsed: null, relaxedNewestDated: false, relaxedFullPool: false };
  }

  const windows = [24, 36, 48, 60, 84] as const;
  for (const w of windows) {
    const filtered = filterByReleasedSince(candidates, w);
    if (filtered.length >= 5) {
      return { pool: filtered, monthsUsed: w, relaxedNewestDated: false, relaxedFullPool: false };
    }
  }

  const withDates = candidates.filter((g) => parseReleasedDate(g.released));
  if (withDates.length >= 4) {
    const sorted = [...withDates].sort(
      (a, b) =>
        (parseReleasedDate(b.released)?.getTime() ?? 0) -
        (parseReleasedDate(a.released)?.getTime() ?? 0)
    );
    return {
      pool: sorted.slice(0, 35),
      monthsUsed: null,
      relaxedNewestDated: true,
      relaxedFullPool: false
    };
  }

  return {
    pool: candidates,
    monthsUsed: null,
    relaxedNewestDated: false,
    relaxedFullPool: true
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing in environment." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RequestBody;
    const prompt = body?.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
    }

    const blacklist = (body?.blacklist ?? []).filter(Boolean).slice(0, 30);
    const excludeRaw = (body?.excludeTitles ?? []).filter(Boolean).slice(0, 40);
    const excludeSet = new Set(excludeRaw.map((n) => normalizeGameTitle(n)));
    const isRegenerate = Boolean(body?.regenerate);

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("steam_id")
      .eq("id", user.id)
      .single();

    if (!profile?.steam_id) {
      return NextResponse.json(
        {
          error: "Connect your Steam account in Profile to blend Quick Game Pick with your library algorithm.",
          code: "NO_STEAM"
        },
        { status: 400 }
      );
    }

    const wantsRecent = wantsRecentReleases(prompt);

    const ownedGames = await fetchOwnedPlayableGames(profile.steam_id);
    const { recommendations, recentTopGenres, longTopGenres } = await generateRecommendations(
      ownedGames,
      blacklist,
      {
        maxResolvedSteamNames: 80,
        maxResults: 50,
        genreGamesOrdering: wantsRecent ? "-released" : undefined
      }
    );

    const candidates = recommendations.filter((g) => !normalizedInSet(g.name, excludeSet));

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error:
            "No more picks left for this prompt with your current exclusions. Try changing your prompt or tap Regenerate after clearing exclusions.",
          code: "NO_CANDIDATES"
        },
        { status: 400 }
      );
    }

    const {
      pool: poolForLlm,
      monthsUsed: recencyMonthsUsed,
      relaxedNewestDated,
      relaxedFullPool
    } = buildRecencyPool(candidates, wantsRecent);

    const todayIso = new Date().toISOString().slice(0, 10);

    const candidateBlock = poolForLlm
      .slice(0, 35)
      .map((g, i) => {
        const genreNames = g.genres.map((x) => x.name).join(", ") || "—";
        const rel = g.released?.trim() ? g.released : "unknown";
        return `${i + 1}. "${g.name}" — released: ${rel} — genres: ${genreNames} — taste fit: ${g.reason} (score ${g.score.toFixed(1)})`;
      })
      .join("\n");

    const tasteSummary = `Recent genre leanings: ${recentTopGenres.join(", ") || "n/a"}. Long-term: ${longTopGenres.join(", ") || "n/a"}.`;

    let recencyUserNote = "";
    if (wantsRecent) {
      if (recencyMonthsUsed != null) {
        recencyUserNote = `The user asked for a relatively new release. Candidates are limited to games whose listed release date is within roughly the last ${recencyMonthsUsed} months (when RAWG provides a date). Prefer the newest release dates among strong taste matches.\n\n`;
      } else if (relaxedNewestDated) {
        recencyUserNote =
          "The user asked for newer games. Tight date windows had few options; candidates are the newest-dated games in the taste pool (by RAWG release date). Prefer the newest among them.\n\n";
      } else if (relaxedFullPool) {
        recencyUserNote =
          "The user asked for newer games, but many candidates lack release metadata in RAWG. Still pick the best prompt + taste match; if the chosen game is older, state its real release era honestly.\n\n";
      }
    }

    const factualRules =
      "FACTUAL RULES: Each candidate line includes RAWG `released` (YYYY-MM-DD) or `unknown`. " +
      `Today's date is ${todayIso} (UTC). ` +
      "Never call a game 'newly released', 'just released', 'brand new', 'recent launch', or similar unless its `released` date is within the last 24 months of today. " +
      "If the release date is older, you MUST acknowledge the real year/era in `answer` or `game.reason` and lean on gameplay fit instead of false recency. " +
      "Do not invent or guess release dates.";

    const systemPrompt =
      "You are a PC/console video game recommender. You MUST choose exactly ONE game from the numbered CANDIDATES list. " +
      "Pick the single candidate that best matches BOTH the user's natural-language mood (prompt) AND their taste profile lines (algorithm). " +
      "If several fit, prefer the one that most directly satisfies the prompt. " +
      "You must copy the candidate's title EXACTLY including punctuation and subtitles as shown in quotes after each number. " +
      factualRules +
      " Return ONLY valid JSON (no markdown) with schema: " +
      '{ "answer": string, "game": { "title": string, "genre": string, "reason": string } }. ' +
      "answer: at most 2 sentences. reason: at most 3 sentences; must respect real release dates from the list. genre: short label from the candidate's genres.";

    const userPrompt =
      `${tasteSummary}\n\n` +
      recencyUserNote +
      (blacklist.length ? `User blacklist (never choose): ${blacklist.join(", ")}\n\n` : "") +
      (excludeRaw.length
        ? `Already suggested this session (do not repeat): ${excludeRaw.join(", ")}\n\n`
        : "") +
      `User prompt / mood: ${prompt}\n\n` +
      `CANDIDATES (choose exactly one title verbatim from quotes):\n${candidateBlock}`;

    const baseTemp = wantsRecent ? 0.38 : 0.62;
    const regTemp = wantsRecent ? 0.55 : 0.85;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: isRegenerate ? regTemp : baseTemp,
        max_tokens: 450
      })
    });

    const raw: unknown = await response.json();
    if (!response.ok) {
      const rawError = raw as { error?: { message?: unknown } };
      return NextResponse.json(
        {
          error:
            typeof rawError?.error?.message === "string"
              ? rawError.error.message
              : "OpenRouter request failed."
        },
        { status: 500 }
      );
    }

    type OpenRouterChatChoice = {
      message?: { content?: unknown };
      text?: unknown;
    };
    const rawChat = raw as { choices?: OpenRouterChatChoice[] };
    const contentRaw =
      rawChat?.choices?.[0]?.message?.content ?? rawChat?.choices?.[0]?.text;
    const content = typeof contentRaw === "string" ? contentRaw : "";

    const parsed = extractJsonObject(content);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { error: "Could not parse LLM response." },
        { status: 500 }
      );
    }

    const result = parsed as {
      answer?: unknown;
      game?: { title?: unknown; genre?: unknown; reason?: unknown };
    };

    if (typeof result.answer !== "string") {
      return NextResponse.json(
        { error: "LLM response missing 'answer'." },
        { status: 500 }
      );
    }

    const llmTitle =
      result.game?.title && typeof result.game.title === "string" ? result.game.title.trim() : "";
    if (!llmTitle) {
      return NextResponse.json({ error: "LLM response missing game title." }, { status: 500 });
    }

    const matched = resolvePickFromCandidates(llmTitle, poolForLlm);
    if (!matched) {
      return NextResponse.json(
        { error: "Model picked a game outside the candidate list. Try again." },
        { status: 500 }
      );
    }

    let briefDetail: string | null = null;
    let detailReleased: string | null = null;
    try {
      const details = await getGameDetailsBySlug(matched.slug);
      if (details?.description_raw) {
        briefDetail = briefFromDescription(details.description_raw);
      }
      detailReleased = details?.released ?? null;
    } catch {
      // RAWG optional
    }

    const releasedIso = matched.released ?? detailReleased ?? null;

    const display = {
      slug: matched.slug,
      name: matched.name,
      background_image: matched.background_image,
      genres: matched.genres.map((g) => g.name),
      platforms: matched.platforms ?? [],
      algorithm_reason: matched.reason,
      released: releasedIso,
      released_display: formatReleasedForUi(releasedIso),
      brief_detail:
        briefDetail ??
        `${matched.reason} Strong match (${matched.score.toFixed(1)}) for your recent and long-term genres.`
    };

    const flags = {
      recency_prompt: wantsRecent,
      recency_months_used: recencyMonthsUsed,
      recency_relaxed_newest_dated: relaxedNewestDated,
      recency_relaxed_full_pool: relaxedFullPool,
      rawg_ordering_released: wantsRecent
    };

    return NextResponse.json({
      answer: result.answer,
      insight: tasteSummary,
      flags,
      game: {
        title: matched.name,
        genre:
          typeof result.game?.genre === "string" ? result.game.genre : undefined,
        reason:
          typeof result.game?.reason === "string" ? result.game.reason : undefined
      },
      display
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
