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
};
