import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { byId } from '../data/profiles';
import { publishedPosts, postUrl, SERIES } from '../lib/posts';
import { enabledBlocks } from '../lib/blocks';
import profile from '../content/profile/profile.json';
import { canonProjects } from '../lib/jsonld';
import { canonSentence } from '../lib/canon';

/** Facts for agents: whole sentences of card.txt, quoted verbatim (check-agent-files proves it). */
const FACTS = [
  'I report to the CloudLinux CEO',
  'Previously, as Head of Cloud Platform at MTS Web Services',
  "I joined as the first employee in MTS's cloud engineering department",
  'Starting from an internal hobby project, I created Cloud Hub and Cloud Billing',
  'I authored Open Cloud Standard v1 and v2',
  'In 30 months I built and scaled the cloud business',
  'One of our flagship services was the GPU cloud:',
  'I led more than 140 people',
  'I set product direction for cloud, AI and DevOps',
  'I ran cloud strategy and product development for InfoboxCloud',
  'I founded TRUKHIN #CloudRING',
  'For the past two years I have spent thousands of hours',
  'In OpenClaw (390k+ GitHub stars),',
  'Across the AI and cloud infrastructure stack,',
  'AI Journey:',
];

/** llmstxt.org format. Generated from the same data as the pages. */
export const GET: APIRoute = async ({ site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const abs = (p: string) => new URL(p, site).href;
  const all = await publishedPosts();
  const posts = all.slice(0, 10);
  const blocks = (await enabledBlocks()).map((b) => b.data);
  const L: string[] = [];
  L.push(`# ${SITE.name}`, '', `> ${profile.summary}`, '');
  L.push('## Profile', '');
  L.push(`- [Home](${abs('/')}): role, selected outcomes, experience from 2007 to now, talks and writing`);
  L.push(`- [Home as Markdown](${abs('/index.md')}): the same page in Markdown`);
  for (const b of [...canonProjects(), ...blocks]) L.push(`- [${b.title}](${b.url}): ${b.short}`);
  L.push('', '## Facts', '');
  for (const f of FACTS) L.push(`- ${canonSentence(f)}`);
  L.push('', '## Writing', '');
  if (posts.length) {
    const langs = [...new Set(all.map((p) => p.data.lang))].map((l) => ({ en: 'English', ru: 'Russian' } as Record<string, string>)[l] ?? l);
    const series = [...new Set(all.map((p) => p.data.series).filter(Boolean))].map((x) => SERIES[x as string]?.name ?? String(x));
    const langText = langs.length > 1 ? `${langs.slice(0, -1).join(', ')} and ${langs.at(-1)}` : langs[0];
    L.push(`- [Blog](${abs('/blog/')}): posts in ${langText}${series.length ? `, series ${series.join(', ')}` : ''}`);
  }
  L.push(`- [Writing elsewhere](${abs('/writing/')}): JetBrains Blog, talks, Infobox blog`);
  if (posts.length) {
    L.push(`- [RSS](${abs('/blog/rss.xml')})`);
    for (const p of posts) L.push(`- [${p.data.title}](${abs(postUrl(p).replace(/\/$/, '.md'))}): ${p.data.description}`);
  }
  L.push('', '## Profiles', '');
  L.push(['linkedin', 'github', 'x'].map((id) => `[${byId(id).label}](${byId(id).url})`).map((x) => `- ${x}`).join('\n'));
  L.push(`- [Email](mailto:${SITE.email})`);
  L.push('', '## Optional', '');
  L.push(`- [Full text](${abs('/llms-full.txt')}): the profile in full${posts.length ? ' and recent posts' : ''}`);
  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
