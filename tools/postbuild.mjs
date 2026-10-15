#!/usr/bin/env node
// Steps after astro build, in order: Shiki colour classes → dist/shiki.css, then the Pagefind index
// (blog posts only: pages with data-pagefind-body). One language index so search covers EN and RU posts.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import { DIST, join } from './lib.mjs';

execFileSync('node', ['tools/shiki-css.mjs'], { stdio: 'inherit', env: process.env });
if (existsSync(join(DIST, 'blog', 'index.html'))) {
  rmSync(join(DIST, 'pagefind'), { recursive: true, force: true });
  execFileSync('node_modules/.bin/pagefind', ['--site', DIST, '--force-language', 'en', '--silent'], { stdio: 'inherit' });
  console.log('pagefind: index written to', join(DIST, 'pagefind'));
}
if (existsSync(join(DIST, 'sitemap-0.xml'))) {
  copyFileSync(join(DIST, 'sitemap-0.xml'), join(DIST, 'sitemap.xml'));
}
if (existsSync('AGENTS.md')) {
  copyFileSync('AGENTS.md', join(DIST, 'AGENTS.md'));
}
