import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const canonPath = process.env.CANON_UPSTREAM ?? resolve(root, 'src/content/profile/card.txt');

const EXPECTED_POSTS = [
  'byteburst-10-codex-vs-claude-for-real-executive-work',
  'byteburst-9-the-computer-that-learned-to-click',
  'byteburst-8-three-agents-three-philosophies',
  'byteburst-7-ralph-beads-and-bv-a-practicum-for-autonomous-software-development',
  'byteburst-6-jetbrains-finally-cracked-the-code-and-released-a-devops-ide-in-2025-3',
  'byteburst-5-the-rise-of-neural-memory-systems-and-test-time-learning',
  'byteburst-4-the-synchronization-of-intelligence',
  'gemini-3-pro-deepthink-and-antigravity',
  'understanding-level-3-market-data-a-deep-dive-into-the-quantum-mechanics-of-financial-markets',
];

test('Core dist artifacts exist (index.html, writing/index.html, llms.txt, sitemap, robots.txt, AGENTS.md)', () => {
  for (const rel of [
    'index.html',
    'index.md',
    'writing/index.html',
    'blog/index.html',
    'llms.txt',
    'llms-full.txt',
    'sitemap.xml',
    'sitemap-index.xml',
    'sitemap-0.xml',
    'robots.txt',
    'AGENTS.md',
  ]) {
    assert.ok(existsSync(resolve(dist, rel)), `Missing dist/${rel}`);
  }
});

