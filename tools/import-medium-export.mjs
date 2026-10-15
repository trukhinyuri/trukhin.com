#!/usr/bin/env node
// Imports the Medium account export (Settings → Security and apps → Download your information) into
// src/content/blog. The export is untrusted data: unzip it into a NEW EMPTY directory and pass that path;
// this script only reads posts/*.html as text and never runs anything from it.
//
//   TRUKHIN_EDITORIAL=<private editorial.json> npm run import:medium-export -- <export dir> [--force] [--dry-run]
//       [--rss <saved feed.xml>]   (tags: the export has none; tags are taken from a saved RSS feed when given)
//
// Rules (DESIGN-SPEC §8.2): text unchanged (textHash), Medium's wrapper removed (repeated title and subtitle),
// embeds become links, drafts (draft_*.html) are skipped, posts on the editorial hold list stay on Medium,
// existing posts (same Medium id) are not overwritten without --force, slug collisions get "-<year>".
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import {
  BLOG_DIR, BLOG_ORIGIN, decode, describe, detectLang, frontmatter, hashableHtml, loadEditorial, mediumId, mediumSlug,
  seriesOf, slugify, textHash, toMarkdown,
  savePrivateHolds,
} from './medium-lib.mjs';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const dir = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--rss');
if (!dir) { console.error('usage: import-medium-export <export dir> [--force] [--dry-run] [--rss feed.xml]'); process.exit(2); }
const postsDir = existsSync(join(dir, 'posts')) ? join(dir, 'posts') : dir;
if (!existsSync(postsDir)) { console.error(`no posts directory in ${dir}`); process.exit(2); }
if (resolve(postsDir).startsWith(resolve('.'))) { console.error('the export must live outside the repository (untrusted data)'); process.exit(2); }
const editorial = loadEditorial(readFileSync, existsSync);
if (!editorial) { console.error('set TRUKHIN_EDITORIAL to the private editorial list. Refusing to guess.'); process.exit(2); }
const force = flag('--force');
const dry = flag('--dry-run');

// Tags by Medium id from a saved RSS feed (optional).
const rssTags = new Map();
if (opt('rss')) {
  const ch = new XMLParser({ ignoreAttributes: true, isArray: (n) => n === 'item' || n === 'category' }).parse(readFileSync(opt('rss'), 'utf8')).rss?.channel;
  for (const it of ch?.item ?? []) {
    const id = mediumId(String(it.guid));
    if (id) rssTags.set(id, (it.category ?? []).map((c) => String(c).toLowerCase()));
  }
}

const attr = (html, re) => html.match(re)?.[1];
const section = (html, field) => {
  const start = html.search(new RegExp(`<section[^>]*data-field="${field}"[^>]*>`));
  if (start < 0) return '';
  const open = html.indexOf('>', start) + 1;
  // Sections nest; walk to the matching </section>.
  let depth = 1;
  const re = /<section\b|<\/section>/g;
  re.lastIndex = open;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</section>' ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index);
  }
  return html.slice(open);
};

/** Medium export body → plain post HTML: no layout wrappers, no repeated title/subtitle. */
function cleanBody(body, title) {
  let h = body
    .replace(/<div class="section-divider">[\s\S]*?<\/div>/g, '')
    .replace(/<\/?(section|div)\b[^>]*>/g, '')
    .replace(/\s(name|id|data-[a-z-]+|class)="[^"]*"/g, (m, a) => (a === 'class' && /graf--(pre|iframe|mixtapeEmbed)/.test(m) ? m : ''));
  // Medium repeats the title (and optionally the subtitle) as the first heading(s) of the body.
  const first = h.match(/^\s*<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/);
  if (first && decode(first[1].replace(/<[^>]+>/g, '')).trim() === title.trim()) h = h.slice(first[0].length);
  // Mixtape (link card) embeds: keep the link with its visible text.
  h = h.replace(/<p class="graf--mixtapeEmbed"[^>]*>|<div class="graf--mixtapeEmbed"[^>]*>/g, '<p>');
  return h.replace(/\sclass="[^"]*"/g, '').trim();
}

