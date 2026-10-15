import type { APIRoute } from 'astro';
import * as si from 'simple-icons';

/** Monochrome SVG sprite from Simple Icons (CC0). Icons are decorative; every link has visible text. */
const PICK: Record<string, keyof typeof si> = {
  github: 'siGithub',
  x: 'siX',
  telegram: 'siTelegram',
  facebook: 'siFacebook',
  instagram: 'siInstagram',
  vk: 'siVk',
  threads: 'siThreads',
  youtube: 'siYoutube',
  spotify: 'siSpotify',
  applemusic: 'siApplemusic',
  youtubemusic: 'siYoutubemusic',
  deezer: 'siDeezer',
  tidal: 'siTidal',
  soundcloud: 'siSoundcloud',
  rss: 'siRss',
};
/** Not in Simple Icons (removed at the brand's request) or not a brand. */
const EXTRA: Record<string, string> = {
  linkedin:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  mail: 'M2 4h20v16H2V4zm2 2v.4l8 5.2 8-5.2V6H4zm16 2.8-8 5.2-8-5.2V18h16V8.8z',
};

export const GET: APIRoute = () => {
  const symbols = Object.entries(PICK)
    .map(([id, key]) => [id, (si[key] as { path: string }).path] as const)
    .concat(Object.entries(EXTRA))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, d]) => `<symbol id="${id}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`)
    .join('');
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>\n`, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
};
