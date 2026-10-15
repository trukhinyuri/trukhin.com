// Shared helpers for the check scripts. No dependencies beyond Node.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

export const DIST = process.env.DIST ?? 'dist';
export const SITE = process.env.SITE_URL ?? 'https://trukhin.com';

export function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
export const distFiles = () => walk(DIST).map((p) => relative(DIST, p).split('\\').join('/')).sort();
export const read = (p) => readFileSync(p, 'utf8');

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', '#39': "'", '#x27': "'" };
export const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });
const INLINE = 'a|abbr|b|code|em|i|kbd|mark|q|s|small|span|strong|sub|sup|time|u|svg|use|path';
/** Visible text of an HTML fragment: inline tags vanish, block tags become spaces, whitespace collapses. */
export function visibleText(html) {
  return decode(
    html
      .replace(/<(script|style|template|head)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(new RegExp(`</?(?:${INLINE})\\b[^>]*>`, 'gi'), '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[\s\u00a0]+/g, ' ')
    .trim();
}
export const mainHtml = (html) => {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!m) throw new Error('no <main>');
  return m[1];
};
export const norm = (s) => s.replace(/[\s\u00a0]+/g, ' ').trim();

let failures = 0;
export function fail(rule, where, msg) {
  failures++;
  console.log(`FAIL ${rule} ${where}: ${msg}`);
}
export function done(name) {
  if (failures) {
    console.log(`${name}: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log(`${name}: ok`);
}
export { existsSync, join };

/** SITE.blogCanonical from src/data/site.ts ('medium-domain' | 'self'); tools read the same switch as the pages. */
export function blogCanonical() {
  const m = readFileSync('src/data/site.ts', 'utf8').match(/^\s*blogCanonical:\s*'([a-z-]+)'/m);
  if (!m || !['medium-domain', 'self'].includes(m[1])) throw new Error('src/data/site.ts: blogCanonical must be medium-domain or self');
  return m[1];
}
