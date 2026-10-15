#!/usr/bin/env node
// Publishes exactly the approved build (DESIGN-SPEC §6.3). Dry run by default; nothing leaves the machine
// without --apply, and --apply is run by the owner, or by an agent after the owner approved this exact id in chat.
//
//   npm run publish -- --id <id>                 dry run: clean tree, npm ci, build, check, id match, print the plan
//   npm run publish -- --id <id> --apply         commit with "Publish-Id: <id>", push to origin main, wait for
//                                                the deploy, compare every file of the manifest with the live site
//   npm run publish -- --revert <commit>         dry run of a rollback (git revert + new build + new id)
//
// The approved id must also be the one recorded by the owner: env TRUKHIN_DECISIONS points to the private
// decisions file, whose line "| 1.1 |" carries the only valid id (bold, 16 hex). No file, no publish.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const apply = args.includes('--apply');
const allowDirty = args.includes('--allow-dirty') && !apply; // dry-run rehearsal only
const skipInstall = args.includes('--skip-install') && !apply;
const id = opt('id');
const revert = opt('revert');
const SITE = 'https://trukhin.com';

const sh = (cmd, a) => execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
/** Runs with output on the terminal; a non-zero exit stops the publish. */
const run = (cmd, a) => {
  try { execFileSync(cmd, a, { stdio: 'inherit' }); } catch { stop(`${cmd} ${a.join(' ')} failed`); }
};
const step = (n, msg) => console.log(`[${n}] ${msg}`);
const stop = (msg) => { console.log(`STOP: ${msg}`); process.exit(1); };

if (!id && !revert) stop('pass --id <id> (from npm run manifest) or --revert <commit>');
if (id && !/^[0-9a-f]{16}$/.test(id)) stop(`not an id: ${id}`);

// 1. Tree, branch, Node.
const branch = sh('git', ['branch', '--show-current']);
if (!['v5', 'main'].includes(branch)) stop(`branch ${branch}; publish from v5 or main`);
const dirty = sh('git', ['status', '--porcelain']);
if (dirty && !allowDirty) stop('working tree is not clean; commit or stash first');
const node = process.version.replace(/^v/, '');
const want = readFileSync('.node-version', 'utf8').trim();
if (node !== want) stop(`Node ${node}, .node-version says ${want}`);
step(1, `branch ${branch}, tree ${dirty ? 'DIRTY (rehearsal)' : 'clean'}, Node ${node}`);

if (revert) {
  step(2, `plan: git revert --no-edit ${revert}; npm run build; npm run manifest gives a NEW id; that id needs its own approval`);
  console.log('dry run: nothing changed');
  process.exit(0);
}

// 2. Clean install, build, checks (private policy included).
if (!process.env.TRUKHIN_POLICY) stop('TRUKHIN_POLICY is not set; the private policy check must run before publishing');
if (!skipInstall) { step(2, 'npm ci'); run('npm', ['ci', '--no-audit', '--no-fund']); }
step(2, 'npm run build');
run('npm', ['run', 'build']);
step(2, 'npm run check');
run('npm', ['run', 'check']);

// 3. The built id must equal the argument and the owner's recorded id.
const out = sh('node', ['tools/manifest.mjs']);
const built = out.match(/^id (\w+)$/m)?.[1];
if (built !== id) stop(`built id ${built} ≠ --id ${id}`);
const decisions = process.env.TRUKHIN_DECISIONS;
if (!decisions || !existsSync(decisions)) stop('TRUKHIN_DECISIONS is not set or missing; the recorded id cannot be checked');
const row = readFileSync(decisions, 'utf8').split('\n').find((l) => l.startsWith('| 1.1 |'));
const recorded = row?.match(/действующий id[^*]*\*\*([0-9a-f]{16})\*\*/)?.[1] ?? row?.match(/\*\*([0-9a-f]{16})\*\*/)?.[1];
if (recorded !== id) stop(`id ${id} is not the recorded id for publishing (${recorded ?? 'none'}) in line 1.1 of ${decisions}`);
step(3, `id ${id} matches the build and line 1.1`);

