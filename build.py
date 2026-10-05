#!/usr/bin/env python3
"""Build the site.

- Page content lives in src/en.html and src/he.html (one long page each, split into
  sections by <!-- Name --> comments). This script splits them into tabbed pages.
- Sefarim live in data/sefarim.json; this also makes one page per Sefer and the sitemap.

After any edit run:  python3 build.py
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://www.shalomjacobmemorial.com"
sefarim = json.loads((ROOT / "data/sefarim.json").read_text())


# 0. Site pages (tabs) from the single-page sources in src/
import hashlib
import re

def ver(name):  # cache-busting stamp so browsers pick up new CSS/JS right away
    return hashlib.md5((ROOT / name).read_bytes()).hexdigest()[:8]

def stamp(html_text, prefix=""):
    for f in ("styles.css", "script.js", "sefarim-data.js"):
        if (ROOT / f).exists():
            html_text = html_text.replace(f'"{prefix}{f}"', f'"{prefix}{f}?v={ver(f)}"')
    return html_text

PAGES = {  # key: (sections, banner image)
    "home": (["Hero", "Stats", "Home intro", "Home projects", "Instagram", "Home donate"], None),  # "Sefer of the Week + newsletter" paused for now
    "about": (["Life & Legacy", "Legacy bands", "Yahrzeit", "Shiurim", "Memories", "Leadership"], "library-12.jpg"),
    "library": (["Library Project", "Gallery", "Instagram"], "library-01.jpg"),
    "publishing": (["Publishing Project", "Haskamos", "Works in Progress"], "library-05.jpg"),
    "sefarim": (["Sefarim"], "library-07.jpg"),
    "donate": (["Support"], None),
    "contact": (["Contact"], "library-12.jpg"),
}
TEXT = {
    "en": {
        "file": {"home": "index.html", "about": "about.html", "library": "library.html", "publishing": "publishing.html", "sefarim": "sefarim.html", "donate": "donate.html", "contact": "contact.html"},
        "nav": [("about", "About"), ("library", "Library Project"), ("sefarim", "Sefarim"), ("publishing", "Continuing His Work"), ("contact", "Contact")],
        "donate": "Donate", "other": ("עברית", "he"), "site": "Shalom Jacob Memorial Institute",
        "banner": {
            "about": ("Rav Shalom Jacob", "הרב שלום דזשייקאב זצ״ל", "In Memory of"),
            "library": ("The Library Project", "Organizing, archiving and digitizing a historic collection of 50,000 Sefarim."),
            "publishing": ("Continuing His Work", "Carrying Rav Shalom’s publishing mission forward — the Haskamos his Sefarim received, and the work he left unfinished."),
            "sefarim": ("The Sefarim", "Every Sefer Rav Shalom <span class=\"he\">זצ״ל</span> brought back into print — browse by topic, or search by title, author or subject."),
            "donate": ("Support the Institute", ""),
            "contact": ("Contact Us", "Questions, sponsorships, or a memory to share — we’d love to hear from you."),
        },
    },
    "he": {
        "file": {"home": "he.html", "about": "he-about.html", "library": "he-library.html", "publishing": "he-publishing.html", "sefarim": "he-sefarim.html", "donate": "he-donate.html", "contact": "he-contact.html"},
        "nav": [("about", "חייו ומורשתו"), ("library", "פרויקט הספרייה"), ("sefarim", "ספרים"), ("publishing", "המשך מפעלו"), ("contact", "צור קשר")],
        "donate": "תרומה", "other": ("English", "en"), "site": "מכון לזכר הרב שלום דזשייקאב זצ״ל",
        "banner": {
            "about": ("הרב שלום דזשייקאב", "זצ״ל", "לזכרו של"),
            "library": ("פרויקט הספרייה", "סידור, ארכוב ודיגיטציה של אוסף היסטורי של 50,000 ספרים."),
            "publishing": ("המשך מפעלו", "ממשיכים את שליחותו של הרב שלום בהוצאה לאור — ההסכמות שקיבלו ספריו, והמלאכה שלא הספיק להשלים."),
            "sefarim": ("הספרים", "כל הספרים שהרב שלום זצ״ל החזיר לדפוס — עיינו לפי נושא, או חפשו לפי שם, מחבר או ענין."),
            "donate": ("תמיכה במכון", ""),
            "contact": ("צור קשר", "שאלות, הקדשות, או זיכרון לשתף — נשמח לשמוע מכם."),
        },
    },
}
# where each in-page anchor now lives: id -> (page, keep fragment?)
ANCHORS = {"top": ("home", False), "intro": ("home", True), "newsletter": ("home", True),
           "legacy": ("about", False), "memories": ("about", True), "yahrzeit": ("about", True), "shiurim": ("about", True), "leadership": ("about", True),
           "library": ("library", False), "gallery": ("library", True),
           "publishing": ("publishing", False), "sefarim": ("sefarim", False), "haskamos": ("publishing", True), "works": ("publishing", True),
           "support": ("donate", False), "contact": ("contact", False)}


def build_pages(lang):
    t = TEXT[lang]
    src = (ROOT / f"src/{lang}.html").read_text()
    head, rest = src.split("<main id=\"top\">", 1)
    main, tail = rest.split("</main>", 1)
    sections = {m.group(1): m.group(2) for m in re.finditer(r"  <!-- (.+?) -->\n(.*?)(?=\n  <!-- |\Z)", main, re.S)}
    head = re.sub(r'  <link rel="(alternate|canonical)"[^>]*>\n', "", head)
    other_label, other_lang = t["other"]
    for key, (names, banner_img) in PAGES.items():
        fname = t["file"][key]
        def fix(m):
            anchor = m.group(1)
            if anchor not in ANCHORS:
                return m.group(0)
            page, frag = ANCHORS[anchor]
            if page == key:
                return f'href="#{anchor}"'
            return f'href="{t["file"][page]}' + (f"#{anchor}" if frag else "") + '"'
        current = ' class="current" aria-current="page"'
        nav = "\n".join(
            f'      <li><a href="{t["file"][k]}"{current if k == key else ""}>{label}</a></li>'
            for k, label in t["nav"])
        nav += f'\n      <li><a href="{t["file"]["donate"]}" class="btn btn-gold">{t["donate"]}</a></li>'
        L = {"en": dict(btn="Accessibility", title="Accessibility", lang="Language", close="Close"),
             "he": dict(btn="נגישות", title="נגישות", lang="שפה", close="סגירה")}[lang]
        here_label = "English" if lang == "en" else "עברית"
        lang_float = f"""<div class="a11y" id="a11y">
  <button class="a11y-btn" aria-expanded="false" aria-controls="a11y-panel" aria-label="{L['btn']}" title="{L['btn']}">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.2" r="2"/><path d="M4 7.5c2.6.9 5.3 1.3 8 1.3s5.4-.4 8-1.3l.5 1.8c-2 .7-4.1 1.2-6.2 1.4v3.8l2 7.3-1.9.5-2.1-6.6h-.6l-2.1 6.6-1.9-.5 2-7.3v-3.8c-2.1-.2-4.2-.7-6.2-1.4z"/></svg>
  </button>
  <div class="a11y-panel" id="a11y-panel" role="dialog" aria-label="{L['title']}" hidden>
    <div class="a11y-head"><b>{L['title']}</b><button class="a11y-close" aria-label="{L['close']}">×</button></div>
    <p class="a11y-label">{L['lang']}</p>
    <div class="a11y-langs">
      <a href="{t['file'][key] if lang == 'en' else TEXT['en']['file'][key]}" lang="en" hreflang="en"{' aria-current="true"' if lang == 'en' else ''}>English</a>
      <a href="{TEXT['he']['file'][key] if lang == 'en' else t['file'][key]}" lang="he" hreflang="he"{' aria-current="true"' if lang == 'he' else ''}>עברית</a>
    </div>
  </div>
