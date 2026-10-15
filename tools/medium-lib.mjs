// Shared code for the Medium importers (RSS and the account export).
// Rule: the text of a post is never edited. Only the markup changes (Medium HTML → Markdown),
// Medium's own wrapper (tracking pixel, "originally published" footer, title repeated in the body)
// is dropped, and embeds become links. textHash proves the text survived (tools/check-content.mjs).
import { createHash } from 'node:crypto';
import TurndownService from 'turndown';

export const BLOG_DIR = 'src/content/blog';
export const BLOG_ORIGIN = 'https://blog.trukhin.com';
export const MEDIUM_PUB = 'https://medium.com/trukhinyuri';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e.toLowerCase()] ?? m;
  });

/** Text of an HTML fragment for hashing: tags dropped, entities decoded, NFC, all whitespace removed. */
export const hashText = (html) =>
  decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' '))
    .normalize('NFC')
    .replace(/[\s ​‌‍﻿]+/g, '');
export const textHash = (html) => createHash('sha256').update(hashText(html)).digest('hex');

/** Medium post id: the trailing 12 hex characters of a story URL or /p/<id>. */
export const mediumId = (url) => url.match(/(?:-|\/p\/)([0-9a-f]{12})(?:[/?#]|$)/)?.[1] ?? null;
/** Medium slug without the id tail, e.g. "byteburst-8-three-agents-three-philosophies". */
export const mediumSlug = (url) => {
  const last = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
  return last.replace(/-?[0-9a-f]{12}$/, '');
};

// GOST 7.79-2000, system B, reduced to ASCII for URLs.
const TR = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'cz', ч: 'ch', ш: 'sh', щ: 'shh',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
export const slugify = (s, max = 80) => {
  const full = s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[а-яё]/g, (c) => TR[c] ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (full.length <= max) return full;
  const cut = full.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : max);
};
/** Medium's own slug when it is already a clean ASCII slug, else a transliterated one. */
export const slugFromMedium = (url, title) => {
  const s = mediumSlug(url);
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) ? s : slugify(s || title);
};

export const detectLang = (text) => {
  const cyr = (text.match(/[а-яё]/gi) ?? []).length;
  const lat = (text.match(/[a-z]/gi) ?? []).length;
  return cyr > lat * 0.5 ? 'ru' : 'en';
};

/** "BYTEBURST #10", "ByteBurst #8", "#ByteBurst #0" → { series, seriesOrder }. */
export const seriesOf = (title) => {
  const m = title.match(/byte\s*burst\s*#\s*(\d+)/i);
  return m ? { series: 'byteburst', seriesOrder: Number(m[1]) } : {};
};

/** Removes Medium's RSS wrapper: tracking pixel and the "originally published" footer. */
export function stripRssWrapper(html) {
  return html
    .replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/g, '')
    .replace(/<hr\s*\/?>\s*<p><a href="https:\/\/medium\.com\/[^"]*">[\s\S]*?<\/a> was originally published in[\s\S]*?<\/p>\s*$/, '')
    .trim();
}

/** Embeds (Medium wraps them in embedly iframes) → { url, label }. */
export function embedTarget(src) {
  const s = decode(src);
  let u;
  try { u = new URL(s); } catch { return { url: s, label: 'Embedded content' }; }
  const target = u.searchParams.get('url') ?? u.searchParams.get('src') ?? s;
  const name = u.searchParams.get('display_name') ?? new URL(target).hostname.replace(/^www\./, '');
  return { url: target, label: `${name}: ${target}` };
}

/** Source HTML with embeds removed, for the text hash (embeds are the only allowed difference). */
export const hashableHtml = (html) => html.replace(/<iframe\b[\s\S]*?<\/iframe>|<iframe\b[^>]*\/?>/gi, '');

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Medium post HTML → Markdown. Headings shift so the post title is the only h1 (h3→h2, h4→h3). */
export function toMarkdown(html) {
  // The first image is usually the post's cover and the largest paint: load it eagerly, the rest lazily.
  let images = 0;
  const loading = () => (images++ === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"');
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    hr: '---',
  });
  td.keep(['sup', 'sub']);
  // Text characters that would turn into markup: "<" and "&" are escaped, the rest by turndown.
  const baseEscape = td.escape.bind(td);
  td.escape = (str) => baseEscape(str).replace(/&/g, '\\&').replace(/</g, '\\<');
  // Emphasis: Markdown delimiters only where CommonMark parses them back exactly (no edge spaces,
  // no line break inside, word or emphasis neighbours outside); otherwise inline HTML, which keeps the text.
  const EMPH = { EM: ['*', 'em'], I: ['*', 'em'], STRONG: ['**', 'strong'], B: ['**', 'strong'] };
  const isEmph = (n) => !!n && n.nodeType === 1 && n.nodeName in EMPH;
  const touches = (n, side) => {
    const sib = side === 'prev' ? n.previousSibling : n.nextSibling;
    if (!sib) return isEmph(n.parentNode) ? touches(n.parentNode, side) : false;
    if (isEmph(sib)) return true;
    const t = sib.textContent ?? '';
    const ch = side === 'prev' ? t.slice(-1) : t.slice(0, 1);
    return /[\p{L}\p{N}_*]/u.test(ch);
  };
  td.addRule('emphasis', {
    filter: (n) => n.nodeName in EMPH,
    replacement: (content, node) => {
      if (!content.trim()) return content;
      const [md, tag] = EMPH[node.nodeName];
      const clean =
        content === content.trim() && !/\n/.test(content) && !node.querySelector('br') && !isEmph(node.parentNode) &&
        !node.querySelector('em,i,strong,b') && !touches(node, 'prev') && !touches(node, 'next');
      return clean ? `${md}${content}${md}` : `<${tag}>${content}</${tag}>`;
    },
  });
  td.addRule('heading-shift', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => {
      const level = { H1: 2, H2: 2, H3: 2, H4: 3, H5: 4, H6: 4 }[node.nodeName];
      // Medium's typographic spaces (no-break before the last word, hair spaces around dashes) become
      // plain spaces in headings only, so heading ids match the post's own #anchor links. Text is unchanged.
      const text = content.replace(/\n+/g, ' ').replace(/[\u00a0\u2009\u200a]/g, ' ').trim();
      return text ? `\n\n${'#'.repeat(level)} ${text}\n\n` : '';
    },
  });
  td.addRule('pre', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (_c, node) => {
      const inner = node.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
      const code = decode(inner).replace(/\n+$/, '');
      const fence = code.includes('```') ? '~~~~' : '```';
      return `\n\n${fence}\n${code}\n${fence}\n\n`;
    },
  });
  td.addRule('figure', {
    filter: 'figure',
    replacement: (_c, node) => {
      const img = node.querySelector('img');
      const iframe = node.querySelector('iframe');
      const cap = node.querySelector('figcaption');
      const capHtml = cap ? cap.innerHTML.trim() : '';
      const capText = cap ? decode(cap.textContent ?? '').trim() : '';
      if (iframe) {
        const { url, label } = embedTarget(iframe.getAttribute('src') ?? '');
        const c = capHtml ? `<figcaption>${capHtml}</figcaption>` : '';
        return `\n\n<figure class="embed"><p><a href="${escAttr(url)}">${escAttr(label)}</a></p>${c}</figure>\n\n`;
      }
      if (!img) return capHtml ? `\n\n<figure><figcaption>${capHtml}</figcaption></figure>\n\n` : '';
      const alt = (img.getAttribute('alt') ?? '').trim() || capText || 'Image from the original post';
      const src = img.getAttribute('src') ?? '';
      const c = capHtml ? `<figcaption>${capHtml}</figcaption>` : '';
      return `\n\n<figure><img src="${escAttr(src)}" alt="${escAttr(alt)}" ${loading()} decoding="async">${c}</figure>\n\n`;
    },
  });
  td.addRule('iframe', {
    filter: 'iframe',
    replacement: (_c, node) => {
      const { url, label } = embedTarget(node.getAttribute('src') ?? '');
      return `\n\n<p class="embed"><a href="${escAttr(url)}">${escAttr(label)}</a></p>\n\n`;
    },
  });
  td.addRule('bare-img', {
    filter: (node) => node.nodeName === 'IMG' && node.parentNode?.nodeName !== 'FIGURE',
    replacement: (_c, node) => {
      const alt = (node.getAttribute('alt') ?? '').trim() || 'Image from the original post';
      return `<img src="${escAttr(node.getAttribute('src') ?? '')}" alt="${escAttr(alt)}" ${loading()} decoding="async">`;
    },
  });
  return td.turndown(html).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** Plain-text description from the first paragraphs: whole sentences up to 200 characters. */
