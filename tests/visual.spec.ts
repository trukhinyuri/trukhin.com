import { test } from '@playwright/test';
import { WIDTHS, SCHEMES } from './pages';

// Writes review screenshots (baselines are approved by Yuri before toHaveScreenshot is switched on).
const OUT = process.env.SHOTS_DIR ?? 'test-results/shots';
const TAG = process.env.SHOTS_TAG ?? '';
const SHOTS: [string, string][] = (process.env.SHOTS_ONLY_HOME ? [['home', '/']] : [
  ['home', '/'], ['blog', '/blog/'], ['post', '/blog/byteburst-8-three-agents-three-philosophies/'],
]) as [string, string][];

for (const [name, path] of SHOTS) for (const w of WIDTHS) for (const scheme of SCHEMES) {
  test(`shot ${name} ${w} ${scheme}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/${name}${TAG}-${w}-${scheme}.png`, fullPage: true });
  });
}
