import type { RecommendedGame } from "@/lib/types";

export type FriendCompareResponse = {
  /** Last 4 / first 4 masked Steam id for the compared friend */
  friendSteamMasked?: string;
  /** Shown when Steam returned an empty library (often private / friends-only game details). */
  friendLibraryIssue?: string | null;
  friendPersonaName?: string | null;
  friendAvatarUrl?: string | null;
  userInsight: string;
  friendInsight: string;
  userLibrarySize: number;
  friendLibrarySize: number;
  userTotalHours: number;
  userRecentHours: number;
  friendTotalHours: number;
  friendRecentHours: number;
  userRecCount: number;
  friendRecCount: number;
  sharedGenreOverlap: string[];
  sharedCount: number;
  youOnlyCount: number;
  friendOnlyCount: number;
  sharedRecommendations: RecommendedGame[];
  coopRecommendations: RecommendedGame[];
};
