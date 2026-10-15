import { OGImageRoute } from 'astro-og-canvas';
import { SITE } from '../../data/site';
import profile from '../../content/profile/profile.json';
import { fmtDate, postSlug, publishedPosts } from '../../lib/posts';
import { BLOG_INTRO } from '../../data/blog';

/** Typographic 1200×630 cards. The font is Inter (OFL), vendored in /fonts. */
const pages: Record<string, { title: string; description: string }> = {
  index: { title: SITE.name, description: `${profile.roleLine} · ${profile.location}\ntrukhin.com` },
  writing: { title: 'Writing elsewhere', description: `${SITE.name}\ntrukhin.com/writing/` },
  blog: { title: 'Blog', description: `${SITE.name}\n${BLOG_INTRO}` },
};
// Post cards: title, series and date, author. Sorted so the build is deterministic.
for (const p of [...(await publishedPosts())].sort((a, b) => a.id.localeCompare(b.id))) {
  const d = p.data;
  const series = d.series ? `BYTEBURST · Part ${d.seriesOrder} · ` : '';
  pages[`blog/${postSlug(p)}`] = { title: d.title, description: `${series}${fmtDate(d.pubDate, d.lang)}\n${SITE.name} · trukhin.com/blog/` };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getSlug: (path) => `${path}.png`,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[251, 251, 249]],
    border: { color: [31, 79, 191], width: 16, side: 'inline-start' },
    padding: 80,
    cacheDir: false,
    font: {
      title: { families: ['Inter'], weight: 'SemiBold', size: page.title.length > 70 ? 52 : page.title.length > 40 ? 62 : 76, lineHeight: 1.1, color: [22, 24, 29] },
      description: { families: ['Inter'], weight: 'Normal', size: 36, lineHeight: 1.4, color: [85, 91, 102] },
    },
    fonts: ['./fonts/Inter-SemiBold.ttf', './fonts/Inter-Regular.ttf'],
  }),
});
