#!/usr/bin/env node
// Two clean builds in a row must give the same approval id (DESIGN-SPEC §9.13).
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const build = (n) => {
  rmSync(`dist-repro-${n}`, { recursive: true, force: true });
  execFileSync('npx', ['--no', 'astro', 'build', '--outDir', `dist-repro-${n}`], {
    stdio: 'ignore',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  execFileSync('node', ['tools/postbuild.mjs'], { stdio: 'ignore', env: { ...process.env, DIST: `dist-repro-${n}` } });
  const out = execFileSync('node', ['tools/manifest.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, DIST: `dist-repro-${n}`, MANIFEST_OUT: `build/manifest-repro-${n}.txt` },
  });
  return out.match(/^id (\w+)$/m)[1];
};
const a = build(1);
const b = build(2);
rmSync('dist-repro-1', { recursive: true, force: true });
rmSync('dist-repro-2', { recursive: true, force: true });
console.log(`build 1 id ${a}\nbuild 2 id ${b}`);
if (a !== b) { console.log('check-repro: FAIL ids differ (diff build/manifest-repro-1.txt build/manifest-repro-2.txt)'); process.exit(1); }
console.log('check-repro: ok');
