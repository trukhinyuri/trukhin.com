import { getCollection } from 'astro:content';
import { byId } from '../data/profiles';

/** Items sorted newest first; undated items last, then by id for a stable order. */
export async function writingItems() {
  const items = await getCollection('writing');
  const key = (d?: string) => (d ? d.slice(0, 10) : '');
  return items.sort((a, b) => key(b.data.date).localeCompare(key(a.data.date)) || a.id.localeCompare(b.id));
}

export const JETBRAINS_AUTHOR = byId('jetbrains');
