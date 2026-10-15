/**
 * Parses src/content/profile/card.txt, the only source of facts about the owner.
 * Every paragraph on the home page is rendered from here byte for byte
 * (tools/check-canon.mjs proves it on the built HTML).
 */
import card from '../content/profile/card.txt?raw';
import profile from '../content/profile/profile.json';

export interface Para { line: number; text: string }
export interface Role {
  id: string;
  line: number;
  heading: string;
  org: string;
  title: string;
  period: string;
  paras: Para[];
}
export interface Canon {
  name: string;
  handleLine: Para;
  lead: Para;
  thesis: string;
  leadRest: string;
  roles: Role[];
  outside: { heading: string; paras: Para[] };
  talks: { heading: string; items: Para[] };
  music: { heading: string; paras: Para[] };
  contact: Para;
}

const ROLE_IDS: Record<string, string> = {
  CloudLinux: 'cloudlinux',
  JetBrains: 'jetbrains',
  MTS: 'mts',
  Infobox: 'infobox',
  'CNIP GIS, Tver': 'tver',
};

function parse(src: string): Canon {
  const lines = src.replace(/\n+$/, '').split('\n');
  const blocks: Para[][] = [];
  let cur: Para[] = [];
  lines.forEach((text, i) => {
    if (text === '') {
      if (cur.length) blocks.push(cur);
      cur = [];
    } else cur.push({ line: i + 1, text });
  });
  if (cur.length) blocks.push(cur);

  const [head, lead, ...rest] = blocks;
  if (!head || head.length !== 2 || !lead || lead.length !== 1) throw new Error('card.txt: unexpected header');
  const [nameLine, handleLine] = head as [Para, Para];
  const leadPara = lead[0] as Para;
  const m = leadPara.text.match(/^(.+?\.)\s(.+)$/);
  if (!m) throw new Error('card.txt: lead has no first sentence');

  const roles: Role[] = [];
  let outside: Canon['outside'] | undefined;
  let talks: Canon['talks'] | undefined;
  let music: Canon['music'] | undefined;
  let contact: Para | undefined;
  let target: Para[] | undefined;

  for (const b of rest) {
    const first = b[0] as Para;
    if (first.text.startsWith('LinkedIn · ')) { contact = first; continue; }
    if (first.text === 'Talks and writing') { talks = { heading: first.text, items: b.slice(1) }; target = undefined; continue; }
    if (first.text === 'Music, outside work') { music = { heading: first.text, paras: b.slice(1) }; target = undefined; continue; }
    if (first.text === 'Outside my day job') { outside = { heading: first.text, paras: b.slice(1) }; target = outside.paras; continue; }
    const parts = first.text.split(' · ');
    if (b.length > 1 && parts.length === 3 && /\d{4}/.test(parts[2] as string)) {
      const [org, title, period] = parts as [string, string, string];
      const id = ROLE_IDS[org];
      if (!id) throw new Error(`card.txt: unknown employer "${org}" on line ${first.line}`);
      const role: Role = { id, line: first.line, heading: first.text, org, title, period, paras: b.slice(1) };
      roles.push(role);
      target = role.paras;
      continue;
    }
    if (b.length === 1 && target) { target.push(first); continue; }
    throw new Error(`card.txt: cannot place block at line ${first.line}`);
  }
  if (!outside || !talks || !music || !contact) throw new Error('card.txt: missing a section');
  return {
    name: nameLine.text,
    handleLine,
    lead: leadPara,
    thesis: m[1] as string,
    leadRest: m[2] as string,
    roles,
    outside,
    talks,
    music,
    contact,
  };
}

export const CANON: Canon = parse(card);
export const CARD_TEXT = card;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Escapes a canon line and turns the anchor phrases from profile.json into links,
 * each phrase once per site-wide call order (same rule as profile-sweep/build_card.py).
 */
export function linkify(text: string, used = new Set<string>()): string {
  let out = esc(text);
  const replacements: string[] = [];
  const entries = Object.entries(profile.links).sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, url] of entries) {
    const e = esc(phrase);
    if (!used.has(phrase) && out.includes(e)) {
      const host = new URL(url).host.replace(/^www\./, '');
      const idx = replacements.length;
      replacements.push(`<a href="${url}" data-host="${host}">${e}</a>`);
      out = out.replace(e, `\0LINK_${idx}_\0`);
      used.add(phrase);
    }
  }
  return out.replace(/\0LINK_(\d+)_\0/g, (_, i) => replacements[Number(i)] ?? '');
}

/** Markdown version of the same rule, for /index.md and llms-full.txt. */
export function linkifyMd(text: string, used = new Set<string>()): string {
  let out = text;
  const replacements: string[] = [];
  const entries = Object.entries(profile.links).sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, url] of entries) {
    if (!used.has(phrase) && out.includes(phrase)) {
      const idx = replacements.length;
      replacements.push(`[${phrase}](${url})`);
      out = out.replace(phrase, `\0LINK_${idx}_\0`);
      used.add(phrase);
    }
  }
  return out.replace(/\0LINK_(\d+)_\0/g, (_, i) => replacements[Number(i)] ?? '');
}

/** "2025 to now" / "2023–2025" → HTML with <time> elements. */
export function periodHtml(period: string): string {
  return esc(period).replace(/\b(\d{4})\b/g, '<time datetime="$1">$1</time>');
}

export function periodRange(period: string): { start: string; end?: string } {
  const years = period.match(/\d{4}/g) ?? [];
  const start = years[0];
  if (!start) throw new Error(`no year in "${period}"`);
  return years[1] ? { start, end: years[1] } : { start };
}

/** 1-based line of card.txt that contains the phrase; throws if the canon no longer says it. */
export function canonLine(phrase: string): number {
  const i = card.split('\n').findIndex((l) => l.includes(phrase));
  if (i < 0) throw new Error(`card.txt no longer contains: "${phrase}"`);
  return i + 1;
}

/**
 * Kicker (short label above a paragraph) from profile.json. A kicker belongs to the paragraph that contains its
 * canonPhrase, whatever the paragraph's position; a phrase that matches no paragraph or several fails the build.
 */
type Kicker = { label: string; canonPhrase: string };
const KICKERS = profile.kickers as Record<string, Kicker[] | undefined>;
for (const [id, list] of Object.entries(KICKERS)) {
  const paras = id === 'outside' ? CANON.outside.paras : CANON.roles.find((r) => r.id === id)?.paras;
  for (const k of list ?? []) {
    const hits = paras?.filter((p) => p.text.includes(k.canonPhrase)).length ?? 0;
    if (hits !== 1) throw new Error(`profile.json kicker "${k.label}": canonPhrase matches ${hits} paragraphs of ${id}`);
  }
}
export const kickerFor = (roleId: string, text: string): string | undefined =>
  KICKERS[roleId]?.find((k) => text.includes(k.canonPhrase))?.label;

/**
 * The whole sentence of card.txt that starts with `start` (up to ". " or the end of the line).
 * Throws when the canon no longer has it, so generated files quote the canon verbatim or the build fails.
 */
export function canonSentence(start: string): string {
  const line = card.split('\n').find((l) => l.includes(start));
  if (!line) throw new Error(`card.txt no longer contains: "${start}"`);
  const from = line.indexOf(start);
  const stop = line.indexOf('. ', from);
  return stop < 0 ? line.slice(from) : line.slice(from, stop + 1);
}
