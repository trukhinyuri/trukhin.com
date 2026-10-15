#!/usr/bin/env node
// Copies images of imported posts from Medium's CDN into the post folders and points the Markdown at the
// local files in public/blog/<slug>/ (DESIGN-SPEC §8.2). Downloading is a deliberate step the owner approves (count and size first):
//
//   npm run images:medium              dry run: list images, count and total size (HEAD requests only)
//   npm run images:medium -- --apply   download, rewrite src to /blog/<slug>/<file>, keep alt and captions
//
// Only https://cdn-images-1.medium.com and https://miro.medium.com are fetched. Files are saved under a name
// derived from the URL; the text of the post does not change (check-blog compares textHash).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG = 'src/content/blog';
const ALLOWED = /^https:\/\/(cdn-images-1|miro)\.medium\.com\//;
const apply = process.argv.includes('--apply');
const MAX = 15 * 1024 * 1024;

const items = [];
for (const slug of readdirSync(BLOG).sort()) {
  const f = join(BLOG, slug, 'index.md');
  if (!existsSync(f)) continue;
  for (const [, src] of readFileSync(f, 'utf8').matchAll(/<img src="([^"]+)"/g)) if (ALLOWED.test(src)) items.push({ slug, f, src });
}
const ext = (type, url) => ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif' })[type] ?? url.split('.').pop().toLowerCase().replace(/[^a-z]/g, '') ?? 'img';
const nameOf = (url, type) => `medium-${createHash('sha256').update(url).digest('hex').slice(0, 12)}.${ext(type, url)}`;

let total = 0;
let unknown = 0;
for (const it of items) {
  const r = await fetch(it.src, { method: 'HEAD' });
  const len = Number(r.headers.get('content-length') ?? NaN);
  it.type = r.headers.get('content-type') ?? '';
  if (Number.isFinite(len)) total += len; else unknown++;
  it.size = len;
  if (!r.ok) console.log(`HTTP ${r.status} ${it.src}`);
}
console.log(`images ${items.length} in ${new Set(items.map((i) => i.slug)).size} posts, total ${(total / 1024 / 1024).toFixed(1)} MB${unknown ? ` (+${unknown} without size)` : ''}`);
if (!apply) { console.log('dry run: nothing downloaded. Download needs the owner\'s yes on this count and size, then --apply.'); process.exit(0); }

const bySlug = new Map();
for (const it of items) {
  const r = await fetch(it.src);
  if (!r.ok) { console.log(`skip HTTP ${r.status} ${it.src}`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > MAX) { console.log(`skip >15 MB ${it.src}`); continue; }
  const name = nameOf(it.src, it.type);
  // public/blog/<slug>/: copied as is, so the build never re-encodes and stays reproducible. Raw HTML <img>
  // in Markdown is not processed by Astro, so a root-relative path is used.
  mkdirSync(join('public/blog', it.slug), { recursive: true });
  writeFileSync(join('public/blog', it.slug, name), buf);
  (bySlug.get(it.f) ?? bySlug.set(it.f, new Map()).get(it.f)).set(it.src, `/blog/${it.slug}/${name}`);
}
for (const [f, map] of bySlug) {
  let md = readFileSync(f, 'utf8');
  for (const [src, local] of map) md = md.split(`<img src="${src}"`).join(`<img src="${local}"`);
  writeFileSync(f, md);
}
console.log(`downloaded into ${bySlug.size} posts. Next: npm run build, npm run check.`);
