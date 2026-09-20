#!/usr/bin/env python3
"""Generate llms-full.txt from the site's HTML pages. Run from repo root."""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = [
    ("index.html", "HOME — https://trukhin.com/"),
    ("about.html", "ABOUT — https://trukhin.com/about"),
    ("projects.html", "PROJECTS — https://trukhin.com/projects"),
    ("speaking.html", "SPEAKING — https://trukhin.com/speaking"),
    ("writing/index.html", "WRITING — https://trukhin.com/writing/"),
    ("writing/gpu-platform-economics.html",
     "POST — https://trukhin.com/writing/gpu-platform-economics"),
]


def strip_to_text(src: str) -> str:
    # drop script/style/head noise
    src = re.sub(r"<script.*?</script>", " ", src, flags=re.S | re.I)
    src = re.sub(r"<style.*?</style>", " ", src, flags=re.S | re.I)
    src = re.sub(r"<head.*?</head>", " ", src, flags=re.S | re.I)
    src = re.sub(r"<!--.*?-->", " ", src, flags=re.S)
    # structural breaks
    src = re.sub(r"</(p|h1|h2|h3|h4|li|dt|dd|tr|blockquote|time|caption)>", "\n", src, flags=re.I)
    src = re.sub(r"<br\s*/?>", "\n", src, flags=re.I)
    src = re.sub(r"</(a|strong|b|em|i|span|th|td)>", "", src, flags=re.I)
    src = re.sub(r"<[^>]+>", " ", src)
    text = html.unescape(src)
    lines = []
    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line:
            lines.append(line)
    out = []
    prev = None
    for line in lines:
        if line != prev:
            out.append(line)
        prev = line
    return "\n".join(out)


def main() -> None:
    parts = [
        "# trukhin.com — full text for LLMs",
        "",
        "> Plain-text content of trukhin.com, generated from the same HTML files the site serves.",
        "> Generated: 2026-09-20. Short map: https://trukhin.com/llms.txt",
        "",
    ]
    for rel, title in PAGES:
        src = (ROOT / rel).read_text(encoding="utf-8")
        body = strip_to_text(src)
        # cut the repeated footer line
        body = body.replace("Yuri Trukhin · trukhin.com · static, no tracking\n", "")
        body = "\n".join(
            ln for ln in body.split("\n")
            if ln not in {"About", "Projects", "Speaking", "Writing", "llms.txt",
                          "Home", "Terms", "Privacy", "Skip to content"}
        )
        parts.append("=" * 72)
        parts.append(title)
        parts.append("=" * 72)
        parts.append("")
        parts.append(body)
        parts.append("")
    out_path = ROOT / "llms-full.txt"
    out_path.write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