export function describe(html, title) {
  // Paragraphs and quotes; a heading counts only as the first block (Medium's subtitle).
  const paras = [...html.matchAll(/<(p|blockquote|h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/g)]
    .map((m, i) => (i > 0 && m[1].startsWith('h') ? '' : decode(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()))
    .filter(Boolean);
  let text = '';
  for (const p of paras) {
    text = text ? `${text} ${p}` : p;
    if (text.length >= 50) break;
  }
  if (text.length < 50) text = `${title.trim()}. ${text}`.trim();
  if (text.length <= 200) return text;
  const sentences = text.match(/[^.!?…]+[.!?…]+["”»)]*\s*/g) ?? [];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > 200) break;
    out += s;
  }
  out = out.trim();
  if (out.length >= 50) return out;
  const cut = text.slice(0, 199);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

const yamlStr = (s) => JSON.stringify(s);
/** Frontmatter in a fixed key order, so diffs stay small and the sitemap reader can parse dates. */
export function frontmatter(d) {
  const L = ['---'];
  L.push(`title: ${yamlStr(d.title)}`);
  L.push(`description: ${yamlStr(d.description)}`);
  L.push(`pubDate: ${d.pubDate}`);
  if (d.updatedDate) L.push(`updatedDate: ${d.updatedDate}`);
  L.push(`lang: ${d.lang}`);
  L.push(`tags: [${(d.tags ?? []).map(yamlStr).join(', ')}]`);
  if (d.series) L.push(`series: ${d.series}`, `seriesOrder: ${d.seriesOrder}`);
  L.push(`status: ${d.status}`);
  if (d.canonical) L.push(`canonical: ${yamlStr(d.canonical)}`);
  if (d.originallyPublished) L.push(`originallyPublished: ${yamlStr(d.originallyPublished)}`);
  if (d.medium) {
    L.push('medium:');
    L.push(`  id: "${d.medium.id}"`);
    L.push(`  url: ${yamlStr(d.medium.url)}`);
    L.push(`  oldPaths: [${d.medium.oldPaths.map(yamlStr).join(', ')}]`);
    L.push(`  textHash: "${d.medium.textHash}"`);
  }
  L.push('---', '');
  return L.join('\n');
}

/** Private editorial list (posts on hold, duplicates). Lives outside the public repository. */
export function loadEditorial(readFileSync, existsSync) {
  const p = process.env.TRUKHIN_EDITORIAL;
  if (!p) return null;
  if (!existsSync(p)) throw new Error(`TRUKHIN_EDITORIAL points to a missing file: ${p}`);
  const e = JSON.parse(readFileSync(p, 'utf8'));
  const titles = (e.holdTitles ?? []).map((t) => t.toLowerCase());
  return {
    duplicates: e.duplicates ?? {},
    /** True when the post stays on Medium (not published here). */
    isHeld: (id, title) => (e.hold ?? []).includes(id) || titles.some((t) => title.toLowerCase().startsWith(t)),
  };
}

/**
 * Posts kept on Medium are private: their addresses live outside the repository, in the JSON file named by
 * TRUKHIN_PRIVATE_REDIRECTS ([{id, url, oldPaths}]). Without the variable the importers refuse to record held
 * posts and the redirect map is built from public posts only.
 */
export function savePrivateHolds(held, { readFileSync, writeFileSync, existsSync }) {
  if (!held.length) return;
  const p = process.env.TRUKHIN_PRIVATE_REDIRECTS;
  if (!p) throw new Error(`${held.length} post(s) kept on Medium: set TRUKHIN_PRIVATE_REDIRECTS to a private JSON file outside the repository`);
  const prev = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : [];
  const byId = new Map(prev.map((h) => [h.id, h]));
  for (const h of held) byId.set(h.id, h);
  writeFileSync(p, JSON.stringify([...byId.values()].sort((a, b) => a.id.localeCompare(b.id)), null, 2) + '\n');
}
