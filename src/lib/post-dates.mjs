// Reads post frontmatter without Astro (for astro.config.mjs): slug → { lastmod, status }.
// The importer and new-post write frontmatter in a fixed format, so a line reader is enough;
// tools/check-blog.mjs cross-checks the sitemap against the built pages.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const VISIBLE = new Set(['published', 'imported']);

export function postDates(dir = './src/content/blog') {
  const out = new Map();
  if (!existsSync(dir)) return out;
  for (const slug of readdirSync(dir).sort()) {
    const f = join(dir, slug, 'index.md');
    if (!existsSync(f)) continue;
    const fm = readFileSync(f, 'utf8').split(/^---$/m)[1] ?? '';
    const get = (k) => fm.match(new RegExp(`^${k}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1]?.trim();
    const pub = get('pubDate');
    const upd = get('updatedDate');
    out.set(slug, { lastmod: new Date(upd ?? pub).toISOString(), status: get('status') ?? 'draft' });
  }
  return out;
}
