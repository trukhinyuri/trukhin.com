import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, WIDTHS, SCHEMES } from './pages';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const path of PAGES) for (const w of WIDTHS) for (const scheme of SCHEMES) {
  test(`axe ${path} ${w} ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(path);
    const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const v = r.violations.map((x) => `${x.id} (${x.impact}): ${x.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
    expect(v, v.join('\n')).toEqual([]);
  });
}

for (const path of PAGES) {
  test(`structure ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    expect(await page.getAttribute('html', 'lang')).toBeTruthy();
    expect(await page.locator('h1').count()).toBe(1);
    const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (hs) => hs.map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!, `heading skip at ${i}: ${levels}`).toBeLessThanOrEqual(1);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement;
      const r = a.getBoundingClientRect();
      return { cls: a.className, href: a.getAttribute('href'), visible: r.width > 0 && r.height > 0 && r.top >= 0 };
    });
    expect(focused.href).toBe('#main');
    expect(focused.visible).toBe(true);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw).toBeLessThanOrEqual(320);
  });
}

// Every post with 3+ sections has exactly one contents landmark: ours, or the post's own list wrapped at build time.
test('contents nav on long posts', async ({ page }) => {
  const { readdirSync, existsSync } = await import('node:fs');
  const dist = process.env.DIST ?? 'dist';
  const slugs = readdirSync(`${dist}/blog`).filter((s) => existsSync(`${dist}/blog/${s}/index.html`) && !['tags', 'series', 'search', 'lang'].includes(s));
  expect(slugs.length).toBeGreaterThan(0);
  let checked = 0;
  for (const s of slugs) {
    await page.goto(`/blog/${s}/`);
    if (!(await page.locator('article.post').count())) continue;
    const h2 = await page.locator('.prose h2').count();
    if (h2 < 3) continue;
    checked++;
    expect(await page.locator('nav[aria-label="Contents"]').count(), s).toBe(1);
  }
  expect(checked).toBeGreaterThan(0);
});
