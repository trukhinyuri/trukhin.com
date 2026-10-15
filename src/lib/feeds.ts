import { SITE } from '../data/site';
import { BLOG_INTRO } from '../data/blog';
import { postUrl, publishedPosts, tagKey, type Lang, type Post } from './posts';

export const FEED_LIMIT = 50;

export interface FeedItem {
  id: string;
  url: string;
  title: string;
  description: string;
  html: string;
  published: Date;
  updated: Date;
  lang: string;
  tags: string[];
}

/** Absolute URLs in post HTML, so readers outside the site resolve links and images. */
const absolutize = (html: string, base: string) =>
  html.replace(/\s(href|src)="(\/[^"/][^"]*|#[^"]*)"/g, (_m, a: string, u: string) => ` ${a}="${new URL(u, base).href}"`);

export async function feedItems(site: URL, lang?: Lang): Promise<FeedItem[]> {
  const posts = (await publishedPosts()).filter((p) => !lang || p.data.lang === lang).slice(0, FEED_LIMIT);
  return posts.map((p: Post) => {
    const url = new URL(postUrl(p), site).href;
    return {
      id: url,
      url,
      title: p.data.title,
      description: p.data.description,
      html: absolutize(p.rendered?.html ?? '', url),
      published: p.data.pubDate,
      updated: p.data.updatedDate ?? p.data.pubDate,
      lang: p.data.lang,
      tags: [...new Set(p.data.tags.map(tagKey))],
    };
  });
}

export const feedMeta = (site: URL, lang?: Lang) => ({
  title: lang ? `${SITE.name} · Blog (${lang === 'ru' ? 'Русский' : 'English'})` : `${SITE.name} · Blog`,
  description: BLOG_INTRO,
  home: new URL(lang ? `/blog/lang/${lang}/` : '/blog/', site).href,
});

export const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
