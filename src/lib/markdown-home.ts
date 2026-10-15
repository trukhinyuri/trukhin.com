import { CANON, kickerFor, linkifyMd } from './canon';
import { SITE } from '../data/site';
import { shown } from '../data/profiles';
import profile from '../content/profile/profile.json';

type Block = { title: string; url: string; text: string };

/** The home page as Markdown, built from the same data (served at /index.md, reused in llms-full.txt). */
export function homeMarkdown(site: URL, blocks: Block[] = []): string {
  const used = new Set<string>();
  const out: string[] = [];
  out.push(`# ${CANON.name}`, '', `${profile.roleLine} · ${profile.location} · ${profile.handle}`, '');
  out.push(`**${CANON.thesis}** ${linkifyMd(CANON.leadRest, used)}`, '');
  out.push('## Selected outcomes', '');
  for (const o of profile.outcomes) out.push(`- **${o.value}**: ${o.caption}`);
  out.push('', '## Experience', '');
  for (const r of CANON.roles) {
    out.push(`### ${r.org} · ${r.title} · ${r.period}`, '');
    r.paras.forEach((p) => {
      const k = kickerFor(r.id, p.text);
      out.push(k ? `*${k}.* ${linkifyMd(p.text, used)}` : linkifyMd(p.text, used), '');
    });
  }
  out.push(`## ${CANON.outside.heading}`, '');
  for (const p of CANON.outside.paras) {
    const k = kickerFor('outside', p.text);
    out.push(k ? `*${k}.* ${linkifyMd(p.text, used)}` : linkifyMd(p.text, used), '');
  }
  for (const b of blocks) out.push(`**[${b.title}](${b.url})** ${b.text}`, '');
  out.push(`## ${CANON.talks.heading}`, '');
  for (const p of CANON.talks.items) out.push(`- ${linkifyMd(p.text, used)}`);
  out.push('', `More: [Writing elsewhere](${new URL('/writing/', site).href})`, '');
  out.push('## Elsewhere', '');
  for (const g of ['professional', 'personal', 'music'] as const) {
    const items = shown(g);
    if (!items.length) continue;
    const title = { professional: 'Professional', personal: 'Personal', music: CANON.music.heading }[g];
    out.push(`### ${title}`, '');
    if (g === 'music') for (const p of CANON.music.paras) out.push(p.text, '');
    for (const p of items) out.push(`- [${p.label}](${p.url})`);
    out.push('');
  }
  out.push(`Contact: [${SITE.email}](mailto:${SITE.email}) · Last updated ${profile.updated}`, '');
  return out.join('\n');
}
