#!/usr/bin/env node
// Every line of card.txt appears in the visible text of the built home page (DESIGN-SPEC §9.4).
// Role headings ("Org · Title · Period") are checked part by part; line 2 is carried by the role line.
import { createHash } from 'node:crypto';
import { DIST, read, visibleText, mainHtml, norm, fail, done, existsSync, join } from './lib.mjs';

const CARD = 'src/content/profile/card.txt';
// sha256 of the owner's canonical text this copy was taken from. Change it only together with a new copy of card.txt.
const PINNED = '6fe03c838a912efa63d1a769e87662fe111abca43e1a0aaaf6022b2f7d68472c';
const UPSTREAM = process.env.CANON_UPSTREAM; // optional path to the owner's canonical copy
const card = read(CARD);
const sha = createHash('sha256').update(card).digest('hex');
console.log(`card.txt sha256 ${sha.slice(0, 16)}`);
if (sha !== PINNED) fail('canon', CARD, `sha256 ${sha.slice(0, 16)} ≠ pinned ${PINNED.slice(0, 16)}; card.txt changed by hand or the pin was not updated`);
if (UPSTREAM) {
  if (!existsSync(UPSTREAM)) fail('canon', UPSTREAM, 'CANON_UPSTREAM does not exist');
  else if (createHash('sha256').update(read(UPSTREAM)).digest('hex') !== sha) fail('canon', CARD, `differs from ${UPSTREAM}`);
}

const text = visibleText(mainHtml(read(join(DIST, 'index.html'))));
card.split('\n').forEach((raw, i) => {
  const line = norm(raw);
  const n = i + 1;
  if (!line) return;
  if (n === 2) {
    for (const part of line.split(' · ')) if (!text.includes(part)) fail('canon', `card.txt:${n}`, `"${part}" not visible`);
    return;
  }
  const parts = line.split(' · ');
  if (parts.length === 3 && /\d{4}/.test(parts[2])) {
    for (const part of parts) if (!text.includes(part)) fail('canon', `card.txt:${n}`, `heading part "${part}" not visible`);
    return;
  }
  if (!text.includes(line)) fail('canon', `card.txt:${n}`, `line not found verbatim in dist/index.html: "${line.slice(0, 60)}…"`);
});
done('check-canon');
