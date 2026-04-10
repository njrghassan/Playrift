import type { RawgRatingBucket } from "@/lib/rawgRatings";
import { positivePercentFromSegments, resolvePositiveReviewPercent, scoreToStarPercent } from "@/lib/rawgRatings";

type Props = {
  ratings?: RawgRatingBucket[];
  rating?: number;
  rating_top?: number;
  ratings_count?: number;
  positiveOverride?: number | null;
  variant: "compact" | "full";
};

export function RawgReviewBlock({
  ratings,
  rating,
  rating_top,
  ratings_count,
  positiveOverride,
  variant
}: Props) {
  const positive =
    positiveOverride != null
      ? positiveOverride
      : resolvePositiveReviewPercent(ratings, rating, rating_top);
  const segFallback = positive == null ? positivePercentFromSegments(ratings) : null;
  const fillPctRaw = positive ?? segFallback ?? scoreToStarPercent(rating, rating_top);
  const fillPct = fillPctRaw != null ? Math.min(100, Math.max(0, fillPctRaw)) : null;

  if (variant === "compact") {
    return (
      <div className="min-w-0 flex-1">
        <div className="font-label text-[10px] uppercase tracking-wider text-outline">Reviews</div>
        {fillPct != null ? (
          <>
            <div className="mt-1 text-sm font-bold tabular-nums text-on-surface">
              {Math.round(fillPct * 10) / 10}% positive
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
              role="progressbar"
              aria-valuenow={Math.round(fillPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Positive review share"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </>
        ) : (
          <div className="mt-1 text-sm text-on-surface-variant">—</div>
        )}
        {ratings_count != null && ratings_count > 0 ? (
          <div className="mt-1 text-xs text-on-surface-variant">{ratings_count.toLocaleString()} ratings</div>
        ) : null}
      </div>
    );
  }

  const summaryPositive = fillPctRaw;

  return (
    <section className="rounded-xl bg-surface-container-low p-6">
      <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
        Player reviews (RAWG)
      </h3>
      {summaryPositive != null ? (
        <p className="mt-2 text-lg font-bold text-on-surface">
          {Math.round(summaryPositive * 10) / 10}% positive tone
        </p>
      ) : (
        <p className="mt-2 text-on-surface-variant">No review breakdown from RAWG for this title.</p>
      )}
      {ratings_count != null && ratings_count > 0 ? (
        <p className="mt-1 text-sm text-on-surface-variant">
          {ratings_count.toLocaleString()} total ratings
          {rating != null && rating_top != null ? (
            <>
              {" "}
              · avg {rating} / {rating_top}
            </>
          ) : null}
        </p>
      ) : null}

      {fillPct != null ? (
        <div
          className="mt-4 h-4 w-full overflow-hidden rounded-full bg-surface-container-highest"
          role="progressbar"
          aria-valuenow={Math.round(fillPct)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      ) : null}

      {ratings && ratings.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {ratings.map((r) => (
            <li key={r.id} className="flex justify-between gap-2 text-on-surface-variant">
              <span className="capitalize">{r.title}</span>
              <span className="tabular-nums text-on-surface">{r.percent}%</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
