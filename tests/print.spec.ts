import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

// Default inside test-results/ (Playwright wipes it each run); pass SHOTS_DIR to keep print evidence elsewhere.
const OUT = process.env.SHOTS_DIR ?? 'test-results/print';
const TAG = process.env.SHOTS_TAG ?? '';

for (const format of ['A4', 'Letter'] as const) {
  test(`print home ${format}`, async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format, printBackground: true });
    mkdirSync(OUT, { recursive: true });
    writeFileSync(`${OUT}/home${TAG}-print-${format}.pdf`, pdf);
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    console.log(`print ${format}: ${pages} page(s)`);
    expect(pages).toBeLessThanOrEqual(2);
    if (process.env.SHOTS_TAG) {
      const hidden = await page.locator('.project-card').evaluateAll((els) => els.map((e) => getComputedStyle(e).display === 'none'));
      console.log(`project cards in print: ${hidden.length}, hidden ${hidden.filter(Boolean).length}`);
      expect(hidden.every(Boolean)).toBe(true);
    }
  });
}
