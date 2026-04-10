import type { SteamOwnedGame } from "@/lib/types";

const MEDIA = "https://media.steampowered.com/steamcommunity/public/images/apps";
const CDN = "https://cdn.akamai.steamstatic.com/steam/apps";

/**
 * High-res landscape assets first (header / large capsules), then portrait / small caps,
 * then Steam community logo hashes (often low-res) as last resort.
 */
export function steamSessionImageUrls(game: SteamOwnedGame): string[] {
  const id = game.appid;
  const logo = game.img_logo_url?.trim();
  const icon = game.img_icon_url?.trim();
  const urls: string[] = [];
  const push = (u: string) => {
    if (!urls.includes(u)) urls.push(u);
  };

  push(`${CDN}/${id}/header.jpg`);
  push(`https://steamcdn-a.akamaihd.net/steam/apps/${id}/header.jpg`);
  push(`${CDN}/${id}/capsule_616x353.jpg`);
  push(`${CDN}/${id}/capsule_467x181.jpg`);
  push(`${CDN}/${id}/library_hero.jpg`);
  push(`https://steamcdn-a.akamaihd.net/steam/apps/${id}/library_600x900.jpg`);
  push(`${CDN}/${id}/capsule_231x87.jpg`);
  if (logo) push(`${MEDIA}/${id}/${logo}.jpg`);
  if (icon) push(`${MEDIA}/${id}/${icon}.jpg`);

  return urls;
}
