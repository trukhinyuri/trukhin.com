# trukhin.com — v2

Personal site of Yuri Trukhin — Cloud & AI Platforms Leader. Static HTML, one
hand-written stylesheet, zero JavaScript, zero external requests (no CDNs, no
web fonts, no tracking). Built for people and for AI agents: semantic HTML,
JSON-LD on every page, `llms.txt` / `llms-full.txt`, sitemap, per-page canonical.

## Structure

```
├── index.html                    # positioning, three documented cases, now-feed
├── about.html                    # verified chronology 2007–2026, principles
├── projects.html                 # codex-superpower, agent-tools/CloudRING, capital3, MTS GPU
├── speaking.html                 # talks and demos, 2013–2024
├── writing/
│   ├── index.html                # writing hub
│   └── gpu-platform-economics.html   # first post, 2026-09-20
├── privacy.html, terms.html      # legal pages for agent-tools (text unchanged since 2026-08-26)
├── 404.html
├── robots.txt                    # open to all crawlers, AI included
├── sitemap.xml
├── llms.txt, llms-full.txt       # agent-facing map and full plain text
├── assets/
│   ├── style.css                 # the only stylesheet (light/dark via prefers-color-scheme)
│   └── favicon.svg               # YT monogram
├── tools/
│   └── build-llms-full.py        # regenerates llms-full.txt from the HTML pages
└── archive/                      # v1 files (previous site), for reference only
```

## Content policy

Every claim on the site comes from a verified evidence base and carries its
boundary where the evidence is limited. Unverified figures from the v1 site
(ARR, user counts, team-growth multiples, uptime percentages) are deliberately
absent. No numbers of the current employer are published (NDA). v1 content and
history: `archive/` and git history.

## Serving

Any static host. Locally:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

GitHub Pages resolves `/about` → `about.html` and `/writing/` →
`writing/index.html` automatically; canonical URLs use that clean form.

## Regenerating llms-full.txt

After editing page content:

```sh
python3 tools/build-llms-full.py
```
