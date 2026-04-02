"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RecommendedGame } from "@/lib/types";

type ApiData = {
  recommendations: RecommendedGame[];
  insight: string;
};

export function RecommendationsPanel({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/recommendations");
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Could not load recommendations.");
        setLoading(false);
        return;
      }
      setData(payload);
      setLoading(false);
    }

    load();
  }, [refreshKey]);

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

      {loading && (
        <p className="text-center text-on-surface-variant">Loading recommendations...</p>
      )}
      {error && <p className="text-center text-error">{error}</p>}

      {!loading && !error && (() => {
        const recs = data?.recommendations ?? [];
        const maxScore = Math.max(1, ...recs.map((g) => g.score));

        return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {recs.map((game) => {
            const pct = Math.round((game.score / maxScore) * 100);
            const matchLabel = `${pct}% Match`;
            const tag = game.genres[0]?.name ?? "Match";

            return (
              <article
                key={game.id}
                className="group flex flex-col overflow-hidden rounded-xl bg-surface-container shadow-2xl transition-transform duration-300 hover:translate-y-[-4px]"
              >
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-surface-container-highest">
                    {game.background_image ? (
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
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
                  <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-6">
                    <span className="text-lg font-black text-on-surface">Explore</span>
                    <a
                      href={`https://rawg.io/games/${game.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded bg-primary px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-primary transition-all hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] active:scale-95"
                    >
                      Explore Rift
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        );
      })()}
    </div>
  );
}
