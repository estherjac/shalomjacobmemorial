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
