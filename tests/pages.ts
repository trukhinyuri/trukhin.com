// Page types from DESIGN-SPEC §9 (no Russian post is imported yet, so that type is absent).
export const PAGES = [
  '/',
  '/blog/',
  '/blog/byteburst-8-three-agents-three-philosophies/', // longest post
  '/blog/byteburst-7-ralph-beads-and-bv-a-practicum-for-autonomous-software-development/', // table of contents
  '/blog/byteburst-9-the-computer-that-learned-to-click/', // its own table of contents, wrapped in nav
  '/writing/',
  '/blog/tags/ai/',
  '/blog/series/byteburst/',
  '/blog/search/',
  '/404.html',
];
export const WIDTHS = [1440, 390] as const;
export const SCHEMES = ['light', 'dark'] as const;
