const FRANKFURTER = "https://api.frankfurter.app/latest";

type Cache = { rates: Record<string, number>; at: number };
let cache: Cache | null = null;
const TTL_MS = 60 * 60 * 1000;

/** 1 USD = rates[currency] units of `currency`. */
async function getUsdRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.rates;

  const url = new URL(FRANKFURTER);
  url.searchParams.set("from", "USD");

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Exchange rate request failed.");

  const payload = (await response.json()) as { rates?: Record<string, number> };
  const rates = payload.rates ?? {};
  const merged = { USD: 1, ...rates };
  cache = { rates: merged, at: now };
  return merged;
}

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND"]);

export async function convertFromUsd(amountUsd: number, targetCurrency: string): Promise<number | null> {
  if (!Number.isFinite(amountUsd)) return null;
  const target = targetCurrency.toUpperCase();
  if (target === "USD") return amountUsd;

  const rates = await getUsdRates();
  const mult = rates[target];
  if (mult === undefined || mult === 0) return null;

  const out = amountUsd * mult;
  if (ZERO_DECIMAL.has(target)) return Math.round(out);
  return Math.round(out * 100) / 100;
}
