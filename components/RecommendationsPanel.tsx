"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DISPLAY_CURRENCIES, isSupportedCurrency } from "@/lib/currency";
import {
  positivePercentFromSegments,
  resolvePositiveReviewPercent,
  scoreToStarPercent,
  type RawgRatingBucket
} from "@/lib/rawgRatings";
import { RecommendedGame } from "@/lib/types";
import { RawgReviewBlock } from "@/components/RawgReviewBlock";

const CURRENCY_PREF_KEY = "playrift_currency_pref";

function readStoredCurrencyPref(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENCY_PREF_KEY);
  if (!raw || raw === "auto") return null;
  return isSupportedCurrency(raw) ? raw.toUpperCase() : null;
}

type ApiData = {
  recommendations: RecommendedGame[];
  insight: string;
  currency: string;
};

type SortOption =
  | "match-desc"
  | "match-asc"
  | "popularity-desc"
  | "popularity-asc"
  | "name-asc"
  | "name-desc"
  | "reviews-desc"
  | "reviews-asc";

const INITIAL_VISIBLE_COUNT = 3;
const SEARCH_DEBOUNCE_MS = 350;

function popularityValue(g: RecommendedGame): number {
  return g.added ?? g.ratings_count ?? 0;
}

function formatMoney(value: number | null | undefined, currency: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value <= 0) return "Free";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function reviewPercentForSort(g: RecommendedGame): number | null {
  return (
    g.positive_review_percent ??
    positivePercentFromSegments(g.ratings as RawgRatingBucket[] | undefined) ??
    scoreToStarPercent(g.rating, g.rating_top)
  );
}

function compareByReviewsDesc(a: RecommendedGame, b: RecommendedGame): number {
  const pa = reviewPercentForSort(a);
  const pb = reviewPercentForSort(b);
  if (pa == null && pb == null) return (b.ratings_count ?? 0) - (a.ratings_count ?? 0);
  if (pa == null) return 1;
  if (pb == null) return -1;
  if (pb !== pa) return pb - pa;
  return (b.ratings_count ?? 0) - (a.ratings_count ?? 0);
}

function compareByReviewsAsc(a: RecommendedGame, b: RecommendedGame): number {
  const pa = reviewPercentForSort(a);
  const pb = reviewPercentForSort(b);
  if (pa == null && pb == null) return (a.ratings_count ?? 0) - (b.ratings_count ?? 0);
  if (pa == null) return 1;
  if (pb == null) return -1;
  if (pa !== pb) return pa - pb;
  return (a.ratings_count ?? 0) - (b.ratings_count ?? 0);
}

