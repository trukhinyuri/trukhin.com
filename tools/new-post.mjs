#!/usr/bin/env node
// Creates src/content/blog/<slug>/index.md with valid frontmatter (status: draft) and opens it.
//
//   npm run new-post -- --title "My title" [--lang en|ru] [--series byteburst] [--tags "ai,agents"]
//                       [--description "..."] [--slug my-slug] [--no-open]
//
// A draft is never built or published. To publish: set status: published, then npm run check.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { slugify, detectLang } from './medium-lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const title = opt('title');
if (!title || title.length < 5 || title.length > 120) {
  console.error('new-post: --title is required, 5 to 120 characters');
  process.exit(2);
}
const lang = opt('lang') ?? detectLang(title);
if (!['en', 'ru'].includes(lang)) { console.error('new-post: --lang must be en or ru'); process.exit(2); }
const series = opt('series');
if (series && series !== 'byteburst') { console.error('new-post: known series: byteburst'); process.exit(2); }
const slug = opt('slug') ?? slugify(title);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { console.error(`new-post: bad slug "${slug}"`); process.exit(2); }
const dir = join('src/content/blog', slug);
if (existsSync(dir)) { console.error(`new-post: ${dir} already exists`); process.exit(1); }

export const DESCRIPTION_PLACEHOLDER = 'Write one or two sentences, 50 to 200 characters, that tell the reader what they get.';
const tags = (opt('tags') ?? '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8);
const description = opt('description') ?? DESCRIPTION_PLACEHOLDER;
const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `description: ${JSON.stringify(description)}`,
  `pubDate: ${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
  `lang: ${lang}`,
  `tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`,
  ...(series ? [`series: ${series}`, 'seriesOrder: 0  # set the issue number'] : []),
  'status: draft',
  '---',
  '',
  '<!-- Plain Markdown: ## for sections (the title is the only h1), ``` for code.',
  '     Images: put the file next to this one and write ![what the image shows](./file.png). -->',
  '',
  'Start here.',
  '',
].join('\n');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'index.md'), fm);
console.log(`created ${join(dir, 'index.md')}`);
console.log(`preview: npm run dev, then http://localhost:4321/blog/${slug}/ (drafts show in dev only)`);

if (!args.includes('--no-open') && process.stdout.isTTY) {
  const editor = process.env.VISUAL ?? process.env.EDITOR;
  const [cmd, ...rest] = editor ? [...editor.split(' '), join(dir, 'index.md')] : ['open', join(dir, 'index.md')];
  spawn(cmd, rest, { stdio: 'inherit', detached: !editor }).unref();
}
