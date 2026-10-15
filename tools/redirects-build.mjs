#!/usr/bin/env node
// Builds redirects/blog-trukhin-com.csv: the 301 map for blog.trukhin.com once Medium no longer serves it
// (DESIGN-SPEC §8.5). Source of truth: medium.oldPaths in the posts. Posts kept on Medium are private: their
// rules are read from TRUKHIN_PRIVATE_REDIRECTS (JSON, outside the repository) only when it is set, and written to
// a CSV next to it, never into the repository. Upload both lists to Cloudflare. The posts' rules in the public map
// are staged until SITE.blogCanonical is 'self' (release 2). Format: Cloudflare Bulk Redirects CSV, no header, columns
//   source_url,target_url,status_code,preserve_query_string,include_subdomains,subpath_matching,preserve_path_suffix
// (column order to be confirmed against the Cloudflare docs when the list is imported).
//
//   npm run redirects:build            write the CSV
//   node tools/redirects-build.mjs --check   fail if the committed CSV is out of date (part of npm run check)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HOST = 'blog.trukhin.com';
const SITE = process.env.SITE_URL ?? 'https://trukhin.com';
const BLOG = 'src/content/blog';
const OUT = 'redirects/blog-trukhin-com.csv';
const TAG_PAGE_MIN = 3;
const ALIASES = { antropic: 'anthropic' };

const fm = (src) => {
  const head = src.split(/^---$/m)[1] ?? '';
  const get = (k) => head.match(new RegExp(`^\\s*${k}:\\s*(.*)$`, 'm'))?.[1]?.trim();
  const arr = (k) => {
    const v = get(k);
    return v ? JSON.parse(v) : [];
  };
  return { status: get('status')?.replace(/"/g, '') ?? 'draft', oldPaths: arr('oldPaths'), tags: arr('tags') };
};

const rows = new Map(); // source path → target URL
const add = (path, target) => {
  if (rows.has(path) && rows.get(path) !== target) throw new Error(`conflicting targets for ${path}: ${rows.get(path)} / ${target}`);
  rows.set(path, target);
};

const tagCount = new Map();
const posts = existsSync(BLOG) ? readdirSync(BLOG).filter((d) => existsSync(join(BLOG, d, 'index.md'))).sort() : [];
for (const slug of posts) {
  const p = fm(readFileSync(join(BLOG, slug, 'index.md'), 'utf8'));
  const live = p.status === 'published' || p.status === 'imported';
  if (live) for (const t of new Set(p.tags.map((t) => ALIASES[t.toLowerCase()] ?? t.toLowerCase()))) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  if (!live) continue; // a draft or held post gets no redirect to trukhin.com
  for (const old of p.oldPaths) add(old, `${SITE}/blog/${slug}/`);
}
const holdFile = process.env.TRUKHIN_PRIVATE_REDIRECTS;
const held = holdFile && existsSync(holdFile) ? JSON.parse(readFileSync(holdFile, 'utf8')) : [];
const privateRows = new Map();
for (const h of held) for (const old of h.oldPaths) {
  if (rows.has(old)) throw new Error(`a post kept on Medium shares an old path with a published post: ${old}`);
  privateRows.set(old, h.url);
}

// Medium's own pages on the custom domain.
add('/', `${SITE}/blog/`);
add('/all', `${SITE}/blog/`);
add('/archive', `${SITE}/blog/`);
add('/about', `${SITE}/`);
add('/feed', `${SITE}/blog/rss.xml`);
for (const [t, n] of [...tagCount.entries()].sort()) {
  if (n >= TAG_PAGE_MIN) add(`/tagged/${t}`, `${SITE}/blog/tags/${t.replace(/[^a-z0-9а-яё]+/g, '-')}/`);
}

const line = (path, target, subpath = false) =>
  [`${HOST}${path}`, target, '301', 'FALSE', 'FALSE', subpath ? 'TRUE' : 'FALSE', 'FALSE'].join(',');
const exact = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([p, t]) => line(p, t));
// Anything else under the old host (unknown tag pages, Medium paths) lands on the blog index.
// Bulk Redirects match the most specific source first; confirm with Cloudflare Trace on 2-3 URLs.
const csv = [...exact, line('/tagged/', `${SITE}/blog/`, true)].join('\n') + '\n';
const privateOut = holdFile ? holdFile.replace(/\.json$/, '') + '.csv' : '';
const privateCsv = [...privateRows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([p, t]) => line(p, t)).join('\n') + (privateRows.size ? '\n' : '');

if (process.argv.includes('--check')) {
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (cur !== csv) {
    console.log(`FAIL redirects ${OUT}: out of date, run npm run redirects:build`);
    process.exit(1);
  }
  if (privateOut && (existsSync(privateOut) ? readFileSync(privateOut, 'utf8') : '') !== privateCsv) {
    console.log(`FAIL redirects private list out of date, run npm run redirects:build`);
    process.exit(1);
  }
  console.log(`redirects: ok (${exact.length + 1} public rules${holdFile ? `, ${privateRows.size} private` : ', private list not set'})`);
} else {
  mkdirSync('redirects', { recursive: true });
  writeFileSync(OUT, csv);
  if (privateOut) writeFileSync(privateOut, privateCsv);
  console.log(`${OUT}: ${exact.length + 1} rules (${posts.length} post files)${privateOut ? `; private list: ${privateRows.size} rules` : ''}`);
}
