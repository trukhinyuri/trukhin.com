import type { APIRoute } from 'astro';
import { homeMarkdown } from '../lib/markdown-home';
import { enabledBlocks } from '../lib/blocks';

export const GET: APIRoute = async ({ site }) => {
  const blocks = (await enabledBlocks()).map((b) => b.data);
  return new Response(homeMarkdown(site ?? new URL('https://trukhin.com'), blocks), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
