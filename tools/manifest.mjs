#!/usr/bin/env node
// Writes build/manifest.txt ("<sha256>  <bytes>  <path>" per file of dist, sorted, LF) and prints
// the approval id: the first 16 hex characters of sha256(manifest.txt) (DESIGN-SPEC §6.3).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { DIST, distFiles, join } from './lib.mjs';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const lines = distFiles().map((f) => {
  const b = readFileSync(join(DIST, f));
  return `${sha(b)}  ${b.length}  ${f}`;
});
const manifest = lines.join('\n') + '\n';
const out = process.env.MANIFEST_OUT ?? 'build/manifest.txt';
mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(out, manifest);
const id = sha(manifest).slice(0, 16);
console.log(`files ${lines.length}  manifest ${out}`);
console.log(`id ${id}`);
