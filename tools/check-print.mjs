#!/usr/bin/env node
// Prints the home page to PDF on A4 and Letter with headless Chrome and counts pages (DESIGN-SPEC §3.7, §9.10).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { DIST, fail, done } from './lib.mjs';

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAX = 2;
const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

for (const size of ['A4', 'letter']) {
  const root = mkdtempSync(join(tmpdir(), 'print-'));
  cpSync(DIST, root, { recursive: true });
  for (const f of readdirSync(join(root, '_astro')).filter((n) => n.endsWith('.css'))) {
    const p = join(root, '_astro', f);
    writeFileSync(p, readFileSync(p, 'utf8') + `@page{size:${size}}`);
  }
  const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    try {
      const body = readFileSync(join(root, p));
      res.writeHead(200, { 'Content-Type': types[p.slice(p.lastIndexOf('.'))] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const pdf = join(root, 'out.pdf');
  const profile = mkdtempSync(join(tmpdir(), 'chrome-'));
  await new Promise((resolve, reject) => {
    import('node:child_process').then(({ execFile }) =>
      execFile(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `http://127.0.0.1:${port}/`], { timeout: 60000 }, (e) => (e ? reject(e) : resolve())),
    );
  });
  server.close();
  const pages = (readFileSync(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  console.log(`${size}: ${pages} page(s)`);
  if (pages > MAX || pages === 0) fail('print', size, `${pages} pages, limit ${MAX}`);
  if (process.env.PRINT_KEEP) cpSync(pdf, join(process.env.PRINT_KEEP, `home-${size}.pdf`));
  rmSync(root, { recursive: true, force: true });
  rmSync(profile, { recursive: true, force: true });
}
done('check-print');
