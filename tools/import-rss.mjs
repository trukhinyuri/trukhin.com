#!/usr/bin/env node
// Imports posts from the Medium RSS feeds (full text of the latest ~10 stories) into src/content/blog.
// Text is not edited (see tools/medium-lib.mjs). Images stay as links to Medium's CDN until the owner
// approves downloading them (npm run images:medium). Existing posts are never overwritten without --force.
//
// Usage:
//   TRUKHIN_EDITORIAL=<private editorial.json> npm run import:rss [-- --feed <url|file> ...] [--force] [--dry-run]
// Without TRUKHIN_EDITORIAL the importer refuses to run: the editorial list decides which posts stay on Medium.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import {
  BLOG_DIR, BLOG_ORIGIN, describe, detectLang, frontmatter, hashableHtml, loadEditorial, mediumId, mediumSlug,
  seriesOf, slugFromMedium, stripRssWrapper, textHash, toMarkdown,
  savePrivateHolds,
} from './medium-lib.mjs';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const feeds = args.flatMap((a, i) => (args[i - 1] === '--feed' ? [a] : []));
if (!feeds.length) feeds.push('https://medium.com/feed/@trukhinyuri', 'https://medium.com/feed/trukhinyuri');
const force = flag('--force');
const dry = flag('--dry-run');

const editorial = loadEditorial(readFileSync, existsSync);
if (!editorial) {
  console.error('import-rss: set TRUKHIN_EDITORIAL to the private editorial list (hold and duplicates). Refusing to guess.');
  process.exit(2);
}

async function load(src) {
  if (/^https?:/.test(src)) {
    const r = await fetch(src, { headers: { 'User-Agent': 'trukhin.com importer (+https://trukhin.com)' } });
    if (!r.ok) throw new Error(`${src}: HTTP ${r.status}`);
    return r.text();
  }
  return readFileSync(src, 'utf8');
}

const parser = new XMLParser({ ignoreAttributes: true, htmlEntities: true, isArray: (n) => n === 'item' || n === 'category' });
const items = new Map();
for (const src of feeds) {
  const xml = await load(src);
  const ch = parser.parse(xml).rss?.channel;
  if (!ch) throw new Error(`${src}: not an RSS feed`);
  for (const it of ch.item ?? []) {
    const id = mediumId(String(it.guid)) ?? mediumId(String(it.link));
    if (!id) { console.warn(`skip (no Medium id): ${it.title}`); continue; }
    const url = String(it.link).replace(/\?.*$/, '');
    const prev = items.get(id);
    // Prefer the publication URL (medium.com/trukhinyuri/...), which is what blog.trukhin.com serves.
    if (prev && !prev.url.includes('/@')) continue;
    items.set(id, {
      id,
      url,
      title: String(it.title).trim(),
      pubDate: new Date(it.pubDate).toISOString(),
      updated: it['atom:updated'] ? new Date(it['atom:updated']).toISOString() : null,
      tags: (it.category ?? []).map((c) => String(c).toLowerCase()),
      html: stripRssWrapper(String(it['content:encoded'] ?? '')),
      feed: src,
    });
  }
}

// Existing posts by Medium id.
const existing = new Map();
if (existsSync(BLOG_DIR)) {
  for (const d of readdirSync(BLOG_DIR)) {
    const f = join(BLOG_DIR, d, 'index.md');
    if (!existsSync(f)) continue;
    const m = readFileSync(f, 'utf8').match(/^ {2}id: "([0-9a-f]{12})"$/m);
    if (m) existing.set(m[1], d);
  }
}

const day = (iso) => iso.slice(0, 10);
const oldPathsOf = (it) => [`/${mediumSlug(it.url)}-${it.id}`, `/p/${it.id}`];
const held = [];
const written = [];
const skipped = [];
const usedSlugs = new Set(existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR) : []);

for (const it of [...items.values()].sort((a, b) => a.pubDate.localeCompare(b.pubDate) || a.id.localeCompare(b.id))) {
  const canonId = editorial.duplicates[it.id];
  if (canonId) continue; // folded into its canonical post below
  if (editorial.isHeld(it.id, it.title)) {
    held.push({ id: it.id, url: it.url, oldPaths: oldPathsOf(it) });
    continue;
  }
  if (existing.has(it.id) && !force) { skipped.push(`${it.id} (exists: ${existing.get(it.id)})`); continue; }

  const dupPaths = Object.entries(editorial.duplicates)
    .filter(([, c]) => c === it.id)
    .flatMap(([d]) => {
      const dup = items.get(d);
      return dup ? oldPathsOf(dup) : [`/p/${d}`];
    });
  let slug = existing.get(it.id) ?? slugFromMedium(it.url, it.title);
  if (!existing.has(it.id) && usedSlugs.has(slug)) slug = `${slug}-${it.pubDate.slice(0, 4)}`;
  usedSlugs.add(slug);

  const lang = detectLang(it.title + ' ' + it.html.replace(/<[^>]+>/g, ' '));
  const fm = {
    title: it.title,
    description: describe(it.html, it.title),
    pubDate: it.pubDate,
    updatedDate: it.updated && day(it.updated) !== day(it.pubDate) ? it.updated : undefined,
    lang,
    tags: [...new Set(it.tags)].slice(0, 8),
    ...seriesOf(it.title),
    status: 'imported',
    // Release 1: Medium still serves blog.trukhin.com, so the original stays canonical (DESIGN-SPEC §8.3).
    canonical: it.url.includes('/@') ? it.url : `${BLOG_ORIGIN}/${mediumSlug(it.url)}-${it.id}`,
    medium: { id: it.id, url: it.url, oldPaths: [...oldPathsOf(it), ...dupPaths], textHash: textHash(hashableHtml(it.html)) },
  };
  const md = frontmatter(fm) + toMarkdown(it.html);
  if (!dry) {
    mkdirSync(join(BLOG_DIR, slug), { recursive: true });
    writeFileSync(join(BLOG_DIR, slug, 'index.md'), md);
  }
  written.push(`${slug} (${it.id}, ${lang}, ${day(it.pubDate)})`);
}

// Held posts: only their addresses are kept, privately, for the redirect map (they point to the Medium copy).
if (!dry) savePrivateHolds(held, { readFileSync, writeFileSync, existsSync });

console.log(`feeds ${feeds.length}, unique stories ${items.size}`);
console.log(`written ${written.length}${dry ? ' (dry run)' : ''}`);
for (const w of written) console.log(`  + ${w}`);
console.log(`kept on Medium (editorial list) ${held.length}`);
console.log(`folded duplicates ${Object.keys(editorial.duplicates).filter((d) => items.has(d)).length}`);
if (skipped.length) console.log(`skipped (already imported; --force to overwrite) ${skipped.length}: ${skipped.join(', ')}`);
