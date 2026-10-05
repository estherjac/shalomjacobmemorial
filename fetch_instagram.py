#!/usr/bin/env python3
"""Copy public Instagram posts (photo + caption) into the site.

List post links (newest first) in data/instagram_posts.txt, one per line, then run:
    python3 fetch_instagram.py && python3 build.py
Photos are saved to images/ig/ and details to data/instagram.json.
"""
import html
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
links = [l.strip() for l in (ROOT / "data/instagram_posts.txt").read_text().splitlines() if l.strip() and not l.startswith("#")]
out_dir = ROOT / "images/ig"
out_dir.mkdir(parents=True, exist_ok=True)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def meta(page, prop):
    m = re.search(rf'<meta[^>]+(?:property|name)="{prop}"[^>]+content="([^"]*)"', page)
    return html.unescape(m.group(1)) if m else ""


posts = []
for link in links:
    code = re.search(r"/(?:p|reel)/([\w-]+)", link).group(1)
    page = get(f"https://www.instagram.com/p/{code}/").decode("utf-8", "replace")
    title = meta(page, "og:title")
    desc = meta(page, "og:description")
    caption = re.search(r':\s*"(.*)"', title, re.S)
    caption = caption.group(1) if caption else ""
    caption = re.sub(r"[⁦-⁩‎‏]", "", caption).strip()  # strip invisible direction marks
    date = re.search(r" on ([A-Z][a-z]+ \d{1,2}, \d{4})", desc)
    img_url = meta(page, "og:image")
    image = f"images/ig/{code}.jpg"
    if img_url and not (ROOT / image).exists():
        (ROOT / image).write_bytes(get(img_url))
    posts.append({"url": f"https://www.instagram.com/p/{code}/", "image": image if img_url else "",
                  "caption": caption, "date": date.group(1) if date else ""})
    print(f"{code}: {caption.splitlines()[0] if caption else '(no caption)'}")

(ROOT / "data/instagram.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n")
print(f"Saved {len(posts)} posts to data/instagram.json")
