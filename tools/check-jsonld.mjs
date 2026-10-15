#!/usr/bin/env node
// JSON-LD parses, @id values are unique per page, every {"@id"} reference resolves on the site,
// no empty values, and the Person facts on the home page are visible (DESIGN-SPEC §9.5).
import { DIST, distFiles, read, visibleText, decode, fail, done, join } from './lib.mjs';

const pages = distFiles().filter((f) => f.endsWith('.html'));
const defined = new Set();
const refs = [];
const graphs = {};
for (const f of pages) {
  const html = read(join(DIST, f));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const seen = new Set();
  for (const [, raw] of blocks) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { fail('jsonld', f, `invalid JSON: ${e.message}`); continue; }
    (graphs[f] ??= []).push(data);
    (function visit(v, path) {
      if (v === '' || v === null || (Array.isArray(v) && v.length === 0)) fail('jsonld', f, `empty value at ${path}`);
      if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${path}[${i}]`));
      else if (v && typeof v === 'object') {
        const keys = Object.keys(v);
        if (keys.length === 1 && keys[0] === '@id') refs.push([f, v['@id']]);
        else if (v['@id']) {
          if (seen.has(v['@id'])) fail('jsonld', f, `duplicate @id ${v['@id']}`);
          seen.add(v['@id']);
          defined.add(v['@id']);
        }
        for (const k of keys) visit(v[k], `${path}.${k}`);
      }
    })(data, '$');
  }
}
for (const [f, id] of refs) if (!defined.has(id)) fail('jsonld', f, `unresolved reference ${id}`);

// Visibility of home facts.
const home = read(join(DIST, 'index.html'));
const homeText = visibleText(home);
const hrefs = new Set();
for (const f of pages) for (const [, h] of read(join(DIST, f)).matchAll(/href="([^"]+)"/g)) hrefs.add(decode(h).replace(/\/$/, ''));
const graph = graphs['index.html']?.[0]?.['@graph'] ?? [];
const person = graph.find((n) => n['@type'] === 'Person');
if (!person) fail('jsonld', 'index.html', 'no Person node');
else {
  const mustSee = [person.name, person.jobTitle, person.worksFor?.name, person.description, person.homeLocation?.name];
  for (const r of person.alumniOf ?? []) mustSee.push(r.alumniOf?.name, r.roleName);
  for (const v of mustSee) if (!v || !homeText.includes(v)) fail('jsonld', 'index.html', `Person value not visible: "${v}"`);
  if (!hrefs.has(person.email)) fail('jsonld', 'index.html', `email ${person.email} is not a visible link`);
  for (const u of person.sameAs ?? []) if (!hrefs.has(u.replace(/\/$/, ''))) fail('jsonld', 'index.html', `sameAs ${u} is not a visible link on the site`);
}
if (!graph.some((n) => n['@type'] === 'ProfilePage')) fail('jsonld', 'index.html', 'no ProfilePage node');
done('check-jsonld');
