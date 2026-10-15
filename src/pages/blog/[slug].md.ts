import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../data/site';
import { isoDay, postSlug, postUrl, publishedPosts, tagKey, type Post } from '../../lib/posts';

/** Each post as Markdown for agents: a short header and the Markdown source of the body as written. */
export const getStaticPaths: GetStaticPaths = async () =>
  (await publishedPosts()).map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));

export const GET: APIRoute = async ({ props, site: s }) => {
  const site = s ?? new URL('https://trukhin.com');
  const { post } = props as { post: Post };
  const d = post.data;
  const head = [
    `# ${d.title}`,
    '',
    `> ${d.description}`,
    '',
    `- Author: ${SITE.name} (${new URL('/', site).href})`,
    `- Published: ${isoDay(d.pubDate)}${d.updatedDate ? ` · Updated: ${isoDay(d.updatedDate)}` : ''}`,
    `- Language: ${d.lang}`,
    ...(d.series ? [`- Series: BYTEBURST, part ${d.seriesOrder}`] : []),
    ...(d.tags.length ? [`- Tags: ${[...new Set(d.tags.map(tagKey))].join(', ')}`] : []),
    `- URL: ${new URL(postUrl(post), site).href}`,
    ...(d.medium ? [`- Originally published on Medium: ${d.medium.url}`] : []),
    '',
    '---',
    '',
  ];
  return new Response(head.join('\n') + (post.body ?? ''), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