</div>
"""
        h = re.sub(r'(<ul class="nav-links" id="nav-links">\n).*?(\n    </ul>)', lambda m: m.group(1) + nav + m.group(2), head, flags=re.S)
        title = t["site"] if key == "home" else f'{("Life & Legacy" if lang == "en" else "חייו ומורשתו") if key == "about" else re.sub("<[^>]+>", "", t["banner"][key][0]).replace("&amp;", "&")} · {t["site"]}'
        h = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", h)
        h = h.replace("</head>", f'  <link rel="canonical" href="{SITE}/{"" if fname == "index.html" else fname}">\n'
                      f'  <link rel="alternate" hreflang="{other_lang}" href="{TEXT[other_lang]["file"][key]}">\n</head>')
        h = h.replace('<a href="#top" class="brand">', f'<a href="{t["file"]["home"]}" class="brand">')
        body = ""
        if banner_img:
            bt, bs, *eb = t["banner"][key]
            if eb:  # cinematic, centered memorial opening
                body += (f'  <section class="page-banner cinematic" style="--banner:url(\'images/{banner_img}\')">\n    <div class="wrap">\n'
                         f'      <span class="eyebrow">{eb[0]}</span>\n      <h1>{bt}</h1>\n      <p class="hebname" lang="he">{bs}</p>\n    </div>\n  </section>\n\n')
            else:
                body += (f'  <section class="page-banner" style="--banner:url(\'images/{banner_img}\')">\n    <div class="wrap">\n'
                         f'      <h1>{bt}</h1>\n' + (f"      <p>{bs}</p>\n" if bs else "") + "    </div>\n  </section>\n\n")
        body += "\n".join(f"  <!-- {n} -->\n" + sections[n] for n in names)
        h = h.replace("    </ul>\n  </nav>", "    </ul>\n    " + lang_float.replace("\n", "\n    ").rstrip() + "\n  </nav>", 1)
        page = h.replace("<body>", f'<body data-page="{key}">', 1) + '<main id="top">\n' + body + "\n</main>\n" + tail
        page = re.sub(r'href="#([\w-]+)"', fix, page)
        (ROOT / fname).write_text(stamp(page))
    return list(t["file"].values())



# 1. Data file used by the site pages
(ROOT / "sefarim-data.js").write_text(
    "// Generated by build.py from data/sefarim.json — edit that file instead.\n"
    f"window.SEFARIM = {json.dumps(sefarim, ensure_ascii=False, indent=1)};\n"
)

site_pages = build_pages("en") + build_pages("he")

# 2. One page per Sefer
HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} · {en} · Shalom Jacob Memorial Institute</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{title} — {en}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{SITE}/images/{og}">
  <link rel="icon" href="../images/logo.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Frank+Ruhl+Libre:wght@400;500;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="site-header">
  <nav class="wrap nav" aria-label="Main">
    <a href="../index.html" class="brand"><img src="../images/logo.jpg" alt="The Shalom Jacob Memorial Institute"></a>
    <div style="display:flex;gap:10px;align-items:center">
      <a href="../sefarim.html" class="btn btn-outline hide-phone">All Sefarim</a>
      <a href="../donate.html" class="btn btn-gold">Donate</a>
    </div>
  </nav>
</header>
<main>
"""

