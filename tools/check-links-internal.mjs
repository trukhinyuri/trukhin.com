#!/usr/bin/env node
// Every same-site href/src in the built HTML resolves to a file in dist (including #fragments).
import { DIST, distFiles, read, decode, fail, done, existsSync, join } from './lib.mjs';

const html = distFiles().filter((f) => f.endsWith('.html'));
const idsOf = (f) => new Set([...read(join(DIST, f)).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const f of html) {
  for (const [, attr, raw] of read(join(DIST, f)).matchAll(/\s(href|src)="([^"]*)"/g)) {
    const u = decode(raw);
    if (!u.startsWith('/') && !u.startsWith('#')) continue;
    if (u.startsWith('//')) continue;
    const [path, frag] = u.split('#');
    const target = path === '' ? f : path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);
    if (!existsSync(join(DIST, target))) { fail('link', f, `${attr}="${u}" → missing ${target}`); continue; }
    if (frag && target.endsWith('.html') && !idsOf(target).has(frag)) fail('link', f, `${u}: no id "${frag}" in ${target}`);
    if (frag && target.endsWith('.svg') && !read(join(DIST, target)).includes(`id="${frag}"`)) fail('link', f, `${u}: no symbol "${frag}"`);
  }
}
done('check-links-internal');
