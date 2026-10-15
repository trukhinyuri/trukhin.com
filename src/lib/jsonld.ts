import type { Graph, Organization, Person, ProfilePage, WebSite, OrganizationRole, SoftwareSourceCode, Thing } from 'schema-dts';
import { CANON, CARD_TEXT, canonSentence, periodRange } from './canon';
import { SITE, KNOWS_ABOUT, CANON_PROJECTS } from '../data/site';
import { sameAs } from '../data/profiles';
import profile from '../content/profile/profile.json';

export const ids = (site: URL) => ({
  website: new URL('/#website', site).href,
  profile: new URL('/#profile', site).href,
  person: new URL('/#person', site).href,
});

type Block = { title: string; url: string; repo?: string | undefined; license?: string | undefined; short: string; id?: string | undefined; description?: string | undefined };

/** Projects the canon names (CANON_PROJECTS), as blocks; text is the canon sentence, links from profile.json. */
export function canonProjects(): Block[] {
  const links = profile.links as Record<string, string>;
  return CANON_PROJECTS.filter((p) => CARD_TEXT.includes(p.name)).map((p) => {
    const url = links[p.urlPhrase];
    const repo = links[p.repoPhrase];
    if (!url || !repo) throw new Error(`profile.json links: missing "${p.urlPhrase}" or "${p.repoPhrase}"`);
    return { title: p.name, url, repo, license: p.license, short: canonSentence(p.sentence), id: p.id, description: p.description };
  });
}

export function homeGraph(site: URL, blocks: Block[] = []): Graph {
  const id = ids(site);
  const alumni: OrganizationRole[] = CANON.roles
    .filter((r) => r.id !== 'cloudlinux')
    .map((r) => {
      const { start, end } = periodRange(r.period);
      return {
        '@type': 'OrganizationRole',
        alumniOf: { '@type': 'Organization', name: r.org },
        roleName: r.title,
        startDate: start,
        ...(end ? { endDate: end } : {}),
      } as OrganizationRole;
    });

  const website: WebSite = {
    '@type': 'WebSite',
    '@id': id.website,
    name: SITE.name,
    alternateName: ['trukhin.com'],
    url: new URL('/', site).href,
    image: { '@type': 'ImageObject', url: new URL('/avatar-384.jpg', site).href, width: '384', height: '384' },
    inLanguage: 'en',
  };
  const page: ProfilePage = {
    '@type': 'ProfilePage',
    '@id': id.profile,
    url: new URL('/', site).href,
    name: SITE.name,
    mainEntity: { '@id': id.person },
    isPartOf: { '@id': id.website },
    dateCreated: SITE.created,
    dateModified: profile.updated,
    inLanguage: 'en',
  };
  const person: Person = {
    '@type': 'Person',
    '@id': id.person,
    name: SITE.name,
    alternateName: [...SITE.alternateNames],
    description: CANON.thesis,
    jobTitle: SITE.jobTitle,
    worksFor: { '@type': 'Organization', name: SITE.employer.name, url: SITE.employer.url },
    homeLocation: { '@type': 'Place', name: profile.location },
    email: `mailto:${SITE.email}`,
    url: new URL('/', site).href,
    knowsAbout: KNOWS_ABOUT,
    // schema-dts types alumniOf as Organization; schema.org allows a Role in its place.
    alumniOf: alumni as unknown as Organization[],
    sameAs: sameAs(),
  };
  const projects: SoftwareSourceCode[] = [...canonProjects(), ...blocks].map((b) => ({
    '@type': 'SoftwareSourceCode',
    ...(b.id ? { '@id': b.id } : {}),
    name: b.title,
    url: b.url,
    description: b.description ?? b.short,
    author: { '@id': id.person },
    ...(b.repo ? { codeRepository: b.repo } : {}),
    ...(b.license ? { license: `https://spdx.org/licenses/${b.license}.html` } : {}),
  }));
  return { '@context': 'https://schema.org', '@graph': [website, page, person, ...projects] as Thing[] } as Graph;
}

/** Serialises JSON-LD for a <script> element; "<" is escaped so the text cannot close the element. */
export const ldJson = (g: unknown) => JSON.stringify(g).replace(/</g, '\\u003c');
