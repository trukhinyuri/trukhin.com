#!/usr/bin/env node
// Every number in the visible home text and in the agent files exists in card.txt (DESIGN-SPEC §9.4).
// Every outcome names its canon line(s), and its value is found on those lines.
import { DIST, read, visibleText, mainHtml, fail, done, join } from './lib.mjs';

const card = read('src/content/profile/card.txt');
const lines = card.split('\n');
const nums = (s) => new Set((s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => x.replace(',', '.')));
const canonNums = nums(card);

function scan(where, text) {
  for (const n of nums(text)) if (!canonNums.has(n)) fail('facts', where, `number "${n}" is not in card.txt`);
}
// Blog content (post titles, dates, post text) is the owner's writing, not profile facts:
// the "From the blog" section, post lines and the posts part of llms-full.txt are not scanned.
const homeMain = mainHtml(read(join(DIST, 'index.html'))).replace(/<section id="blog"[\s\S]*?<\/section>/, '');
scan('dist/index.html <main>', visibleText(homeMain));
for (const f of ['llms.txt', 'llms-full.txt', 'index.md']) {
  const t = read(join(DIST, f))
    .split(/^# Blog index$/m)[0]
    .split('\n').filter((l) => !/\]\(https?:\/\/[^)]*\/blog\/[^)]+\)/.test(l)).join('\n')
    .replace(/\]\([^)]*\)/g, ']') // link targets
    .replace(/https?:\/\/\S+/g, '') // bare URLs
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ''); // ISO dates are metadata (last updated, post dates)
  scan(`dist/${f}`, t);
}

const profile = JSON.parse(read('src/content/profile/profile.json'));
// Words in canon that a value restates as a number.
const EQUIV = { 3: /\btripled\b|\b3x\b/ };
for (const o of profile.outcomes) {
  const ph = o.canonPhrase;
  if (!ph) { fail('facts', `outcome ${o.value}`, 'no canonPhrase'); continue; }
  if (!card.includes(ph)) { fail('facts', `outcome ${o.value}`, `canonPhrase not in card.txt: "${ph}"`); continue; }
  for (const n of nums(o.value)) {
    if (nums(ph).has(n) || EQUIV[n]?.test(ph)) continue;
    fail('facts', `outcome ${o.value}`, `"${n}" not in its canonPhrase`);
  }
}
done('check-facts');
