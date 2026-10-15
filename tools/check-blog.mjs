#!/usr/bin/env node
// Blog checks on dist (DESIGN-SPEC §2.3, §4.2, §8.2, §9.5, §9.6):
// - imported text is unchanged: textHash of the rendered post body equals the hash taken at import
//   (embeds are the only allowed difference and are excluded on both sides);
// - only published/imported posts are built; drafts and posts on hold are not in dist;
// - every post page has BlogPosting + BreadcrumbList, canonical, og:type=article, a Markdown twin, an OG image;
// - RSS, Atom and JSON Feed are well-formed and list the same posts; sitemap lists every post with lastmod;
// - pages other than /blog/search/ ship no script except JSON-LD.
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { XMLParser } from 'fast-xml-parser';
import { DIST, distFiles, read, fail, done, existsSync, join } from './lib.mjs';
import { textHash } from './medium-lib.mjs';

const BLOG = 'src/content/blog';
const fmOf = (src) => {
  const fm = src.split(/^---$/m)[1] ?? '';
  const get = (k) => fm.match(new RegExp(`^\\s*${k}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'))?.[1]?.trim();
  return { status: get('status') ?? 'draft', textHash: get('textHash'), canonical: get('canonical'), title: get('title') };
};

const posts = existsSync(BLOG)
  ? readdirSync(BLOG).filter((d) => existsSync(join(BLOG, d, 'index.md'))).sort().map((slug) => ({ slug, ...fmOf(read(join(BLOG, slug, 'index.md'))) }))
  : [];
const visible = posts.filter((p) => p.status === 'published' || p.status === 'imported');

const proseOf = (html) => html.match(/<div class="prose">([\s\S]*?)<\/div>\s*<footer class="post-footer"/)?.[1];
const withoutEmbeds = (html) => html.replace(/<figure class="embed">[\s\S]*?<\/figure>|<p class="embed">[\s\S]*?<\/p>/g, '');

const PLACEHOLDER = 'Write one or two sentences, 50 to 200 characters';
const branch = (() => { try { return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
for (const p of posts) {
  const src = read(join(BLOG, p.slug, 'index.md'));
  if (p.status !== 'draft' && src.includes(PLACEHOLDER)) fail('blog', `${BLOG}/${p.slug}`, 'description is still the new-post placeholder');
  if (/^Start here\.$/m.test(src) && p.status !== 'draft') fail('blog', `${BLOG}/${p.slug}`, 'new-post starter line left in the text');
  if (branch === 'main' && p.status === 'draft') fail('policy', `${BLOG}/${p.slug}`, 'drafts must not be on main');
  const page = join(DIST, 'blog', p.slug, 'index.html');
  const isVisible = visible.includes(p);
  if (!isVisible) {
    if (existsSync(page)) fail('blog', `blog/${p.slug}/`, `status ${p.status} must not be built`);
    continue;
  }
  if (!existsSync(page)) { fail('blog', `blog/${p.slug}/`, 'post page missing'); continue; }
  const html = read(page);
  const prose = proseOf(html);
  if (!prose) { fail('blog', `blog/${p.slug}/`, 'no .prose body'); continue; }
  if (p.textHash) {
    const h = textHash(withoutEmbeds(prose));
    if (h !== p.textHash) fail('content', `blog/${p.slug}/`, `imported text changed (textHash ${h.slice(0, 12)} ≠ ${p.textHash.slice(0, 12)}); edits need editedAfterImport and the owner's approval`);
  }
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const nodes = ld.flatMap((g) => g['@graph'] ?? [g]);
  const bp = nodes.find((n) => n['@type'] === 'BlogPosting');
  if (!bp) fail('jsonld', `blog/${p.slug}/`, 'no BlogPosting');
  else for (const k of ['headline', 'description', 'datePublished', 'dateModified', 'author', 'image', 'inLanguage', 'mainEntityOfPage', 'wordCount'])
    if (bp[k] === undefined || bp[k] === '') fail('jsonld', `blog/${p.slug}/`, `BlogPosting.${k} missing`);
  if (!nodes.some((n) => n['@type'] === 'BreadcrumbList')) fail('jsonld', `blog/${p.slug}/`, 'no BreadcrumbList');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) fail('seo', `blog/${p.slug}/`, 'no canonical');
  if (!/<meta property="og:type" content="article">/.test(html)) fail('seo', `blog/${p.slug}/`, 'og:type is not article');
  if ((html.match(/<h1\b/g) ?? []).length !== 1) fail('a11y', `blog/${p.slug}/`, 'must have exactly one h1');
  if (!existsSync(join(DIST, 'blog', `${p.slug}.md`))) fail('agents', `blog/${p.slug}.md`, 'Markdown twin missing');
  if (!existsSync(join(DIST, 'og', 'blog', `${p.slug}.png`))) fail('og', `og/blog/${p.slug}.png`, 'OG image missing');
  for (const [, img] of prose.matchAll(/<img\b([^>]*)>/g)) if (!/\salt="[^"]+"/.test(img)) fail('a11y', `blog/${p.slug}/`, 'image without alt');
}

