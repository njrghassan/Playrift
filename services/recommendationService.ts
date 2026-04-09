import { GenreCount, RecommendedGame, SteamOwnedGame } from "@/lib/types";
import { getFirstRawgMatchByName, getGamesByGenres, RawgGameSummary } from "@/services/rawgService";

type ProfileResult = {
  topLongTermGames: SteamOwnedGame[];
  recentGames: SteamOwnedGame[];
};

function splitProfiles(games: SteamOwnedGame[]): ProfileResult {
  const topLongTermGames = [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 20);

  const recentGames = games
    .filter((g) => (g.playtime_2weeks ?? 0) > 0)
    .sort((a, b) => (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0))
    .slice(0, 20);

  return { topLongTermGames, recentGames };
}

function normalizeGameTitle(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildGenreFrequencyFromLookup(
  games: SteamOwnedGame[],
  rawgBySteamName: Map<string, RawgGameSummary | null>
): GenreCount {
  const frequency: GenreCount = {};
  for (const game of games) {
    const match = rawgBySteamName.get(game.name);
    if (!match) continue;
    match.genres.forEach((genre) => {
      frequency[genre.slug] = (frequency[genre.slug] ?? 0) + 1;
    });
  }
  return frequency;
}

async function mapInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    const part = await Promise.all(slice.map(fn));
    out.push(...part);
  }
  return out;
}

async function buildOwnedLibraryRawgLookup(ownedGames: SteamOwnedGame[]): Promise<Map<string, RawgGameSummary | null>> {
  const uniqueNames = [...new Set(ownedGames.map((g) => g.name))];
  const pairs = await mapInBatches(uniqueNames, 10, async (steamName) => {
    const match = await getFirstRawgMatchByName(steamName);
    return { steamName, match } as const;
  });
  const map = new Map<string, RawgGameSummary | null>();
  for (const { steamName, match } of pairs) {
    map.set(steamName, match);
  }
  return map;
}

function buildOwnershipSets(ownedGames: SteamOwnedGame[], rawgBySteamName: Map<string, RawgGameSummary | null>) {
  const ownedRawgIds = new Set<number>();
  const ownedRawgSlugs = new Set<string>();
  const ownedNormalizedTitles = new Set<string>();

  for (const g of ownedGames) {
    ownedNormalizedTitles.add(normalizeGameTitle(g.name));
  }

  for (const match of rawgBySteamName.values()) {
    if (!match) continue;
    ownedRawgIds.add(match.id);
    ownedRawgSlugs.add(match.slug);
    ownedNormalizedTitles.add(normalizeGameTitle(match.name));
  }

  return { ownedRawgIds, ownedRawgSlugs, ownedNormalizedTitles };
}

function isAlreadyInLibrary(
  game: RawgGameSummary,
  ownedRawgIds: Set<number>,
  ownedRawgSlugs: Set<string>,
  ownedNormalizedTitles: Set<string>
): boolean {
  if (ownedRawgIds.has(game.id)) return true;
  if (ownedRawgSlugs.has(game.slug)) return true;
  if (ownedNormalizedTitles.has(normalizeGameTitle(game.name))) return true;
  return false;
}

function topGenres(genreCount: GenreCount, limit = 5): string[] {
  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}

function scoreGame(
  gameGenres: string[],
  longTermCount: GenreCount,
  recentCount: GenreCount
): number {
  const recentScore = gameGenres.reduce((acc, slug) => acc + (recentCount[slug] ?? 0), 0);
  const longScore = gameGenres.reduce((acc, slug) => acc + (longTermCount[slug] ?? 0), 0);
  return recentScore * 0.7 + longScore * 0.3;
}

function buildReason(gameGenres: string[], recentTop: string[], longTop: string[]): string {
  const recentMatches = gameGenres.filter((g) => recentTop.includes(g));
  const longMatches = gameGenres.filter((g) => longTop.includes(g));
  const recentText = recentMatches.length
    ? `matches your recent ${recentMatches.join(", ")} trend`
    : "aligns with your recent sessions";
  const longText = longMatches.length
    ? `and your long-term ${longMatches.join(", ")} profile`
    : "and long-term profile";
  return `${recentText} ${longText}.`;
}

function popularityOf(game: { added?: number; ratings_count?: number }) {
  return game.added ?? game.ratings_count ?? 0;
}

export async function generateRecommendations(
  ownedGames: SteamOwnedGame[],
  blacklistNames: string[]
): Promise<{
  recommendations: RecommendedGame[];
  recentTopGenres: string[];
  longTopGenres: string[];
}> {
  const { topLongTermGames, recentGames } = splitProfiles(ownedGames);
  const rawgBySteamName = await buildOwnedLibraryRawgLookup(ownedGames);
  const { ownedRawgIds, ownedRawgSlugs, ownedNormalizedTitles } = buildOwnershipSets(
    ownedGames,
    rawgBySteamName
  );

  const longTermCount = buildGenreFrequencyFromLookup(topLongTermGames, rawgBySteamName);
  const recentCount = buildGenreFrequencyFromLookup(recentGames, rawgBySteamName);

  const longTopGenres = topGenres(longTermCount);
  const recentTopGenres = topGenres(recentCount);
  const candidateGenres = Array.from(new Set([...recentTopGenres, ...longTopGenres]));

  const candidates = await getGamesByGenres(candidateGenres);
  const blacklist = new Set(blacklistNames.map((n) => n.toLowerCase()));

  const recommendations = candidates
    .filter(
      (game) =>
        !isAlreadyInLibrary(game, ownedRawgIds, ownedRawgSlugs, ownedNormalizedTitles)
    )
    .filter((game) => !blacklist.has(game.name.toLowerCase()))
    .map((game) => {
      const genreSlugs = game.genres.map((g) => g.slug);
      const score = scoreGame(genreSlugs, longTermCount, recentCount);
      return {
        ...game,
        score,
        reason: buildReason(genreSlugs, recentTopGenres, longTopGenres)
      };
    })
    .sort((a, b) => {
      const popDiff = popularityOf(b) - popularityOf(a);
      if (popDiff !== 0) return popDiff;
      return b.score - a.score;
    })
    .slice(0, 20);

  return { recommendations, recentTopGenres, longTopGenres };
}
