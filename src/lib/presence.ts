/**
 * File-system checks shared by content.config.ts and page helpers. getCollection() warns
 * on empty collections, so pages skip the call when nothing is there (0-warning build).
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const BLOG_DIR = './src/content/blog';

export const hasPosts = (dir: string = BLOG_DIR): boolean =>
  existsSync(dir) &&
  readdirSync(dir, { withFileTypes: true }).some((d) =>
    d.isDirectory() ? hasPosts(join(dir, d.name)) : /^index\.mdx?$/.test(d.name),
  );

/** Public blocks directory plus an optional private overlay (PRIVATE_BLOCKS_DIR). */
export const blockDirs = (): string[] =>
  [resolve('./src/content/blocks'), ...(process.env.PRIVATE_BLOCKS_DIR ? [resolve(process.env.PRIVATE_BLOCKS_DIR)] : [])].filter(
    (d) => existsSync(d),
  );

export const hasBlocks = (): boolean => blockDirs().some((d) => readdirSync(d).some((n) => n.endsWith('.json')));
