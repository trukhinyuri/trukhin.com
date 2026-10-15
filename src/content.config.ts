import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_DIR, hasPosts, blockDirs } from './lib/presence';

/**
 * Blog posts. `published` and `imported` (Medium text, unchanged) reach pages and feeds;
 * `draft` and `hold` never do (src/lib/post-dates.mjs VISIBLE).
 */
/** Empty until the first post lands; avoids the glob loader's "no files" warning. */
const emptyLoader: Loader = { name: 'empty', load: async ({ store }) => store.clear() };

const blog = defineCollection({
  loader: hasPosts() ? glob({ pattern: '**/index.md', base: BLOG_DIR }) : emptyLoader,
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(5).max(120),
        description: z.string().min(50).max(200),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        lang: z.enum(['en', 'ru']),
        tags: z.array(z.string()).max(8).default([]),
        series: z.enum(['byteburst']).optional(),
        seriesOrder: z.number().int().min(0).optional(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        status: z.enum(['draft', 'imported', 'hold', 'published']).default('draft'),
        canonical: z.url().optional(),
        translationOf: z.string().optional(),
        /** Where an imported post first appeared, when Medium carries the import date (2018 imports). */
        originallyPublished: z.url().optional(),
        medium: z
          .object({
            id: z.string().regex(/^[0-9a-f]{12}$/),
            url: z.url(),
            oldPaths: z.array(z.string()),
            textHash: z.string(),
          })
          .optional(),
        editedAfterImport: z.coerce.date().optional(),
        llmsFull: z.boolean().optional(),
      })
      .refine((d) => !d.cover || !!d.coverAlt, { message: 'cover requires coverAlt' }),
});

/** Talks and writing published elsewhere. One YAML file per item, each with a source. */
const writing = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/writing' }),
  schema: z.object({
    /** Year, year-month, ISO date or a year range; omitted when no source gives a date. */
    date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?|–\d{4})?$/).optional(),
    venue: z.string(),
    title: z.string(),
    url: z.url(),
    lang: z.enum(['en', 'ru']),
    note: z.string().optional(),
    /** Where the item is backed: a card.txt line or a verified fetch. */
    source: z.string(),
  }),
});

/**
 * Optional blocks for the "Outside my day job" section. The public repository ships
 * none; a private overlay directory can be passed with PRIVATE_BLOCKS_DIR for
 * preview builds. A block renders only with `enabled: true`.
 */
const blocksLoader = (): Loader => ({
  name: 'optional-blocks',
  load: async ({ store, parseData, logger }) => {
    store.clear();
    for (const dir of blockDirs()) {
      for (const f of readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
        const id = f.replace(/\.json$/, '');
        const raw = JSON.parse(readFileSync(join(dir, f), 'utf8'));
        const data = await parseData({ id, data: raw });
        store.set({ id, data });
        logger.info(`optional block "${id}" loaded (enabled: ${String(raw.enabled)})`);
      }
    }
  },
});

const blocks = defineCollection({
  loader: blocksLoader(),
  schema: z.object({
    enabled: z.boolean(),
    order: z.number().int().default(0),
    title: z.string(),
    url: z.url(),
    repo: z.url().optional(),
    license: z.string().optional(),
    text: z.string(),
    short: z.string(),
  }),
});

export const collections = { blog, writing, blocks };
