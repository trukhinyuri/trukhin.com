import type { APIRoute } from 'astro';

/** AI training is allowed by default; the owner may change it (decision D4). */
const AI_TRAIN = true;

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site ?? 'https://trukhin.com').href;
  const body = `User-agent: *
Allow: /
Disallow: /blog/search/

# AI search and user-triggered agents: allowed
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
Allow: /
Disallow: /blog/search/

# AI training
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
${AI_TRAIN ? 'Allow: /' : 'Disallow: /'}
Disallow: /blog/search/

Content-Signal: search=yes, ai-input=yes, ai-train=${AI_TRAIN ? 'yes' : 'no'}
Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
