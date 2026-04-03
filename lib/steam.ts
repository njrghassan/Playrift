const STEAM_ID64_REGEX = /^\d{17}$/;

function normalizeToAbsoluteUrl(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export type ParsedSteamInput =
  | { kind: "steam64"; steamId: string }
  | { kind: "vanity"; vanity: string };

/**
 * Parses a Steam profile URL or raw 17-digit SteamID64.
 * Supports /profiles/7656119... and /id/custom-name (vanity) URLs.
 */
export function parseSteamProfileInput(input: string): ParsedSteamInput | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (STEAM_ID64_REGEX.test(trimmed)) {
    return { kind: "steam64", steamId: trimmed };
  }

  let url: URL;
  try {
    url = new URL(normalizeToAbsoluteUrl(trimmed));
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host !== "steamcommunity.com" && !host.endsWith(".steamcommunity.com")) {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);

  const profilesIdx = parts.indexOf("profiles");
  if (profilesIdx !== -1) {
    const id = parts[profilesIdx + 1];
    if (id && STEAM_ID64_REGEX.test(id)) {
      return { kind: "steam64", steamId: id };
    }
  }

  const idIdx = parts.indexOf("id");
  if (idIdx !== -1) {
    const raw = parts[idIdx + 1];
    if (!raw) return null;
    try {
      const vanity = decodeURIComponent(raw);
      if (vanity.length > 0) return { kind: "vanity", vanity };
    } catch {
      return { kind: "vanity", vanity: raw };
    }
  }

  return null;
}