// 4. Plan.
const manifest = readFileSync('build/manifest.txt', 'utf8').trim().split('\n').map((l) => l.split(/\s{2}/));
const remote = (() => { try { return sh('git', ['remote', 'get-url', 'origin']); } catch { return null; } })();
step(4, 'plan:');
console.log(`  git commit --allow-empty -m "Publish ${id}" -m "Publish-Id: ${id}"`);
console.log(`  git push origin HEAD:main   (origin: ${remote ?? 'NOT SET'})`);
console.log(`  wait for the GitHub Pages deploy (up to 16 min), then compare ${manifest.length} files with ${SITE}`);
console.log(`  check: ${SITE}/ ${SITE}/blog/ ${SITE}/blog/rss.xml ${SITE}/llms.txt ${SITE}/sitemap-index.xml`);
if (!apply) { console.log('dry run: nothing committed or pushed'); process.exit(0); }
if (!remote) stop('no origin remote');

run('git', ['commit', '--allow-empty', '-m', `Publish ${id}`, '-m', `Publish-Id: ${id}`]);
run('git', ['push', 'origin', 'HEAD:main']);
console.log('pushed; waiting for the deploy');

// Byte comparison: every file of the manifest, Accept-Encoding: identity.
const sha = (b) => createHash('sha256').update(b).digest('hex');
const matchesManifestHash = (buf, expectedHash, relPath) => {
  const direct = sha(buf);
  if (direct === expectedHash) return { ok: true, mode: 'exact', got: direct };
  if (relPath.endsWith('.html')) {
    const text = buf.toString('utf8');
    for (const variant of [
      text.replace(/<!--email_off-->\n?/g, '<!--email_off-->\n').replace(/<!--\/email_off-->\n?/g, '<!--/email_off-->\n'),
      text.replace(/\n?<!--\/?email_off-->/g, ''),
    ]) {
      if (sha(Buffer.from(variant, 'utf8')) === expectedHash) {
        return { ok: true, mode: 'cloudflare-email-off', got: direct };
      }
    }
  }
  return { ok: false, mode: 'mismatch', got: direct };
};
const urlOf = (p) => `${SITE}/${p.replace(/(^|\/)index\.html$/, '$1')}`;
const deadline = Date.now() + 16 * 60 * 1000;
const probe = manifest.find(([, , p]) => p === 'index.html');
for (;;) {
  const r = await fetch(`${urlOf(probe[2])}?v=${id}`, { headers: { 'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache' } });
  if (r.ok && matchesManifestHash(Buffer.from(await r.arrayBuffer()), probe[0], probe[2]).ok) break;
  if (Date.now() > deadline) stop('home page did not match within 16 minutes; see the Actions run and Cloudflare cache');
  await new Promise((res) => setTimeout(res, 30000));
}
let bad = 0;
for (const [hash, , path] of manifest) {
  const r = await fetch(`${urlOf(path)}?v=${id}`, { headers: { 'Accept-Encoding': 'identity', 'Cache-Control': 'no-cache' } });
  if (!r.ok) {
    bad++;
    console.log(`MISMATCH ${path}: HTTP ${r.status} ≠ ${hash.slice(0, 16)}`);
  } else {
    const res = matchesManifestHash(Buffer.from(await r.arrayBuffer()), hash, path);
    if (!res.ok) { bad++; console.log(`MISMATCH ${path}: ${res.got.slice(0, 16)} ≠ ${hash.slice(0, 16)}`); }
  }
  await new Promise((res) => setTimeout(res, 100));
}
console.log(`live check: ${manifest.length - bad}/${manifest.length} files match`);
if (bad) { console.log('mismatches mean something rewrote the files on the way (Cloudflare Rocket Loader, Email Obfuscation) or a stale cache'); process.exit(1); }
