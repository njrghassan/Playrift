/** ISO 4217 codes Frankfurter typically supports; used for validation + UI. */
export const DISPLAY_CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "NZD", label: "New Zealand Dollar (NZD)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "SEK", label: "Swedish Krona (SEK)" },
  { code: "NOK", label: "Norwegian Krone (NOK)" },
  { code: "DKK", label: "Danish Krone (DKK)" },
  { code: "PLN", label: "Polish Złoty (PLN)" },
  { code: "CZK", label: "Czech Koruna (CZK)" },
  { code: "HUF", label: "Hungarian Forint (HUF)" },
  { code: "RON", label: "Romanian Leu (RON)" },
  { code: "BGN", label: "Bulgarian Lev (BGN)" },
  { code: "BRL", label: "Brazilian Real (BRL)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "CNY", label: "Chinese Yuan (CNY)" },
  { code: "KRW", label: "South Korean Won (KRW)" },
  { code: "SGD", label: "Singapore Dollar (SGD)" },
  { code: "HKD", label: "Hong Kong Dollar (HKD)" },
  { code: "TWD", label: "New Taiwan Dollar (TWD)" },
  { code: "THB", label: "Thai Baht (THB)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "TRY", label: "Turkish Lira (TRY)" },
  { code: "ILS", label: "Israeli Shekel (ILS)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "SAR", label: "Saudi Riyal (SAR)" }
] as const;

const SUPPORTED: Set<string> = new Set(DISPLAY_CURRENCIES.map((c) => c.code));

/** Eurozone (euro as sole legal tender). */
const EUROZONE = new Set([
  "AT",
  "BE",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES"
]);

/** EU members not on the euro. */
const EU_NON_EURO: Record<string, string> = {
  BG: "BGN",
  CZ: "CZK",
  DK: "DKK",
  HU: "HUF",
  PL: "PLN",
  RO: "RON",
  SE: "SEK"
};

const COUNTRY_DEFAULT: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  KR: "KRW",
  CH: "CHF",
  NO: "NOK",
  BR: "BRL",
  MX: "MXN",
  IN: "INR",
  CN: "CNY",
  SG: "SGD",
  HK: "HKD",
  TW: "TWD",
  TH: "THB",
  ZA: "ZAR",
  TR: "TRY",
  IL: "ILS",
  AE: "AED",
  SA: "SAR",
  RU: "RUB",
  UA: "UAH",
  ID: "IDR",
  MY: "MYR",
  PH: "PHP",
  VN: "VND",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN"
};

export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED.has(code.toUpperCase());
}

/**
 * Map ISO 3166-1 alpha-2 country (from CDN / edge headers) to a display currency.
 * Unknown or missing country defaults to USD.
 */
function coerceSupported(code: string): string {
  return isSupportedCurrency(code) ? code.toUpperCase() : "USD";
}

export function countryToCurrency(isoCountry: string | null | undefined): string {
  if (!isoCountry || isoCountry.length !== 2) return "USD";
  const cc = isoCountry.toUpperCase();
  if (EUROZONE.has(cc)) return "EUR";
  if (EU_NON_EURO[cc]) return coerceSupported(EU_NON_EURO[cc]);
  return coerceSupported(COUNTRY_DEFAULT[cc] ?? "USD");
}
