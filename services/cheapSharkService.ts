/**
 * CheapShark public API — no key. Used for indicative USD “from” prices (often Steam).
 */

const BASE = "https://www.cheapshark.com/api/1.0";

export async function getCheapestPriceUsdByTitle(gameTitle: string): Promise<number | null> {
  const trimmed = gameTitle.trim();
  if (!trimmed) return null;

  const url = new URL(`${BASE}/games`);
  url.searchParams.set("title", trimmed);
  url.searchParams.set("limit", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return null;

  const rows = (await response.json()) as { cheapest?: string }[] | null;
  const first = rows?.[0];
  if (!first?.cheapest) return null;

  const n = parseFloat(first.cheapest);
  return Number.isFinite(n) ? n : null;
}
