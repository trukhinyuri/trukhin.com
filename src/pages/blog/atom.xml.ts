import type { APIRoute } from 'astro';
import { SITE } from '../../data/site';
import { feedItems, feedMeta, xmlEscape as x } from '../../lib/feeds';

export const GET: APIRoute = async ({ site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const meta = feedMeta(site);
  const items = await feedItems(site);
  const self = new URL('/blog/atom.xml', site).href;
  const updated = items.map((i) => i.updated.toISOString()).sort().pop() ?? '1970-01-01T00:00:00.000Z';
  const L = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<id>${x(meta.home)}</id>`,
    `<title>${x(meta.title)}</title>`,
    `<subtitle>${x(meta.description)}</subtitle>`,
    `<link rel="self" type="application/atom+xml" href="${x(self)}"/>`,
    `<link rel="alternate" type="text/html" href="${x(meta.home)}"/>`,
    `<updated>${updated}</updated>`,
    `<author><name>${x(SITE.name)}</name><uri>${x(new URL('/', site).href)}</uri></author>`,
    `<rights>© ${x(SITE.legalName)}</rights>`,
  ];
  for (const i of items) {
    L.push(
      `<entry xml:lang="${i.lang}">`,
      `<id>${x(i.id)}</id>`,
      `<title>${x(i.title)}</title>`,
      `<link rel="alternate" type="text/html" href="${x(i.url)}"/>`,
      `<published>${i.published.toISOString()}</published>`,
      `<updated>${i.updated.toISOString()}</updated>`,
      `<summary>${x(i.description)}</summary>`,
      ...i.tags.map((t) => `<category term="${x(t)}"/>`),
      `<content type="html">${x(i.html)}</content>`,
      '</entry>',
    );
  }
  L.push('</feed>', '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
