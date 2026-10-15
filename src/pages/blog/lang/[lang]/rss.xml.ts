import rss from '@astrojs/rss';
import type { APIRoute, GetStaticPaths } from 'astro';
import { feedItems, feedMeta } from '../../../../lib/feeds';
import { langsOf, publishedPosts, type Lang } from '../../../../lib/posts';

export const getStaticPaths: GetStaticPaths = async () => langsOf(await publishedPosts()).map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ site: s, params }) => {
  const site = s ?? new URL('https://trukhin.com');
  const lang = params.lang as Lang;
  const meta = feedMeta(site, lang);
  const items = await feedItems(site, lang);
  const r = await rss({
    title: meta.title,
    description: meta.description,
    site: meta.home,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>${lang}</language><atom:link href="${new URL(`/blog/lang/${lang}/rss.xml`, site).href}" rel="self" type="application/rss+xml"/>`,
    items: items.map((i) => ({ title: i.title, link: i.url, pubDate: i.published, description: i.description, content: i.html, categories: i.tags })),
    trailingSlash: true,
  });
  return new Response(await r.text(), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
