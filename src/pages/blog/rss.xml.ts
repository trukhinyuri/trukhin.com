import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { feedItems, feedMeta } from '../../lib/feeds';

export const GET: APIRoute = async ({ site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const meta = feedMeta(site);
  const items = await feedItems(site);
  return rss({
    title: meta.title,
    description: meta.description,
    site: meta.home,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    customData: `<atom:link href="${new URL('/blog/rss.xml', site).href}" rel="self" type="application/rss+xml"/>`,
    items: items.map((i) => ({
      title: i.title,
      link: i.url,
      pubDate: i.published,
      description: i.description,
      content: i.html,
      categories: i.tags,
      customData: `<dc:language>${i.lang}</dc:language>`,
    })),
    trailingSlash: true,
  });
};
