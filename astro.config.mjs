// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import profile from './src/content/profile/profile.json' with { type: 'json' };
import { styleToClass } from './src/lib/shiki-classes.mjs';
import { postDates, VISIBLE } from './src/lib/post-dates.mjs';

const SITE = process.env.SITE_URL ?? 'https://trukhin.com';
const EXCLUDE = ['/404/', '/blog/search/'];
const posts = postDates();
const visible = [...posts.values()].filter((p) => VISIBLE.has(p.status));
const newest = visible.map((p) => p.lastmod).sort().pop();

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  compressHTML: true,
  image: { service: passthroughImageService() },
  devToolbar: { enabled: false },
  markdown: {
    // Imported text must render exactly as written: no smart quotes or dashes added.
    processor: satteri({ features: { smartPunctuation: false } }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
      transformers: [styleToClass()],
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE.some((p) => new URL(page).pathname === p),
      // lastmod is the real date of the last text change, never the build date.
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/' || path === '/writing/') item.lastmod = profile.updated;
        else if (path === '/blog/' && newest) item.lastmod = newest;
        else {
          const m = path.match(/^\/blog\/([^/]+)\/$/);
          const p = m?.[1] ? posts.get(m[1]) : undefined;
          if (p) item.lastmod = p.lastmod;
        }
        delete item.changefreq;
        delete item.priority;
        return item;
      },
    }),
  ],
});
