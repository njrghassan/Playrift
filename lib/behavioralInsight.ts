export function behavioralInsightText(
  recentTopGenres: string[],
  longTopGenres: string[],
  perspective: "you" | "they"
): string {
  const recentPrimary = recentTopGenres[0];
  const longPrimary = longTopGenres[0];
  if (!recentPrimary || !longPrimary) {
    return perspective === "you"
      ? "Not enough data yet. Play more games to unlock stronger insights."
      : "Not enough public library data to summarize their taste yet.";
  }
  if (recentPrimary === longPrimary) {
    return perspective === "you"
      ? `Your current behavior strongly aligns with your long-term ${recentPrimary} preference.`
      : `Their recent play still lines up with a long-term ${recentPrimary} lean.`;
  }
  return perspective === "you"
    ? `You've shifted from ${longPrimary} toward ${recentPrimary} based on your recent sessions.`
    : `They're leaning ${recentPrimary} lately compared with a long-running ${longPrimary} pattern.`;
}