FOOT = """</main>
<script>
  const d = document.querySelector(".cover-dialog");
  document.querySelector(".cover-zoom")?.addEventListener("click", () => d.showModal());
  d?.addEventListener("click", (e) => { if (e.target === d) d.close(); });
</script>
<footer>
  <div class="wrap foot-bottom">
    <span>© 2026 The Shalom Jacob Memorial Institute · Monsey, NY 10952</span>
    <a href="../index.html">Home</a>
  </div>
</footer>
</body>
</html>
"""


def e(s):
    return html.escape(s or "")


def link(s):
    return f'<a class="sefer-link" href="{s["id"]}.html"><span class="he">{e(s["title"])}</span><small>{e(s["en"])}</small></a>'


out = ROOT / "sefarim"
out.mkdir(exist_ok=True)
for i, s in enumerate(sefarim):
    url = f"{SITE}/sefarim/{s['id']}.html"
    desc = (f"{s['en']} ({s['title']}) by {s['author']} — {s['subject']}. "
            f"Republished in {s['republished']} by Rav Shalom Jacob זצ״ל with his annotations and commentary.")
    ld = json.dumps({
        "@context": "https://schema.org", "@type": "Book", "name": s["title"], "alternateName": s["en"],
        "author": {"@type": "Person", "name": s["author"]}, "inLanguage": "he", "about": s["subject"],
        "editor": {"@type": "Person", "name": "Rav Shalom Jacob"}, "url": url,
        **({"image": f"{SITE}/images/{s['cover']}"} if s.get("cover") else {}),
    }, ensure_ascii=False)
    cover = (f'<button class="cover-zoom" aria-label="Enlarge cover"><img src="../images/{s["cover"]}" alt="Cover of {e(s["en"])}" class="sefer-cover"><span>View larger</span></button>'
             f'<dialog class="cover-dialog" aria-label="Cover of {e(s["en"])}"><form method="dialog"><button aria-label="Close">×</button></form><img src="../images/{s["cover"]}" alt="Cover of {e(s["en"])}"></dialog>'
             if s.get("cover")
             else f'<div class="sefer-cover sefer-cover-blank"><span class="he">ספר</span><b class="he">{e(s["title"])}</b></div>')
    first = f'<div><dt>First printed</dt><dd class="he">{e(s["first"])}</dd></div>' if s.get("first") else ""
    same = [o for o in sefarim if o["id"] != s["id"] and (o["author"] == s["author"] or o["title"] == s["title"])]
    related = (f'<h3 style="margin-top:2.4em">More from this author</h3><div class="sefer-links">{"".join(link(o) for o in same)}</div>'
               if same else "")
    prev, nxt = sefarim[i - 1] if i else None, sefarim[i + 1] if i + 1 < len(sefarim) else None
    pager = '<nav class="pager">' + (
        f'<a href="{prev["id"]}.html">← <span class="he">{e(prev["title"])}</span></a>' if prev else "<span></span>") + (
        f'<a href="{nxt["id"]}.html"><span class="he">{e(nxt["title"])}</span> →</a>' if nxt else "<span></span>") + "</nav>"

    body = f"""  <section class="sefer-page">
    <div class="wrap">
      <p class="crumbs"><a href="../sefarim.html" class="back-link">← Back to all Sefarim</a></p>
      <div class="sefer-grid">
        <div>{cover}</div>
        <div>
          <span class="eyebrow"><span>Published by Rav Shalom Jacob <span class="he">זצ״ל</span></span></span>
          <h1 class="he sefer-title" lang="he">{e(s['title'])}</h1>
          <p class="sefer-en">{e(s['en'])}</p>
          <dl class="sefer-facts">
            <div><dt>Author</dt><dd class="he">{e(s['author'])}</dd></div>
            <div><dt>Subject</dt><dd class="he">{e(s['subject'])}</dd></div>
            {first}
            <div><dt>Republished</dt><dd class="he">{e(s['republished'])}</dd></div>
          </dl>
          <p>Rav Shalom <span class="he">זצ״ל</span> devoted himself to reviving the Torah of forgotten Rabbinic giants. Like each of the Sefarim he published, this edition was enriched with his own commentary and annotations and a biography of its author.</p>
          <div class="hero-cta" style="margin-top:1.4em">
            <a href="../donate.html" class="btn btn-gold">Support the Publishing Project</a>
            <a href="../contact.html" class="btn btn-outline">Ask about this Sefer</a>
          </div>
          {related}
        </div>
      </div>
      {pager}
    </div>
  </section>
"""
    page = HEAD.format(title=e(s["title"]), en=e(s["en"]), desc=e(desc), url=url, SITE=SITE,
                       og=s.get("cover", "library-hero.jpg"), ld=ld) + body + FOOT
    (out / f"{s['id']}.html").write_text(stamp(page, "../"))

# 3. Sitemap
urls = [f"{SITE}/" + ("" if p == "index.html" else p) for p in site_pages] + [f"{SITE}/privacy.html"] + [f"{SITE}/sefarim/{s['id']}.html" for s in sefarim]
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n"
)
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
print(f"Built {len(site_pages)} site pages, {len(sefarim)} Sefer pages, sefarim-data.js and sitemap.xml")
