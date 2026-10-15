#!/usr/bin/env node
// Runs every local check against dist/ and exits non-zero on the first failing group.
// Usage: npm run check  (build first with npm run build)
import { execFileSync } from 'node:child_process';

const steps = [
  ['html-validate', 'npx', ['--no', 'html-validate', 'dist/**/*.html']],
  ['canon', 'node', ['tools/check-canon.mjs']],
  ['facts', 'node', ['tools/check-facts.mjs']],
  ['jsonld', 'node', ['tools/check-jsonld.mjs']],
  ['agent-files', 'node', ['tools/check-agent-files.mjs']],
  ['links-internal', 'node', ['tools/check-links-internal.mjs']],
  ['contrast', 'node', ['tools/check-contrast.mjs']],
  ['blog', 'node', ['tools/check-blog.mjs']],
  ['canonical', 'node', ['tools/check-canonical.mjs']],
  ['redirects', 'node', ['tools/redirects-build.mjs', '--check']],
  ['policy', 'node', ['tools/check-policy.mjs']],
];
let failed = 0;
for (const [name, cmd, args] of steps) {
  try {
    const out = execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    process.stdout.write(out.split('\n').filter((l) => l && !l.startsWith('npm notice')).map((l) => `  ${l}`).join('\n') + '\n');
    console.log(`PASS ${name}`);
  } catch (e) {
    failed++;
    process.stdout.write(`${e.stdout ?? ''}${e.stderr ?? ''}`);
    console.log(`FAIL ${name}`);
  }
}
if (failed) { console.log(`${failed} check group(s) failed`); process.exit(1); }
console.log('all checks passed');
