import { getCollection } from 'astro:content';
import { hasBlocks } from './presence';
import { CARD_TEXT } from './canon';

/**
 * Optional "outside my day job" blocks that are switched on. Empty in the public build.
 * A block about a project the canon already describes is dropped, so its text is never shown twice.
 */
export async function enabledBlocks() {
  if (!hasBlocks()) return [];
  const all = await getCollection('blocks');
  return all.filter((b) => b.data.enabled && !CARD_TEXT.includes(b.data.title)).sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
