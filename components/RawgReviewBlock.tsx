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

const BUCKET_ORDER = ["exceptional", "recommended", "meh", "skip"] as const;

function sortRatingBuckets(ratings: RawgRatingBucket[]): RawgRatingBucket[] {
  return [...ratings].sort((a, b) => {
    const ta = a.title?.toLowerCase().trim() ?? "";
    const tb = b.title?.toLowerCase().trim() ?? "";
    const ia = BUCKET_ORDER.findIndex((k) => ta.includes(k));
    const ib = BUCKET_ORDER.findIndex((k) => tb.includes(k));
    const na = ia === -1 ? 999 : ia;
    const nb = ib === -1 ? 999 : ib;
    if (na !== nb) return na - nb;
    return a.title.localeCompare(b.title);
  });
}

function segmentColorClass(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("exceptional")) return "bg-emerald-500";
  if (t.includes("recommended")) return "bg-violet-400";
  if (t.includes("meh")) return "bg-amber-500";
  if (t.includes("skip")) return "bg-rose-600";
  return "bg-slate-500";
}

function SegmentedReviewBar({
  segments,
  compact
}: {
  segments: RawgRatingBucket[];
  compact?: boolean;
}) {
  const visible = segments.filter((r) => (r.percent ?? 0) > 0);
  if (visible.length === 0) return null;

  const h = compact ? "h-2" : "h-4";
  const columns = visible.map((r) => `${Math.max(r.percent, 0.01)}fr`).join(" ");
  const label = visible.map((r) => `${r.title} ${r.percent}%`).join(", ");

  return (
    <div
      className={`grid w-full overflow-hidden rounded-full bg-surface-container-highest ${h}`}
      style={{ gridTemplateColumns: columns }}
      role="img"
      aria-label={`Review mix: ${label}`}
    >
      {visible.map((r) => (
        <div
          key={r.id}
          className={`min-w-0 ${segmentColorClass(r.title)}`}
          title={`${r.title}: ${r.percent}%`}
        />
      ))}
    </div>
  );
}

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

  const segmentList = ratings?.length ? sortRatingBuckets(ratings) : [];
  const hasSegments = segmentList.some((r) => (r.percent ?? 0) > 0);

  if (variant === "compact") {
    return (
      <div className="min-w-0 flex-1">
        <div className="font-label text-[10px] uppercase tracking-wider text-outline">Reviews</div>
        {fillPct != null ? (
          <>
            <div className="mt-1 text-sm font-bold tabular-nums text-on-surface">
              {Math.round(fillPct * 10) / 10}% positive
            </div>
            {hasSegments ? (
              <div className="mt-2">
                <SegmentedReviewBar segments={segmentList} compact />
              </div>
            ) : (
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
            )}
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

      {hasSegments ? (
        <div className="mt-4">
          <SegmentedReviewBar segments={segmentList} />
        </div>
      ) : fillPct != null ? (
        <div
          className="mt-4 h-4 w-full overflow-hidden rounded-full bg-surface-container-highest"
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
      ) : null}

      {ratings && ratings.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {sortRatingBuckets(ratings).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-on-surface-variant">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`size-2.5 shrink-0 rounded-sm ${segmentColorClass(r.title)}`}
                  aria-hidden
                />
                <span className="capitalize">{r.title}</span>
              </span>
              <span className="tabular-nums text-on-surface">{r.percent}%</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
