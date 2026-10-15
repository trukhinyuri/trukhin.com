import type { APIRoute } from 'astro';
import { homeMarkdown } from '../lib/markdown-home';
import { isoDay, publishedPosts, postUrl } from '../lib/posts';
import { enabledBlocks } from '../lib/blocks';

const BUDGET = 600 * 1024;

/**
 * Profile in full, the blog index, then full text of posts, newest first, while the file stays
 * under the 600 KB budget (DESIGN-SPEC §9.6). Posts in English from 2024 on are included by default;
 * `llmsFull: true` or `false` in a post's frontmatter overrides that.
 */
export const GET: APIRoute = async ({ site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const blocks = (await enabledBlocks()).map((b) => b.data);
  const posts = await publishedPosts();
  const parts = [homeMarkdown(site, blocks)];
  if (posts.length) {
    parts.push('# Blog index', '');
    for (const p of posts) {
      parts.push(`- ${isoDay(p.data.pubDate)} · ${p.data.lang} · [${p.data.title}](${new URL(postUrl(p), site).href}): ${p.data.description}`);
    }
    parts.push('');
    const wanted = posts.filter((p) => p.data.llmsFull ?? (p.data.lang === 'en' && p.data.pubDate.getUTCFullYear() >= 2024));
    const skipped: string[] = [];
    let size = Buffer.byteLength(parts.join('\n'), 'utf8');
    const full: string[] = [];
    for (const p of wanted) {
      const block = [
        `# ${p.data.title}`,
        '',
        `URL: ${new URL(postUrl(p), site).href} · Published: ${isoDay(p.data.pubDate)} · Language: ${p.data.lang}`,
        '',
        p.body ?? '',
        '',
      ].join('\n');
      const b = Buffer.byteLength(block, 'utf8');
      if (size + b > BUDGET - 4096) { skipped.push(new URL(postUrl(p).replace(/\/$/, '.md'), site).href); continue; }
      full.push(block);
      size += b;
    }
    if (full.length) parts.push('# Posts in full', '', ...full);
    if (skipped.length) parts.push('# Not included for size', '', ...skipped.map((u) => `- ${u}`), '');
  }
  const text = parts.join('\n');
  const size = Buffer.byteLength(text, 'utf8');
  if (size > BUDGET) throw new Error(`llms-full.txt is ${size} bytes, over the ${BUDGET} byte budget`);
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
