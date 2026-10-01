# Editing the site

- **Page text**: edit `src/en.html` (English) or `src/he.html` (Hebrew), then run `python3 build.py`.
  Each source is one long page split into sections by `<!-- Name -->` comments. `build.py` turns them into the tabbed pages
  (Home, About, Library Project, Publishing Project, Donate, Contact). Don't edit the generated `index.html`, `about.html`,
  `he-*.html`, etc. directly, because the next build will overwrite your changes.
- **sefarim.json**: the list of published Sefarim. Run `python3 build.py` after editing.
- **memories.json**: approved memories shown on the About page. Memories submitted through the form arrive by email.
  To publish one, add an entry like:

```json
[
  { "name": "Reuven Levi", "relationship": "Chavrusa", "text": "The memory goes here." }
]
```

## shiurim.json
Shiurim and hespedim shown on the About page. Each entry can have a YouTube link or an audio file link:

```json
[
  { "title": "Hesped", "speaker": "Rav Ploni", "date": "Shevat 5785", "youtube": "https://www.youtube.com/watch?v=XXXXXXXXXXX" },
  { "title": "Shiur on Lechem Mishnah", "speaker": "Rav Almoni", "audio": "https://example.com/shiur.mp3" }
]
```

## site.json
- **yahrzeit**: `hebrew` is how the date is displayed (e.g. "י״ב שבט"). `hebcal_month` and `day` are used to calculate the next English date
  (months: Nisan, Iyyar, Sivan, Tamuz, Av, Elul, Tishrei, Cheshvan, Kislev, Tevet, Shvat, Adar, Adar1, Adar2).
  `nishmas` is optional, e.g. "הרב שלום בן ... זצ״ל". The section stays hidden until `hebrew` is filled in.
- **ein**: the tax ID shown on the Donate page (hidden while empty).
- **instagram_feed**: the JSON feed URL from behold.so (looks like `https://feeds.behold.so/XXXX`). Shows the latest 8 posts with their captions on the home page and Library page. Leave empty to show only the Follow button.
- **team**: board members shown on the About page, e.g. `[{ "name": "...", "role": "President" }]` (hidden while empty).
