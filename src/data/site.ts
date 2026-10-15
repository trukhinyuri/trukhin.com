export const SITE = {
  name: 'Yuri (IURII) Trukhin',
  legalName: 'Iurii Trukhin',
  alternateNames: ['Yuri Trukhin', 'Iurii Trukhin', 'IURII TRUKHIN', 'trukhinyuri'],
  handle: 'trukhinyuri',
  email: 'yuri@trukhin.com',
  repo: 'https://github.com/trukhinyuri/trukhin.com',
  employer: { name: 'CloudLinux', url: 'https://cloudlinux.com' },
  jobTitle: 'Director of Infrastructure',
  /** First publication of v5; set once on release 1. */
  created: '2026-10-08',
  themeColor: { light: '#FBFBF9', dark: '#111317' },
  /**
   * Canonical URL of imported posts, one switch for canonical, og:url, JSON-LD and the 301 map (DESIGN-SPEC §8.3, §8.5).
   * 'medium-domain' (release 1): the post's address on blog.trukhin.com, which Medium still serves; the 301 map is staged.
   * 'self' (release 2): every post points at itself on trukhin.com; switch only together with applying the 301 map.
   * tools/check-canonical.mjs proves the pages agree with this value.
   */
  blogCanonical: 'medium-domain' as 'medium-domain' | 'self',
} as const;

/**
 * Projects outside the day job that the canon describes. Name, link phrases and the description come from
 * card.txt and profile.json; the node is emitted only while the canon names the project.
 */
export const CANON_PROJECTS = [
  {
    name: 'TRUKHIN #CloudRING',
    urlPhrase: 'TRUKHIN #CloudRING',
    repoPhrase: 'build it in the open',
    license: 'Apache-2.0',
    sentence: 'I founded TRUKHIN #CloudRING',
    id: 'https://cloudring.org/#software',
    // About the program, not the person (wording from cloudring.org); used in JSON-LD only.
    description: "An open-source cloud platform for independent providers, built around OCSv3, an open contract between a provider's platform and the services it offers.",
  },
] as const;

/** Topics that are visible in the page text (JSON-LD knowsAbout). */
export const KNOWS_ABOUT = [
  'Cloud infrastructure',
  'Hyperscaler cloud platform architecture',
  'Cloud Hub and Cloud Billing',
  'Open Cloud Standard (OCS v1, v2, v3)',
  'Multi-tenant cloud services',
  'Capacity planning',
  'Infrastructure cost',
  'GPU cloud',
  'Kubernetes',
  'Ceph storage',
  'Observability',
  'Zero-trust access',
  'Software supply chain security',
  'AI coding agents',
  'Autonomous multi-agent systems',
  'FinOps attribution',
  'Developer environments',
];
