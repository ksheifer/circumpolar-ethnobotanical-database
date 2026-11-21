# Circumpolar Ethnobotanical Database

**Website:** https://ksheifer.github.io/circumpolar-ethnobotanical-database/

A bilingual (English/Russian) database of Indigenous plant names from circumpolar languages. It brings together phytonyms, botanical identification, ecological information, Indigenous knowledge, bibliographic sources, and geographic references.

## Using the database

Visit the [Circumpolar Ethnobotanical Database](https://ksheifer.github.io/circumpolar-ethnobotanical-database/) to search phytonyms, browse languages, view plant profiles and maps, and export language datasets to Excel.

The sections have short shareable URLs: `/search`, `/languages`, `/statistics`, and `/resources`. Resource-language anchors use `#nganasan`, for example `/resources#nganasan`. The section directories have static entrypoints for direct navigation on GitHub Pages; visiting a directory may add a trailing slash. Browser Back and Forward restore the selected section.

## Repository structure

- `index.html`, `app.js`, `styles.css` — website interface.
- `data/manifest.json` — list of data files loaded by the website.
- `data/phytonyms/` — phytonym records grouped by language.
- `data/languages.json`, `data/dialects.json` — languages and language varieties.
- `data/locations.json` — geographic references.
- `data/taxa.json` — botanical classification.
- `data/sources.json` — bibliography.
- `data/contributors.json` — contributor records.

## Deployment

This is a static website published via GitHub Pages. To deploy, place the complete repository contents in the publishing branch root and enable GitHub Pages for that branch. The interface uses externally hosted Leaflet and SheetJS libraries; maps and Excel export require network access.

## Data validation

Requires Python 3.11+:

```bash
python scripts/validate_data.py
```

The same validation runs in GitHub Actions when changes are pushed.
