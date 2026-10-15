import { getCollection, type CollectionEntry } from 'astro:content';
import { hasPosts } from './presence';
import { VISIBLE } from './post-dates.mjs';
import { TAG_ALIASES, TAG_PAGE_MIN } from '../data/tag-aliases';

export type Post = CollectionEntry<'blog'>;
export type Lang = 'en' | 'ru';

/**
 * Posts that reach pages and feeds (published, or imported unchanged), newest first; ties by id.
 * `npm run dev` also shows drafts, so a new post can be previewed before it is published.
 */
export async function publishedPosts(): Promise<Post[]> {
  if (!hasPosts()) return [];
  const show = (s: string) => VISIBLE.has(s) || (import.meta.env.DEV && s === 'draft');
  const posts = await getCollection('blog', (p) => show(p.data.status));
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id));
}

export const postSlug = (p: Post) => p.id.replace(/\/index$/, '');
export const postUrl = (p: Post) => `/blog/${postSlug(p)}/`;
export const postMdUrl = (p: Post) => `/blog/${postSlug(p)}.md`;
export const postOg = (p: Post) => `/og/blog/${postSlug(p)}.png`;

export const LANG_NAME: Record<Lang, string> = { en: 'English', ru: 'Русский' };
export const SERIES: Record<string, { name: string; slug: string }> = { byteburst: { name: 'BYTEBURST', slug: 'byteburst' } };

/** Canonical tag (aliases fold spelling variants; the post text keeps its own spelling). */
export const tagKey = (t: string) => {
  const k = t.trim().toLowerCase();
  return TAG_ALIASES[k] ?? k;
};
export const tagSlug = (t: string) => tagKey(t).replace(/[^a-z0-9а-яё]+/g, '-').replace(/^-|-$/g, '');

/** Tags with a page (at least TAG_PAGE_MIN visible posts), sorted by count then name. */
export function tagPages(posts: Post[]): { tag: string; slug: string; posts: Post[] }[] {
  const m = new Map<string, Post[]>();
  for (const p of posts) for (const t of new Set(p.data.tags.map(tagKey))) m.set(t, [...(m.get(t) ?? []), p]);
  return [...m.entries()]
    .filter(([, ps]) => ps.length >= TAG_PAGE_MIN)
    .map(([tag, ps]) => ({ tag, slug: tagSlug(tag), posts: ps }))
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag));
}

export const langsOf = (posts: Post[]): Lang[] => (['en', 'ru'] as Lang[]).filter((l) => posts.some((p) => p.data.lang === l));

export function seriesPosts(posts: Post[], series: string): Post[] {
  return posts
    .filter((p) => p.data.series === series)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0) || a.data.pubDate.getTime() - b.data.pubDate.getTime());
}

/** Up to n posts sharing the most tags; ties go to the newer post. Computed at build time. */
export function related(post: Post, posts: Post[], n = 3): Post[] {
  const mine = new Set(post.data.tags.map(tagKey));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: [...new Set(p.data.tags.map(tagKey))].filter((t) => mine.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.getTime() - a.p.data.pubDate.getTime() || a.p.id.localeCompare(b.p.id))
    .slice(0, n)
    .map((x) => x.p);
}

/** Words in the Markdown body, code blocks excluded. */
export function wordCount(body: string | undefined): number {
  if (!body) return 0;
  const text = body
    .replace(/(```|~~~~)[\s\S]*?\1/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#>*_`~[\]|-]/g, ' ');
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;
}
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 230));

export const fmtDate = (d: Date, lang: string, style: 'long' | 'short' = 'long') =>
  d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Years, newest first, with their posts (archive on /blog/). */
export function byYear(posts: Post[]): [number, Post[]][] {
  const m = new Map<number, Post[]>();
  for (const p of posts) {
    const y = p.data.pubDate.getUTCFullYear();
    m.set(y, [...(m.get(y) ?? []), p]);
  }
  return [...m.entries()].sort((a, b) => b[0] - a[0]);
}
