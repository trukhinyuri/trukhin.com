#!/usr/bin/env node
// Private policy: terms that must not appear in the build or in tracked files.
// The term list lives outside the public repository; pass it with TRUKHIN_POLICY=<path to JSON>
// ({"forbidden": ["term", ...]}). Without it the check is reported as skipped, never as passed.
import { execFileSync } from 'node:child_process';
import { DIST, distFiles, read, fail, done, existsSync, join } from './lib.mjs';

const path = process.env.TRUKHIN_POLICY;
if (!path) { console.log('check-policy: SKIPPED (TRUKHIN_POLICY not set)'); process.exit(0); }
if (!existsSync(path)) { console.log(`check-policy: FAIL policy file not found: ${path}`); process.exit(1); }
const { forbidden = [] } = JSON.parse(read(path));
const re = new RegExp(forbidden.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
if (!forbidden.length) { console.log('check-policy: FAIL empty term list'); process.exit(1); }

const allowOn = process.env.POLICY_ALLOW_OPTIONAL === '1'; // preview builds with private blocks
let hits = 0;
for (const f of distFiles()) {
  const buf = read(join(DIST, f));
  if (re.test(buf)) { hits++; if (!allowOn) fail('policy', `dist/${f}`, 'contains a forbidden term'); }
}
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const f of tracked) {
  if (!existsSync(f)) continue;
  if (re.test(read(f))) fail('policy', f, 'tracked file contains a forbidden term');
}
console.log(`check-policy: ${forbidden.length} term(s), ${tracked.length} tracked files, dist hits ${hits}${allowOn ? ' (allowed for preview)' : ''}`);
done('check-policy');