// Scripts: none except JSON-LD, outside the search page.
for (const f of distFiles().filter((f) => f.endsWith('.html') && f !== 'blog/search/index.html')) {
  for (const [, attrs] of read(join(DIST, f)).matchAll(/<script\b([^>]*)>/g)) if (!/type="application\/ld\+json"/.test(attrs)) fail('budget', f, 'script on a page without JS');
}
// Inline styles break CSP style-src 'self'.
for (const f of distFiles().filter((f) => f.endsWith('.html'))) if (/\sstyle="/.test(read(join(DIST, f)))) fail('csp', f, 'inline style attribute');

// Feeds.
const xml = new XMLParser({ ignoreAttributes: false, isArray: (n) => ['item', 'entry', 'category'].includes(n) });
const feedUrls = {};
if (visible.length) {
  for (const f of ['blog/rss.xml', 'blog/atom.xml']) {
    if (!existsSync(join(DIST, f))) { fail('feeds', f, 'missing'); continue; }
    const src = read(join(DIST, f));
    // Well-formedness: xmllint (macOS, most Linux images); the parser below is lenient on its own.
    try { execFileSync('xmllint', ['--noout', join(DIST, f)], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) {
      if (e.code === 'ENOENT') console.log(`check-blog: xmllint not found, ${f} well-formedness not checked`);
      else { fail('feeds', f, `invalid XML: ${String(e.stderr).split('\n')[0]}`); continue; }
    }
    const doc = xml.parse(src);
    if (f.endsWith('rss.xml')) {
      const ch = doc.rss?.channel;
      if (!ch?.title || !ch?.link || !ch?.description) fail('feeds', f, 'channel title/link/description missing');
      feedUrls[f] = (ch?.item ?? []).map((i) => i.link);
      for (const i of ch?.item ?? []) if (!i['content:encoded']) fail('feeds', f, `item without content:encoded: ${i.link}`);
    } else {
      const fd = doc.feed;
      if (!fd?.id || !fd?.title || !fd?.updated) fail('feeds', f, 'feed id/title/updated missing');
      feedUrls[f] = (fd?.entry ?? []).map((e) => e.id);
      for (const e of fd?.entry ?? []) if (!e.content) fail('feeds', f, `entry without content: ${e.id}`);
    }
  }
  const jf = JSON.parse(read(join(DIST, 'blog/feed.json')));
  if (jf.version !== 'https://jsonfeed.org/version/1.1' || !jf.title) fail('feeds', 'blog/feed.json', 'version/title');
  for (const i of jf.items ?? []) if (!i.id || !i.content_html) fail('feeds', 'blog/feed.json', `item ${i.id} without id/content_html`);
  feedUrls['blog/feed.json'] = (jf.items ?? []).map((i) => i.id);
  const want = Math.min(visible.length, 50);
  for (const [f, urls] of Object.entries(feedUrls)) {
    if (urls.length !== want) fail('feeds', f, `${urls.length} items, expected ${want}`);
    for (const u of urls) if (!/^https?:\/\/[^/]+\/blog\/[^/]+\/$/.test(u)) fail('feeds', f, `item URL not a post URL: ${u}`);
  }
  if (JSON.stringify(feedUrls['blog/rss.xml']) !== JSON.stringify(feedUrls['blog/feed.json'])) fail('feeds', 'rss/json', 'RSS and JSON Feed list different posts');

  // Sitemap: every visible post, with lastmod.
  const sm = read(join(DIST, 'sitemap-0.xml'));
  for (const p of visible) {
    const m = sm.match(new RegExp(`<url><loc>[^<]*/blog/${p.slug}/</loc>(<lastmod>[^<]+</lastmod>)?`));
    if (!m) fail('sitemap', p.slug, 'post not in sitemap');
    else if (!m[1]) fail('sitemap', p.slug, 'no lastmod');
  }
  if (!existsSync(join(DIST, 'pagefind', 'pagefind.js'))) fail('search', 'pagefind/', 'search index missing');
}
console.log(`check-blog: ${posts.length} post files, ${visible.length} built`);
done('check-blog');
