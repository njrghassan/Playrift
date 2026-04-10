import { cache } from "react";
import { getGameDetailsBySlug, type RawgGameDetails } from "@/services/rawgService";

export const getCachedGameDetailsBySlug = cache((slug: string): Promise<RawgGameDetails | null> =>
  getGameDetailsBySlug(slug)
);
