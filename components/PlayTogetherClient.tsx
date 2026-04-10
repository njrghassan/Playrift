"use client";

import Image from "next/image";
import { useState } from "react";
import type { FriendCompareResponse } from "@/lib/friendCompare";
import { PlayTogetherGameRow } from "@/components/PlayTogetherGameRow";

export default function PlayTogetherClient({
  steamConnected,
  userDisplayName,
  userAvatarUrl,
  userLibrarySize,
  userTotalHours,
  userRecentHours,
  userRecCount
}: {
  steamConnected: boolean;
  userDisplayName: string;
  userAvatarUrl?: string;
  userLibrarySize: number;
  userTotalHours: number;
  userRecentHours: number;
  userRecCount: number;
}) {
  const [friendInput, setFriendInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FriendCompareResponse | null>(null);

  async function compare(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutMs = 110_000;
    const t = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch("/api/friend-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendSteamInput: friendInput }),
        signal: controller.signal
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Compare failed.");
      setData(json);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          `Compare took longer than ${timeoutMs / 1000}s and was cancelled. If it keeps happening, try again in a minute (RAWG rate limits) or a profile with a smaller public library.`
        );
      } else {
        setError(err instanceof Error ? err.message : "Compare failed.");
      }
      setData(null);
    } finally {
      window.clearTimeout(t);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-12">
      <header className="mb-10">
        <p className="font-label text-sm uppercase tracking-[0.2em] text-tertiary">Social</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Play together</h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          Compare with any Steam profile you have a link or ID for—not only people on your friends list. Both
          sides need Steam privacy → Game details set to{" "}
          <span className="font-semibold text-on-surface">Public</span>; Friends-only hides libraries from this
          app, which often feels like “only friends work.”
        </p>
      </header>

      {!steamConnected ? (
        <p className="rounded-xl bg-surface-container-low p-6 text-on-surface-variant">
          <a href="/dashboard/profile#steam" className="font-semibold text-primary underline-offset-2 hover:underline">
            Connect Steam in Profile
          </a>{" "}
          to compare libraries.
        </p>
      ) : (
        <>
          <form onSubmit={compare} className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="font-label text-xs uppercase tracking-wider text-secondary-fixed-dim">
                Their Steam URL or ID
              </span>
              <input
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                placeholder="https://steamcommunity.com/id/… or 7656119…"
                className="mt-1 w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !friendInput.trim()}
              className="rounded-lg bg-primary px-8 py-3 font-label text-sm font-bold uppercase tracking-widest text-on-primary disabled:opacity-50"
            >
              {loading ? "Comparing…" : "Compare"}
            </button>
          </form>

          {error ? <p className="mb-6 text-sm text-error">{error}</p> : null}

          <div className="space-y-12">
            {data?.friendLibraryIssue ? (
              <div
                className="rounded-xl border border-tertiary/40 bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant"
                role="status"
              >
                {data.friendLibraryIssue}
              </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="rounded-xl bg-surface-container-low p-6">
                <div className="flex items-center gap-3">
                  {userAvatarUrl ? (
                    <span className="relative size-10 overflow-hidden rounded-full ring-2 ring-outline-variant/30">
                      <Image src={userAvatarUrl} alt="" fill className="object-cover" sizes="40px" />
                    </span>
                  ) : null}
                  <div className="text-sm font-bold text-on-surface">{userDisplayName}</div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-on-surface-variant">Library</dt>
                    <dd className="font-bold">{userLibrarySize} games</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Lifetime</dt>
                    <dd className="font-bold">{userTotalHours}h</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">2 weeks</dt>
                    <dd className="font-bold">{userRecentHours}h</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Suggestions</dt>
                    <dd className="font-bold">{userRecCount}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  {data?.userInsight ?? "Enter a Steam profile above to start a 1:1 comparison."}
                </p>
              </section>

              <section className="rounded-xl bg-surface-container-low p-6">
                <div className="flex items-center gap-3">
                  {data?.friendAvatarUrl ? (
                    <span className="relative size-10 overflow-hidden rounded-full ring-2 ring-outline-variant/30">
                      <Image src={data.friendAvatarUrl} alt="" fill className="object-cover" sizes="40px" />
                    </span>
                  ) : null}
                  {data?.friendPersonaName ? (
                    <div className="text-sm font-bold text-on-surface">{data.friendPersonaName}</div>
                  ) : (
                    <div className="text-sm text-on-surface-variant">No profile loaded yet.</div>
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-on-surface-variant">Library</dt>
                    <dd className="font-bold">{data?.friendLibrarySize ?? 0} games</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Lifetime</dt>
                    <dd className="font-bold">{data?.friendTotalHours ?? 0}h</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">2 weeks</dt>
                    <dd className="font-bold">{data?.friendRecentHours ?? 0}h</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Suggestions</dt>
                    <dd className="font-bold">{data?.friendRecCount ?? 0}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  {data?.friendInsight ?? "0% until you compare."}
                </p>
              </section>
            </div>

            {data ? (
              <>
                <section className="rounded-xl bg-surface-container p-6">
                  <h2 className="text-lg font-bold">Overlap</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Shared long-term genres:{" "}
                    {data.sharedGenreOverlap.length ? data.sharedGenreOverlap.join(", ") : "—"}
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Both lists agree on {data.sharedCount} suggestions · you-only {data.youOnlyCount} · other-only{" "}
                    {data.friendOnlyCount}
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-bold">You both might like</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {data.sharedRecommendations.map((g) => (
                      <PlayTogetherGameRow key={g.id} game={g} />
                    ))}
                  </div>
                  {data.sharedRecommendations.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No overlapping recommendations this run.</p>
                  ) : null}
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-bold">Co-op together</h2>
                  <p className="mb-4 text-sm text-on-surface-variant">
                    Neither of you owns these; biased toward online co-op signals and your combined taste.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {data.coopRecommendations.map((g) => (
                      <PlayTogetherGameRow key={g.id} game={g} />
                    ))}
                  </div>
                  {data.coopRecommendations.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">
                      No co-op-style picks surfaced — try again after more playtime data or a different profile.
                    </p>
                  ) : null}
                </section>
              </>
            ) : null}
          </div>
        </>
      )}
    </main>
  );
}
