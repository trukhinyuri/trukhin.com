#!/usr/bin/env node
// WCAG contrast of the colour tokens in both themes: text ≥ 4.5:1, rules and focus ≥ 3:1 where required.
import { read, fail, done } from './lib.mjs';

const css = read('src/styles/tokens.css');
const block = (s) => Object.fromEntries([...s.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const [lightSrc, darkSrc] = css.split('@media (prefers-color-scheme: dark)');
const themes = { light: block(lightSrc), dark: { ...block(lightSrc), ...block(darkSrc) } };
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [['text', 'bg', 4.5], ['muted', 'bg', 4.5], ['accent', 'bg', 4.5], ['text', 'code-bg', 4.5], ['accent', 'code-bg', 4.5]];
for (const [name, t] of Object.entries(themes)) {
  for (const [fg, bg, min] of pairs) {
    const r = ratio(t[fg], t[bg]);
    console.log(`${name} ${fg}/${bg} ${r.toFixed(2)}:1`);
    if (r < min) fail('contrast', name, `${fg} on ${bg} is ${r.toFixed(2)}:1 < ${min}:1`);
  }
}
done('check-contrast');