const files = readdirSync(postsDir).filter((f) => f.endsWith('.html')).sort();
const existing = new Map();
if (existsSync(BLOG_DIR)) {
  for (const d of readdirSync(BLOG_DIR)) {
    const f = join(BLOG_DIR, d, 'index.md');
    if (!existsSync(f)) continue;
    const m = readFileSync(f, 'utf8').match(/^ {2}id: "([0-9a-f]{12})"$/m);
    if (m) existing.set(m[1], d);
  }
}
const used = new Set(existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR) : []);
const report = { written: [], drafts: 0, held: [], duplicates: [], existing: [], noId: [], embeds: [] };
const heldOut = [];

for (const f of files) {
  if (f.startsWith('draft_')) { report.drafts++; continue; }
  const html = readFileSync(join(postsDir, f), 'utf8');
  const title = decode((attr(html, /<h1 class="p-name">([\s\S]*?)<\/h1>/) ?? attr(html, /<title>([\s\S]*?)<\/title>/) ?? '').replace(/<[^>]+>/g, '')).trim();
  const canonicalLink = attr(html, /<a href="([^"]+)" class="p-canonical"/);
  const id = (canonicalLink && mediumId(canonicalLink)) ?? mediumId(f.replace(/\.html$/, ''));
  if (!id) { report.noId.push(f); continue; }
  const dup = editorial.duplicates[id];
  if (dup) { report.duplicates.push(`${id} → ${dup}`); continue; }
  const published = attr(html, /<time class="dt-published" datetime="([^"]+)"/);
  const url = canonicalLink ?? `https://medium.com/p/${id}`;
  const slugMedium = canonicalLink ? mediumSlug(canonicalLink) : f.replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/-?[0-9a-f]{12}\.html$/, '');
  const oldPaths = [`/${slugMedium}-${id}`, `/p/${id}`];
  if (editorial.isHeld(id, title)) { report.held.push(`${id} ${title}`); heldOut.push({ id, url: url.replace('/@trukhinyuri/', '/trukhinyuri/'), oldPaths }); continue; }
  if (existing.has(id) && !force) { report.existing.push(`${id} (${existing.get(id)})`); continue; }
  if (!published) { report.noId.push(`${f} (no dt-published)`); continue; }

  const body = cleanBody(section(html, 'body'), title);
  if (/<iframe\b/i.test(body)) report.embeds.push(`${id} ${title}`);
  let slug = existing.get(id) ?? (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugMedium) ? slugMedium : slugify(slugMedium || title));
  if (!slug) slug = `post-${id}`;
  if (!existing.has(id) && used.has(slug)) slug = `${slug}-${published.slice(0, 4)}`;
  used.add(slug);
  const lang = detectLang(title + ' ' + body.replace(/<[^>]+>/g, ' '));
  const fm = {
    title,
    description: (() => {
      const sub = decode(section(html, 'subtitle').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
      return sub.length >= 50 && sub.length <= 200 ? sub : describe(body, title);
    })(),
    pubDate: new Date(published).toISOString(),
    lang,
    tags: (rssTags.get(id) ?? []).slice(0, 8),
    ...seriesOf(title),
    status: 'imported',
    canonical: `${BLOG_ORIGIN}/${slugMedium}-${id}`,
    medium: { id, url: url.replace('/@trukhinyuri/', '/trukhinyuri/'), oldPaths, textHash: textHash(hashableHtml(body)) },
  };
  if (!dry) {
    mkdirSync(join(BLOG_DIR, slug), { recursive: true });
    writeFileSync(join(BLOG_DIR, slug, 'index.md'), frontmatter(fm) + toMarkdown(body));
  }
  report.written.push(`${slug} (${id}, ${lang}, ${fm.pubDate.slice(0, 10)})`);
}

if (!dry) savePrivateHolds(heldOut, { readFileSync, writeFileSync, existsSync });
console.log(`export files ${files.length}: written ${report.written.length}${dry ? ' (dry run)' : ''}, drafts skipped ${report.drafts}, kept on Medium ${report.held.length}, duplicates folded ${report.duplicates.length}, already imported ${report.existing.length}, unreadable ${report.noId.length}`);
for (const [k, v] of Object.entries(report)) if (Array.isArray(v) && v.length) console.log(`${k}:\n  ${v.join('\n  ')}`);
console.log('next: npm run redirects:build && npm run build && npm run check (check-blog proves the text is unchanged)');
