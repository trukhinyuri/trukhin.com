import { test, expect } from '@playwright/test';
import { PAGES } from './pages';

for (const path of PAGES) {
  test(`console, CSP, origins ${path}`, async ({ page, baseURL }) => {
    const msgs: string[] = [];
    const origins = new Set<string>();
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) msgs.push(`${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => msgs.push(`pageerror: ${e.message}`));
    page.on('request', (r) => origins.add(new URL(r.url()).origin));
    const resp = await page.goto(path, { waitUntil: 'networkidle' });
    if (path !== '/404.html') expect(resp?.status()).toBe(200);
    expect(msgs, msgs.join('\n')).toEqual([]);
    // Imported posts still load their images from Medium's CDN; those origins must be declared in the page's own CSP.
    const csp = (await page.getAttribute('meta[http-equiv="Content-Security-Policy"]', 'content')) ?? '';
    const imgSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('img-src'))?.split(/\s+/).slice(1) ?? [];
    const declared = imgSrc.filter((o) => o.startsWith('https://'));
    expect([...origins].filter((o) => o !== new URL(baseURL!).origin && !o.startsWith('data:') && !declared.includes(o))).toEqual([]);
  });
}

for (const path of ['/', '/blog/byteburst-8-three-agents-three-philosophies/']) {
  test(`no scripts except JSON-LD ${path}`, async ({ page }) => {
    await page.goto(path);
    const types = await page.$$eval('script', (s) => s.map((x) => x.getAttribute('type') ?? 'classic'));
    expect(types.filter((t) => t !== 'application/ld+json')).toEqual([]);
  });
}

test('home request count', async ({ page }) => {
  const reqs: string[] = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  console.log(`home requests ${reqs.length}: ${reqs.join(' ')}`);
  expect(reqs.length).toBeLessThanOrEqual(4);
});
