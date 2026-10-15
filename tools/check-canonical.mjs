#!/usr/bin/env node
// One switch for canonical URLs of posts (SITE.blogCanonical in src/data/site.ts, DESIGN-SPEC §8.3, §8.5):
// - every page: <link rel="canonical"> equals og:url;
// - every post: canonical equals BlogPosting.mainEntityOfPage and follows the switch:
//   'medium-domain' → the frontmatter canonical (its path is one of medium.oldPaths) when the post has one, else itself;
//   'self' → the post itself, and the 301 map sends every old path of the post to it.
import { readdirSync } from 'node:fs';
import { DIST, SITE, distFiles, read, fail, done, existsSync, join, blogCanonical } from './lib.mjs';

const mode = blogCanonical();
const BLOG = 'src/content/blog';
const fm = (src) => {
  const head = src.split(/^---$/m)[1] ?? '';
  const get = (k) => head.match(new RegExp(`^\\s*${k}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'))?.[1]?.trim();
  const oldPaths = head.match(/^\s*oldPaths:\s*(\[.*\])\s*$/m)?.[1];
  return { status: get('status') ?? 'draft', canonical: get('canonical'), oldPaths: oldPaths ? JSON.parse(oldPaths) : [] };
};
const csv = existsSync('redirects/blog-trukhin-com.csv') ? read('redirects/blog-trukhin-com.csv') : '';
const map = new Map(csv.split('\n').filter(Boolean).map((l) => l.split(',')).map(([s, t]) => [s.replace(/^[^/]+/, ''), t]));

let pages = 0;
for (const f of distFiles().filter((f) => f.endsWith('.html'))) {
  const html = read(join(DIST, f));
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const og = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (!og) continue; // legal pages are plain documents without Open Graph
  pages++;
  if (canonical !== og) fail('canonical', f, `canonical ${canonical} ≠ og:url ${og}`);
}

let posts = 0;
const slugs = existsSync(BLOG) ? readdirSync(BLOG).filter((d) => existsSync(join(BLOG, d, 'index.md'))).sort() : [];
for (const slug of slugs) {
  const p = fm(read(join(BLOG, slug, 'index.md')));
  if (p.status !== 'published' && p.status !== 'imported') continue;
  const file = join(DIST, 'blog', slug, 'index.html');
  if (!existsSync(file)) continue; // check-blog reports a missing page
  posts++;
  const html = read(file);
  const self = `${SITE}/blog/${slug}/`;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const g = JSON.parse(m[1]);
    return g['@graph'] ?? [g];
  });
  const main = nodes.find((n) => n['@type'] === 'BlogPosting')?.mainEntityOfPage;
  if (main !== canonical) fail('canonical', `blog/${slug}/`, `BlogPosting.mainEntityOfPage ${main} ≠ canonical ${canonical}`);
  const want = mode === 'medium-domain' && p.canonical ? p.canonical : self;
  if (canonical !== want) fail('canonical', `blog/${slug}/`, `canonical ${canonical}, expected ${want} (blogCanonical '${mode}')`);
  if (mode === 'medium-domain' && p.canonical && !p.oldPaths.includes(new URL(p.canonical).pathname))
    fail('canonical', `blog/${slug}/`, `canonical path ${new URL(p.canonical).pathname} is not in medium.oldPaths, the 301 map would not cover it`);
  if (mode === 'self') for (const old of p.oldPaths) if (map.get(old) !== self) fail('redirects', `blog/${slug}/`, `301 map: ${old} → ${map.get(old)}, expected ${self}`);
}
console.log(`check-canonical: blogCanonical '${mode}', ${pages} pages, ${posts} posts`);
done('check-canonical');
