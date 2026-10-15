import type { Blog, BlogPosting, BreadcrumbList, CollectionPage, CreativeWorkSeries, Graph, Thing } from 'schema-dts';
import { SITE } from '../data/site';
import { ids } from './jsonld';
import { postOg, postUrl, SERIES, tagKey, type Post } from './posts';

export const blogId = (site: URL) => new URL('/blog/#blog', site).href;
export const seriesId = (site: URL, s: string) => new URL(`/blog/series/${s}/#series`, site).href;

const author = (site: URL) => ({ '@type': 'Person' as const, '@id': ids(site).person, name: SITE.name, url: new URL('/', site).href });

const blogNode = (site: URL): Blog => ({
  '@type': 'Blog',
  '@id': blogId(site),
  name: `Blog · ${SITE.name}`,
  url: new URL('/blog/', site).href,
  author: { '@id': ids(site).person },
  publisher: { '@id': ids(site).person },
  inLanguage: ['en', 'ru'],
});

/**
 * Canonical URL of a post under SITE.blogCanonical: the original address on blog.trukhin.com while Medium serves it
 * ('medium-domain'), otherwise the post itself ('self'). The page's canonical, og:url and mainEntityOfPage use it.
 */
export const postCanonical = (site: URL, p: Post): string =>
  SITE.blogCanonical === 'medium-domain' && p.data.canonical ? p.data.canonical : new URL(postUrl(p), site).href;

export function postGraph(site: URL, p: Post, words: number): Graph {
  const url = new URL(postUrl(p), site).href;
  const series = p.data.series ? SERIES[p.data.series] : undefined;
  const posting: BlogPosting = {
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    headline: p.data.title,
    description: p.data.description,
    datePublished: p.data.pubDate.toISOString(),
    dateModified: (p.data.updatedDate ?? p.data.pubDate).toISOString(),
    author: author(site),
    image: { '@type': 'ImageObject', url: new URL(postOg(p), site).href, width: '1200', height: '630' },
    inLanguage: p.data.lang,
    mainEntityOfPage: postCanonical(site, p),
    url,
    isPartOf: [{ '@id': blogId(site) }, ...(series ? [{ '@id': seriesId(site, series.slug) }] : [])],
    ...(p.data.tags.length ? { keywords: [...new Set(p.data.tags.map(tagKey))].join(', ') } : {}),
    wordCount: words,
    ...(p.data.medium ? { sameAs: p.data.medium.url } : {}),
  };
  const crumbs: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumbs`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', site).href },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: new URL('/blog/', site).href },
      { '@type': 'ListItem', position: 3, name: p.data.title, item: url },
    ],
  };
  const nodes: Thing[] = [posting, crumbs, blogNode(site)];
  if (series) nodes.push(seriesNode(site, series.slug));
  return { '@context': 'https://schema.org', '@graph': nodes } as Graph;
}

export const seriesNode = (site: URL, s: string): CreativeWorkSeries => ({
  '@type': 'CreativeWorkSeries',
  '@id': seriesId(site, s),
  name: SERIES[s]?.name ?? s,
  url: new URL(`/blog/series/${s}/`, site).href,
  author: { '@id': ids(site).person },
});

/** /blog/ and the list pages: CollectionPage + Blog with the latest posts. */
export function listGraph(site: URL, path: string, name: string, posts: Post[], extra: Thing[] = []): Graph {
  const url = new URL(path, site).href;
  const page: CollectionPage = {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name,
    isPartOf: { '@id': blogId(site) },
    about: { '@id': ids(site).person },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 10).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: new URL(postUrl(p), site).href, name: p.data.title })),
    },
  };
  const blog = blogNode(site);
  if (path === '/blog/') {
    (blog as unknown as Record<string, unknown>).blogPost = posts.slice(0, 10).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.data.title,
      url: new URL(postUrl(p), site).href,
      datePublished: p.data.pubDate.toISOString(),
      inLanguage: p.data.lang,
      author: { '@id': ids(site).person },
    }));
  }
  return { '@context': 'https://schema.org', '@graph': [page, blog, ...extra] as Thing[] } as Graph;
}
