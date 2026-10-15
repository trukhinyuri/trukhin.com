import type { APIRoute } from 'astro';
import { SITE } from '../../data/site';
import { feedItems, feedMeta } from '../../lib/feeds';

/** JSON Feed 1.1 (https://jsonfeed.org/version/1.1). */
export const GET: APIRoute = async ({ site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const meta = feedMeta(site);
  const items = await feedItems(site);
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: meta.title,
    home_page_url: meta.home,
    feed_url: new URL('/blog/feed.json', site).href,
    description: meta.description,
    language: 'en',
    authors: [{ name: SITE.name, url: new URL('/', site).href }],
    items: items.map((i) => ({
      id: i.id,
      url: i.url,
      title: i.title,
      summary: i.description,
      content_html: i.html,
      date_published: i.published.toISOString(),
      date_modified: i.updated.toISOString(),
      language: i.lang,
      tags: i.tags,
      image: new URL(`/og${new URL(i.url).pathname.replace(/\/$/, '')}.png`, site).href,
    })),
  };
  return new Response(JSON.stringify(feed, null, 2) + '\n', { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } });
};
