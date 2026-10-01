# Site data

- **sefarim.json**: the list of published Sefarim. After editing, run `python3 build.py` to regenerate `sefarim-data.js`, the pages in `sefarim/`, and `sitemap.xml`.
- **memories.json**: approved memories shown on the site. Memories submitted through the form arrive by email. To publish one, add an entry like:

```json
[
  { "name": "Reuven Levi", "relationship": "Chavrusa", "text": "The memory goes here." }
]
```
