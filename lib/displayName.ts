export const DISPLAY_NAME_MAX_LENGTH = 80;

export function normalizeDisplayNameInput(raw: string): string {
  return raw.trim();
}

export function isValidDisplayName(raw: string): boolean {
  const t = normalizeDisplayNameInput(raw);
  return t.length > 0 && t.length <= DISPLAY_NAME_MAX_LENGTH;
}

export function displayNameFromUserMetadataOrEmail(
  meta: { display_name?: string } | undefined,
  email: string | null | undefined
): string {
  if (typeof meta?.display_name === "string" && meta.display_name.trim()) {
    return meta.display_name.trim();
  }
  const local = email?.split("@")[0]?.trim();
  if (local) return local.slice(0, DISPLAY_NAME_MAX_LENGTH);
  return "Player";
}