export function RecommendationsPanel({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [genreSlug, setGenreSlug] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("match-desc");
  const [showAllGames, setShowAllGames] = useState(false);
  const [currencyPref, setCurrencyPref] = useState<string | null>(null);
  const [prefsReady, setPrefsReady] = useState(false);
  const [searchHits, setSearchHits] = useState<RecommendedGame[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setShowAllGames(false);
  }, [refreshKey]);

  useEffect(() => {
    setCurrencyPref(readStoredCurrencyPref());
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const qs =
        currencyPref != null ? `?currency=${encodeURIComponent(currencyPref)}` : "";
      const response = await fetch(`/api/recommendations${qs}`);
      const payload = await response.json();
      if (!response.ok) {
        if (!cancelled) {
          setError(payload.error ?? "Could not load recommendations.");
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setData(payload);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [prefsReady, refreshKey, currencyPref]);

  const genreOptions = useMemo(() => {
    const recs = data?.recommendations ?? [];
    const map = new Map<string, string>();
    for (const g of recs) {
      for (const genre of g.genres) {
        if (!map.has(genre.slug)) map.set(genre.slug, genre.name);
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([slug, name]) => ({ slug, name }));
  }, [data?.recommendations]);

  const mergedList = useMemo(() => {
    const recs = data?.recommendations ?? [];
    const q = query.trim().toLowerCase();
    const mainIds = new Set(recs.map((g) => g.id));

    let extras = searchHits.filter((g) => !mainIds.has(g.id));
    if (genreSlug) {
      extras = extras.filter((g) => g.genres.some((x) => x.slug === genreSlug));
    }

    let base = recs.filter((game) => {
      if (genreSlug && !game.genres.some((g) => g.slug === genreSlug)) return false;
      if (!q) return true;
      if (game.name.toLowerCase().includes(q)) return true;
      if (game.reason.toLowerCase().includes(q)) return true;
      if (game.genres.some((g) => g.name.toLowerCase().includes(q))) return true;
      return false;
    });

    if (q.length >= 2) {
      base = [...base, ...extras];
    }

    return base;
  }, [data?.recommendations, query, genreSlug, searchHits]);

  const filteredSorted = useMemo(() => {
    const list = mergedList;
    const q = query.trim().toLowerCase();

    let filtered = list.filter((game) => {
      if (genreSlug && !game.genres.some((g) => g.slug === genreSlug)) return false;
      if (!q) return true;
      if (game.name.toLowerCase().includes(q)) return true;
      if (game.reason.toLowerCase().includes(q)) return true;
      if (game.genres.some((g) => g.name.toLowerCase().includes(q))) return true;
      if (game.search_hit_kind) return true;
      return false;
    });

    const maxScore = Math.max(1, ...filtered.filter((g) => !g.search_hit_kind).map((g) => g.score));

    filtered = [...filtered].sort((a, b) => {
      switch (sort) {
        case "match-desc":
          return b.score - a.score;
        case "match-asc":
          return a.score - b.score;
        case "popularity-desc":
          return popularityValue(b) - popularityValue(a);
        case "popularity-asc":
          return popularityValue(a) - popularityValue(b);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "reviews-desc":
          return compareByReviewsDesc(a, b);
        case "reviews-asc":
          return compareByReviewsAsc(a, b);
        default:
          return 0;
      }
    });

    return { list: filtered, maxScore };
  }, [mergedList, query, genreSlug, sort]);

  const visibleGames = showAllGames
    ? filteredSorted.list
    : filteredSorted.list.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = Math.max(0, filteredSorted.list.length - INITIAL_VISIBLE_COUNT);
  const showLoading = !prefsReady || loading;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchHits([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    let cancelled = false;
    const t = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const params = new URLSearchParams({ q });
        if (currencyPref != null) params.set("currency", currencyPref);
        const response = await fetch(`/api/recommendations/search?${params.toString()}`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Search failed.");
        if (!cancelled) setSearchHits(payload.games ?? []);
      } catch (e) {
        if (!cancelled) {
          setSearchError(e instanceof Error ? e.message : "Search failed.");
          setSearchHits([]);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, currencyPref, refreshKey]);

  return (
    <div>
      <div className="mb-10 rounded-xl bg-surface-container-low p-6">
        <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
          Behavioral Insight
        </h3>
        <p className="mt-2 text-on-surface-variant">
          {data?.insight ?? "Connect Steam to generate your behavioral insight."}
        </p>
      </div>

      {showLoading && (
        <p className="text-center text-on-surface-variant">Loading recommendations...</p>
      )}
      {error && <p className="text-center text-error">{error}</p>}

      {!showLoading && !error && data && (
        <>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center text-on-surface-variant">
                <SearchIcon className="size-5 shrink-0" />
              </span>
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, genre, or reason..."
                className="w-full rounded-lg border-none bg-surface-container-low py-3 pl-12 pr-4 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 transition focus:ring-2 focus:ring-primary"
                aria-label="Search recommendations"
                role="searchbox"
              />
              {searchLoading ? (
                <p className="mt-1 text-xs text-on-surface-variant">Searching catalog…</p>
              ) : null}
              {searchError ? <p className="mt-1 text-xs text-error">{searchError}</p> : null}
            </div>
            <div className="flex w-full flex-col flex-wrap gap-3 sm:flex-row sm:items-end sm:justify-end">
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[12rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Genre
                </span>
                <select
                  value={genreSlug}
                  onChange={(e) => setGenreSlug(e.target.value)}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="">All genres</option>
                  {genreOptions.map(({ slug, name }) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[14rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Sort by
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="match-desc">Match (high → low)</option>
                  <option value="match-asc">Match (low → high)</option>
                  <option value="popularity-desc">Popularity (high → low)</option>
                  <option value="popularity-asc">Popularity (low → high)</option>
                  <option value="reviews-desc">Reviews (high → low)</option>
                  <option value="reviews-asc">Reviews (low → high)</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                </select>
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:min-w-[14rem] sm:max-w-[18rem]">
                <span className="font-label text-[10px] uppercase tracking-wider text-secondary-fixed-dim">
                  Currency
                </span>
                <select
                  value={currencyPref ?? "auto"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "auto") {
                      setCurrencyPref(null);
                      localStorage.removeItem(CURRENCY_PREF_KEY);
                    } else {
                      setCurrencyPref(v);
                      localStorage.setItem(CURRENCY_PREF_KEY, v);
                    }
                  }}
                  className="rounded-lg border-none bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
                >
                  <option value="auto">Auto (by region)</option>
                  {DISPLAY_CURRENCIES.map(({ code, label }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {filteredSorted.list.length === 0 ? (
            <p className="rounded-xl bg-surface-container-low py-12 text-center text-on-surface-variant">
              No games match your search or filters. Try adjusting them.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {visibleGames.map((game) => {
                  const isExtra = Boolean(game.search_hit_kind);
                  const pct = isExtra
                    ? game.search_hit_kind === "library"
                      ? 0
                      : game.search_hit_kind === "blacklist"
                        ? 0
                        : 0
                    : Math.round((game.score / filteredSorted.maxScore) * 100);
                  const matchLabel = isExtra
                    ? game.search_hit_kind === "library"
                      ? "In library"
                      : game.search_hit_kind === "blacklist"
                        ? "Blacklisted"
                        : "0% match"
                    : `${pct}% Match`;
                  const tag = game.genres[0]?.name ?? "Match";
                  const reviewPct =
                    game.positive_review_percent ??
                    resolvePositiveReviewPercent(game.ratings, game.rating, game.rating_top);

                  return (
                    <article
                      key={`${game.id}-${game.search_hit_kind ?? "rec"}`}
                      className={`group flex flex-col overflow-hidden rounded-xl bg-surface-container shadow-2xl transition-shadow duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] ${
                        isExtra ? "ring-2 ring-primary/40" : ""
                      }`}
                    >
                      <div className="relative h-48 shrink-0 overflow-hidden rounded-t-xl">
                        <div className="absolute inset-0 bg-surface-container-highest">
                          {game.background_image ? (
                            <Image
                              src={game.background_image}
                              alt={game.name}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : null}
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                          <span className="font-label rounded-full bg-primary-container/80 px-3 py-1 text-[10px] font-bold uppercase text-on-primary-container backdrop-blur-md">
                            {matchLabel}
                          </span>
                          <span className="font-label rounded-full bg-surface-container-highest/80 px-3 py-1 text-[10px] uppercase text-on-surface backdrop-blur-md">
                            {tag}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-grow flex-col p-6">
                        <h4 className="mb-2 text-xl font-bold">{game.name}</h4>
                        <p className="mb-6 flex-grow text-sm leading-relaxed text-on-surface-variant">
                          {game.reason}
                        </p>
                        <div className="mt-auto space-y-3 border-t border-outline-variant/10 pt-6">
                          <div className="flex items-baseline justify-between gap-3">
                            <div>
                              <div className="font-label text-[10px] uppercase tracking-wider text-outline">
                                From (deals) · {data.currency}
                              </div>
                              <div className="text-xl font-black tabular-nums text-tertiary">
                                {formatMoney(game.price, data.currency)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <RawgReviewBlock
                              variant="compact"
                              ratings={game.ratings}
                              rating={game.rating}
                              rating_top={game.rating_top}
                              ratings_count={game.ratings_count}
                              positiveOverride={reviewPct}
                            />
                            <Link
                              href={`/dashboard/games/${game.slug}`}
                              className="inline-flex shrink-0 items-center justify-center rounded bg-primary px-4 py-2.5 font-label text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] active:scale-95 sm:self-end"
                            >
                              Explore Rift
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {hiddenCount > 0 ? (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllGames((v) => !v)}
                    className="rounded-lg bg-surface-container-low px-6 py-3 font-label text-sm font-bold uppercase tracking-widest text-primary ring-1 ring-outline-variant/30 transition hover:bg-surface-container-high hover:ring-primary/40"
                  >
                    {showAllGames ? "Show less" : `Show more (${hiddenCount} more)`}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
