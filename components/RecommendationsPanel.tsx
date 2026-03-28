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
    <section className="space-y-5">
      <div className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/20">
        <h3 className="text-xl font-bold text-primary">Behavioral Insight</h3>
        <p className="mt-1 text-on-surface-variant">
          {data?.insight ?? "Connect Steam to generate your behavioral insight."}
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold text-primary">Recommendations</h3>
        {loading && <p className="text-on-surface-variant">Loading recommendations...</p>}
        {error && <p className="text-error">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.recommendations ?? []).map((game) => (
              <article
                key={game.id}
                className="rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-outline-variant/20"
              >
                <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-surface-container-low">
                  {game.background_image ? (
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <h4 className="font-bold text-primary">{game.name}</h4>
                <p className="mt-1 text-sm text-on-surface-variant">{game.reason}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
