#!/usr/bin/env node
// robots.txt, llms.txt, llms-full.txt, sitemap and security.txt (DESIGN-SPEC §9.6).
import { DIST, SITE, read, fail, done, existsSync, join } from './lib.mjs';

const exists = (u) => {
  const p = new URL(u).pathname;
  const f = p.endsWith('/') ? `${p}index.html` : p;
  return existsSync(join(DIST, f));
};

const robots = read(join(DIST, 'robots.txt'));
if (!/^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m.test(robots)) fail('robots', 'robots.txt', 'no Sitemap line');
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots', 'robots.txt', 'a group disallows the whole site');

const llms = read(join(DIST, 'llms.txt'));
if (!llms.startsWith('# ')) fail('llms', 'llms.txt', 'must start with "# "');
for (const [, u] of llms.matchAll(/\]\(([^)]+)\)/g)) {
  if (!/^(https?:|mailto:)/.test(u)) fail('llms', 'llms.txt', `relative link ${u}`);
  else if (u.startsWith(SITE) && !exists(u)) fail('llms', 'llms.txt', `link to missing file ${u}`);
}
// "## Facts": every line quotes card.txt verbatim.
const card = read('src/content/profile/card.txt');
const facts = llms.split(/^## Facts$/m)[1]?.split(/^## /m)[0]?.split('\n').filter((l) => l.startsWith('- ')) ?? [];
if (facts.length < 5) fail('llms', 'llms.txt', `## Facts has ${facts.length} lines, expected 5 or more`);
for (const f of facts) if (!card.includes(f.slice(2))) fail('llms', 'llms.txt', `fact not verbatim in card.txt: "${f.slice(2, 60)}…"`);
const full = Buffer.byteLength(read(join(DIST, 'llms-full.txt')));
if (full > 600 * 1024) fail('llms', 'llms-full.txt', `${full} bytes > 600 KB`);

if (!existsSync(join(DIST, 'sitemap-index.xml'))) fail('sitemap', 'sitemap-index.xml', 'missing');
const sm = read(join(DIST, 'sitemap-0.xml'));
for (const [, loc] of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  if (!loc.startsWith(SITE)) fail('sitemap', loc, 'not on the site origin');
  if (!loc.endsWith('/')) fail('sitemap', loc, 'no trailing slash');
  if (!exists(loc)) fail('sitemap', loc, 'no such page in dist');
  if (/\/(404|blog\/search)\/$/.test(loc)) fail('sitemap', loc, 'must not be listed');
}
for (const [, lm] of sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) if (Number.isNaN(Date.parse(lm))) fail('sitemap', lm, 'lastmod not ISO');
if (/<changefreq>|<priority>/.test(sm)) fail('sitemap', 'sitemap-0.xml', 'changefreq/priority present');

const sec = read(join(DIST, '.well-known/security.txt'));
const exp = sec.match(/^Expires: (.+)$/m)?.[1];
if (!exp) fail('security.txt', '.well-known/security.txt', 'no Expires');
else if (Date.parse(exp) - Date.now() < 30 * 864e5) fail('security.txt', exp, 'expires within 30 days');
done('check-agent-files');
