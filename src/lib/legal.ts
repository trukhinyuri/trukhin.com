import privacy from '../content/legal/privacy.html?raw';
import terms from '../content/legal/terms.html?raw';
import { SITE } from '../data/site';

/**
 * Policies for agent-tools. The text is the original (2026-08-26), unchanged;
 * only the markup is new: no Tailwind CDN, no web fonts, one local stylesheet.
 */
const SOURCES: Record<string, string> = { privacy, terms };

export function legalPage(name: 'privacy' | 'terms', site: URL): string {
  const src = SOURCES[name] as string;
  const title = (src.match(/^<!-- title: (.*) -->/) as RegExpMatchArray)[1] as string;
  const body = src.replace(/^<!--.*-->\n/, '');
  const canonical = new URL(`/${name}.html`, site).href;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
<title>${title}</title>
<meta name="robots" content="noindex, follow">
<meta name="color-scheme" content="light dark">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/legal.css">
</head>
<body>
<!--email_off-->
<header><a href="/">${SITE.name}</a>
<nav aria-label="Policies"><ul><li><a href="/terms.html"${name === 'terms' ? ' aria-current="page"' : ''}>Terms</a></li><li><a href="/privacy.html"${name === 'privacy' ? ' aria-current="page"' : ''}>Privacy</a></li></ul></nav>
</header>
<main>
${body}</main>
<!--/email_off-->
</body>
</html>
`;
}
