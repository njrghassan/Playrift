export function extractSteamId(input: string): string | null {
  const trimmed = input.trim();

  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const profilesIndex = parts.indexOf("profiles");
    if (profilesIndex !== -1 && /^\d{17}$/.test(parts[profilesIndex + 1] ?? "")) {
      return parts[profilesIndex + 1];
    }
  } catch {
    return null;
  }

  return null;
}