test('All 9 blog posts exist as HTML and Markdown twins', () => {
  for (const slug of EXPECTED_POSTS) {
    assert.ok(existsSync(resolve(dist, 'blog', slug, 'index.html')), `Missing HTML for ${slug}`);
    assert.ok(existsSync(resolve(dist, 'blog', `${slug}.md`)), `Missing Markdown twin for ${slug}`);
  }
  const htmlDirs = readdirSync(resolve(dist, 'blog'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !['lang', 'search', 'series', 'tags'].includes(d.name))
    .map((d) => d.name);
  assert.equal(htmlDirs.length, 9, `Expected 9 blog post directories, found ${htmlDirs.length}`);
});

test('Executive v6.0 CloudLinux/TuxCare block, AI systems (300M+ tokens/day, 60+ systems), TRUKHIN #CloudRING, OpenClaw/DevContainers/RalphX OSS, and IURII TRUKHIN music block are present', () => {
  const indexHtml = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const llmsTxt = readFileSync(resolve(dist, 'llms.txt'), 'utf8');
  const llmsFullTxt = readFileSync(resolve(dist, 'llms-full.txt'), 'utf8');
  const canon = readFileSync(canonPath, 'utf8');

  const indexText = indexHtml.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
  const llmsFullText = llmsFullTxt.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const requiredSnippets = [
    'I report to the CloudLinux CEO and direct the global infrastructure organization serving CloudLinux and TuxCare',
    'I proposed and led the company-wide engineering move to Claude Code as its standard AI coding tool',
    'I own the multi-year capacity and spend architecture with the CEO and product leaders',
    'In autumn 2025 I also covered the chief security officer role for CloudLinux and TuxCare on an interim basis',
    'For the past two years I have spent thousands of hours designing and running autonomous multi-agent systems across more than 300M tokens of daily production and R&D workloads',
    'In OpenClaw (390k+ GitHub stars), I shipped a merged fix for headless browser passkey automation',
  ];

  for (const snippet of requiredSnippets) {
    assert.ok(canon.includes(snippet), `Canon missing: ${snippet}`);
    assert.ok(indexText.includes(snippet), `dist/index.html missing: ${snippet}`);
    assert.ok(llmsFullText.includes(snippet), `dist/llms-full.txt missing: ${snippet}`);
  }

  // Ensure sysadmin ticket down-leveling phrases are completely gone
  assert.ok(!indexHtml.includes('moved the corporate GitLab to a high-availability cluster in one overnight cutover'));
  assert.ok(!indexHtml.includes('Builds that moved there run much faster'));
  assert.ok(!indexHtml.includes('made two-factor sign-in mandatory on our main portals'));

  // Ensure EasyCLIProxyAPI, router-for-me, and OpenShell are completely gone per Persona 3 guardrail
  assert.ok(!indexHtml.includes('EasyCLIProxyAPI'), 'dist/index.html must not include EasyCLIProxyAPI');
  assert.ok(!canon.includes('EasyCLIProxyAPI'), 'canon must not include EasyCLIProxyAPI');
  assert.ok(!indexHtml.includes('router-for-me'), 'dist/index.html must not include router-for-me');
  assert.ok(!canon.includes('router-for-me'), 'canon must not include router-for-me');
  assert.ok(!indexHtml.includes('OpenShell'), 'dist/index.html must not include OpenShell');
  assert.ok(!canon.includes('OpenShell'), 'canon must not include OpenShell');
  assert.ok(!indexHtml.includes('vk.com/trukhinyuri'), 'dist/index.html must not include VK link');

  // Verify all top open-source PR/patch links point to Yuri\'s exact real PR numbers and Lore thread
  const expectedPRLinks = [
    'https://github.com/opencloudtech/CloudRING/pull/178',
    'https://github.com/openclaw/openclaw/pull/170857',
    'https://github.com/rook/rook/pull/18564',
    'https://github.com/ChromeDevTools/chrome-devtools-mcp/pull/3135',
    'https://lore.kernel.org/r/CAOx7e9Jm0N9O_ndL1UApMPrXUN=P4RiptSNibdDP+9prUsNPOw@mail.gmail.com',
    'https://github.com/puppeteer/puppeteer/pull/15585',
    'https://github.com/kubernetes-sigs/kueue/pull/17160',
    'https://github.com/nebius/soperator/pull/3116',
    'https://github.com/NVIDIA/NVSentinel/pull/2028',
    'https://github.com/vllm-project/aibrix/pull/3078',
    'https://github.com/ceph/ceph/pull/72706',
    'https://github.com/ceph/ceph-csi/pull/6649',
    'https://github.com/kata-containers/kata-containers/pull/14048',
    'https://github.com/OpenNebula/one/pull/8180',
    'https://github.com/apache/mina-sshd/pull/930',
    'https://github.com/jenkinsci/workflow-support-plugin/pull/434',
    'https://github.com/opencost/opencost/pull/4112',
    'https://github.com/chainguard-dev/apko/pull/2578',
    'https://github.com/sigstore/cosign/pull/5167',
    'https://github.com/grafana/mimir/pull/16868',
    'https://github.com/devcontainers/spec/pull/381',
    'https://github.com/aigentive/RalphX/pull/120',
  ];
  for (const pr of expectedPRLinks) {
    assert.ok(indexHtml.includes(pr), `dist/index.html missing real PR link: ${pr}`);
  }

  assert.ok(llmsTxt.includes(requiredSnippets[0]), 'dist/llms.txt missing primary CloudLinux/TuxCare scope');
  assert.ok(indexHtml.includes('TRUKHIN #CloudRING'), 'dist/index.html missing TRUKHIN #CloudRING');
  assert.ok(llmsTxt.includes('TRUKHIN #CloudRING'), 'dist/llms.txt missing TRUKHIN #CloudRING');
  assert.ok(indexHtml.includes('I write and release music as a hobby, as IURII TRUKHIN.'), 'dist/index.html missing IURII TRUKHIN music block');
  assert.ok(llmsFullTxt.includes('I write and release music as a hobby, as IURII TRUKHIN.'), 'dist/llms-full.txt missing IURII TRUKHIN music block');
});

test('All 7 Synology alignment fixes from 09.10 19:26 are enforced', () => {
  const indexHtml = readFileSync(resolve(dist, 'index.html'), 'utf8');
  const writingHtml = readFileSync(resolve(dist, 'writing/index.html'), 'utf8');
  const llmsTxt = readFileSync(resolve(dist, 'llms.txt'), 'utf8');

  // 1 & 2: No unverified MSU/TvGTU Master\'s claims on site
  assert.ok(!indexHtml.includes('Master\'s'), 'Unexpected Master\'s claim on home page');
  // 3: Infobox role and 2015 + 2016 Microsoft partner award (without Russia/Russian)
  assert.ok(indexHtml.includes('Cloud strategist and evangelist, CTO from 2017'));
  assert.ok(indexHtml.includes('In 2015 we won the hosting category of Microsoft\'s partner solutions competition with Office24, our sovereign-hosted alternative to Office 365, and we won it again in 2016.'));
  // 4: MTS "six countries" removed & zero "Russian"/"Russia" on home and writing pages
  assert.ok(!indexHtml.includes('six countries'));
  assert.ok(!llmsTxt.includes('six countries'));
  assert.ok(!/russia/i.test(indexHtml), 'Unexpected Russia/Russian on home page');
  assert.ok(!/russia/i.test(writingHtml), 'Unexpected Russia/Russian on writing page');
  // 5: MTS role progression + MWS 2022-2023 + No. 2 in regional IaaS
  assert.ok(indexHtml.includes('Head of Cloud Platform, MTS Web Services'));
  assert.ok(indexHtml.includes('first employee in MTS&#39;s cloud engineering department') || indexHtml.includes("first employee in MTS's cloud engineering department"));
  assert.ok(indexHtml.includes('Cloud Hub and Cloud Billing'));
  assert.ok(indexHtml.includes('Open Cloud Standard v1 and v2'));
  assert.ok(indexHtml.includes('14 cloud services'));
  assert.ok(indexHtml.includes('by MTS\'s 2020 annual report it was number two in regional IaaS by revenue'));
  // 6: CNIP GIS, Tver 2007-2013
  assert.ok(indexHtml.includes('CNIP GIS, Tver'));
  assert.ok(indexHtml.includes('Researcher, then lead software engineer and architect'));
  assert.ok(!indexHtml.includes('Geological research'));
  // 7: JetBrains title & AI Journey without year 2020
  assert.ok(indexHtml.includes('Lead Product (IntelliJ Platform)'));
  assert.ok(indexHtml.includes('AI Journey: talks several years in a row, including'));
  assert.ok(!writingHtml.includes('datetime="2020"'));
  assert.ok(!writingHtml.includes('AI Journey 2020'));
});
