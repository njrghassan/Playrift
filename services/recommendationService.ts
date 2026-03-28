import { GenreCount, RecommendedGame, SteamOwnedGame } from "@/lib/types";
import { getGameGenresByName, getGamesByGenres } from "@/services/rawgService";

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

async function buildGenreFrequency(games: SteamOwnedGame[]): Promise<GenreCount> {
  const frequency: GenreCount = {};

  await Promise.all(
    games.map(async (game) => {
      const genres = await getGameGenresByName(game.name);
      genres.forEach((genre) => {
        frequency[genre.slug] = (frequency[genre.slug] ?? 0) + 1;
      });
    })
  );

  return frequency;
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

export async function generateRecommendations(
  ownedGames: SteamOwnedGame[],
  blacklistNames: string[]
): Promise<{
  recommendations: RecommendedGame[];
  recentTopGenres: string[];
  longTopGenres: string[];
}> {
  const { topLongTermGames, recentGames } = splitProfiles(ownedGames);
  const [longTermCount, recentCount] = await Promise.all([
    buildGenreFrequency(topLongTermGames),
    buildGenreFrequency(recentGames)
  ]);

  const longTopGenres = topGenres(longTermCount);
  const recentTopGenres = topGenres(recentCount);
  const candidateGenres = Array.from(new Set([...recentTopGenres, ...longTopGenres]));

  const candidates = await getGamesByGenres(candidateGenres);
  const ownedNames = new Set(ownedGames.map((g) => g.name.toLowerCase()));
  const blacklist = new Set(blacklistNames.map((n) => n.toLowerCase()));

  const recommendations = candidates
    .filter((game) => !ownedNames.has(game.name.toLowerCase()))
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
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return { recommendations, recentTopGenres, longTopGenres };
}
