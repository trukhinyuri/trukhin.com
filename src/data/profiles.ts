export type ProfileGroup = 'professional' | 'personal' | 'music';

export interface Profile {
  id: string;
  label: string;
  url: string;
  group: ProfileGroup;
  /** Shown on the page (with rel="me"). Hidden entries wait for a decision. */
  show: boolean;
  /** Listed in JSON-LD sameAs. Must also be a visible link somewhere on the site. */
  sameAs: boolean;
  icon: string;
  verified: { date: string; method: string };
}

export const PROFILES: Profile[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/trukhinyuri', group: 'professional', show: true, sameAs: true, icon: 'linkedin', verified: { date: '2026-10-08', method: 'search snippet (curl returns 999)' } },
  { id: 'github', label: 'GitHub', url: 'https://github.com/trukhinyuri', group: 'professional', show: true, sameAs: true, icon: 'github', verified: { date: '2026-10-08', method: 'GitHub API' } },
  { id: 'x', label: 'X', url: 'https://x.com/trukhinyuri', group: 'professional', show: true, sameAs: true, icon: 'x', verified: { date: '2026-10-08', method: 'og:title' } },
  { id: 'email', label: 'yuri@trukhin.com', url: 'mailto:yuri@trukhin.com', group: 'professional', show: true, sameAs: false, icon: 'mail', verified: { date: '2026-10-08', method: 'card.txt line 49' } },
  { id: 'jetbrains', label: 'JetBrains Blog', url: 'https://blog.jetbrains.com/author/yuri-trukhin-jetbrains-com/', group: 'professional', show: false, sameAs: true, icon: '', verified: { date: '2026-10-08', method: 'WebFetch, two posts' } },
  { id: 'telegram', label: 'Telegram', url: 'https://t.me/trukhinyuri', group: 'personal', show: true, sameAs: true, icon: 'telegram', verified: { date: '2026-10-08', method: 'public channel page' } },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/trukhinyuri', group: 'personal', show: true, sameAs: true, icon: 'facebook', verified: { date: '2026-10-08', method: 'profile page' } },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/trukhinyuri', group: 'personal', show: true, sameAs: true, icon: 'instagram', verified: { date: '2026-10-08', method: 'profile page' } },
  { id: 'threads', label: 'Threads', url: 'https://www.threads.com/@trukhinyuri', group: 'personal', show: false, sameAs: false, icon: 'threads', verified: { date: '2026-10-08', method: 'handle and name' } },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@trukhinyuri', group: 'personal', show: false, sameAs: false, icon: 'youtube', verified: { date: '2026-10-08', method: 'channel page' } },
  { id: 'vk', label: 'VK', url: 'https://vk.com/trukhinyuri', group: 'personal', show: false, sameAs: false, icon: 'vk', verified: { date: '2026-10-08', method: 'named by owner; page content not read (generic title for curl)' } },
  { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/artist/3Izu581nHFTESozRnzoasT', group: 'music', show: true, sameAs: true, icon: 'spotify', verified: { date: '2026-10-08', method: 'artist page' } },
  { id: 'applemusic', label: 'Apple Music', url: 'https://music.apple.com/us/artist/iurii-trukhin/1884603764', group: 'music', show: true, sameAs: true, icon: 'applemusic', verified: { date: '2026-10-08', method: 'iTunes API' } },
  { id: 'youtubemusic', label: 'YouTube Music', url: 'https://music.youtube.com/channel/UCjMehrTd1MhvgvQ-iNPErkQ', group: 'music', show: true, sameAs: true, icon: 'youtubemusic', verified: { date: '2026-10-08', method: 'innertube' } },
  { id: 'deezer', label: 'Deezer', url: 'https://www.deezer.com/artist/373832861', group: 'music', show: true, sameAs: true, icon: 'deezer', verified: { date: '2026-10-08', method: 'Deezer API' } },
  { id: 'tidal', label: 'TIDAL', url: 'https://tidal.com/artist/74580415', group: 'music', show: true, sameAs: true, icon: 'tidal', verified: { date: '2026-10-08', method: 'track page' } },
  { id: 'soundcloud', label: 'SoundCloud', url: 'https://soundcloud.com/trukhinyuri', group: 'music', show: true, sameAs: true, icon: 'soundcloud', verified: { date: '2026-10-08', method: 'profile page' } },
];

export const shown = (group: ProfileGroup) => PROFILES.filter((p) => p.group === group && p.show);
export const sameAs = () => PROFILES.filter((p) => p.sameAs).map((p) => p.url);
export const byId = (id: string) => {
  const p = PROFILES.find((x) => x.id === id);
  if (!p) throw new Error(`unknown profile ${id}`);
  return p;
};
