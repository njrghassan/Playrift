export type SteamOwnedGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  rtime_last_played?: number;
};

export type GenreCount = Record<string, number>;

export type RecommendedGame = {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  genres: { id: number; name: string; slug: string }[];
  score: number;
  reason: string;
  /** RAWG popularity signals (when present). */
  added?: number;
  ratings_count?: number;
  rating?: number;
  rating_top?: number;
  ratings?: { id: number; title: string; count: number; percent: number }[];
  /** Exceptional + recommended % when RAWG provides segments; else star-derived. */
  positive_review_percent?: number | null;
  /** CheapShark “cheapest current” USD (often Steam); null if unknown. */
  price_usd?: number | null;
  /** Same deal, converted to the API response’s root `currency`; null if unknown or no FX rate. */
  price?: number | null;
  /** Set by recommendations search merge only. */
  search_hit_kind?: "library" | "blacklist" | "low_match";
};
