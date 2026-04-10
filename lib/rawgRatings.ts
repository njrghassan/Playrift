export type RawgRatingBucket = { id: number; title: string; count: number; percent: number };

const POSITIVE_TITLES = new Set(["exceptional", "recommended"]);

export function positivePercentFromSegments(ratings: RawgRatingBucket[] | undefined): number | null {
  if (!ratings?.length) return null;
  let sum = 0;
  for (const r of ratings) {
    const key = r.title?.toLowerCase().replace(/\s+/g, " ").trim() ?? "";
    if (POSITIVE_TITLES.has(key)) sum += r.percent ?? 0;
  }
  if (sum <= 0) return null;
  return Math.min(100, Math.round(sum * 10) / 10);
}

export function scoreToStarPercent(rating: number | undefined, ratingTop: number | undefined): number | null {
  if (rating == null || ratingTop == null || ratingTop <= 0) return null;
  return Math.min(100, Math.round(((rating / ratingTop) * 100) * 10) / 10);
}

export function resolvePositiveReviewPercent(
  ratings: RawgRatingBucket[] | undefined,
  rating: number | undefined,
  ratingTop: number | undefined
): number | null {
  return positivePercentFromSegments(ratings) ?? scoreToStarPercent(rating, ratingTop);
}
