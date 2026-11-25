# Circumpolar Ethnobotanical Database

**Website:** https://ksheifer.github.io/circumpolar-ethnobotanical-database/

A bilingual (English/Russian) database of Indigenous plant names from circumpolar languages. It brings together phytonyms, botanical identification, ecological information, Indigenous knowledge, bibliographic sources, and geographic references.

## Using the database

Visit the [Circumpolar Ethnobotanical Database](https://ksheifer.github.io/circumpolar-ethnobotanical-database/) to search phytonyms, browse languages, view plant profiles and maps, and export language datasets to Excel.

Every phytonym has its own permanent shareable URL of the form `/phytonyms/?id=PHYTONYM_ID` (the stable ID is not changed when the display name is edited). Search queries use `/search/?q=...`, language selection uses `/languages/?language=...`, and citations link directly to their bibliography entries. Browser Back/Forward and opening a shared profile URL directly are supported. The sections have short shareable URLs: `/search`, `/languages`, `/statistics`, and `/resources`. Resource-language anchors use `#nganasan`, for example `/resources#nganasan`. The section directories have static entrypoints for direct navigation on GitHub Pages; visiting a directory may add a trailing slash. Browser Back and Forward restore the selected section.

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


## Geographic precision

`data/locations.json` records 218 localities, 212 with coordinates; `data/locations.geojson` and `.csv` are exports of the same data. A community or language-variety reference point is not necessarily the place where a word was recorded.

## Sámi and Koryak additions (21 November 2026)

- `data/phytonyms/koryak.json`: eight Koryak records from Kurebito & Saito (2005: 68–86), plus three Alyutor records from Golovaneva (2025: 90–99). The Alyutor citation gives the *article's page range* because a lexeme-specific printed page was not established.
- Latin-character Koryak source transcriptions extracted from the PDF text layer are labelled as requiring collation with the page images; they are not silently rewritten as standardized Cyrillic.
- Evensk is a **district administrative reference**, not a geotag for individual word recordings. Lovozero is a **toponym/context point**, not automatically an attestation location. No fabricated GPS coordinates or personal locations were added.
- Do not treat dictionary glosses as evidence of plant usage. Only source-supported ethnobotanical uses were added.


## Geographic maps (2026-11-21)

- **Languages** displays a map for each language, including independent language-community reference locations when no attestation-specific location is known. These reference locations are **not** evidence that any individual word was collected there.
- A phytonym profile displays a separate comparative lexical map; attestation sites, dialect anchors and community points retain distinct provenance labels.
- Maps use Leaflet/OpenStreetMap when the external library is available. If it cannot load, a non-network coordinate plot still displays all points. The coordinate plot is not a geographical basemap.
- Data and JavaScript are validated automatically. A full live-browser map check on GitHub Pages has not been completed as part of this release.

## Data-quality limits (audited 2026-11-21)

- Of 1,004 phytonym records, only **2** have an attestation with an explicit `location_id`. Other displayed labels use dialect or community reference geography and **must not be described as word recording locations**.
- 9 of 50 bibliographic sources have no recorded source URL; 24 of 1,065 attestations have no specific `source_pages`. Missing information was not invented.
- 150 records have no taxon ID; 69 records contain Indigenous-use fields without field-specific source citations. These need editorial review, not automatic inference.
- A contributor record had sensitive and inferred details without recorded consent; the publicly packaged fields were minimized.
- Source-verification statuses in the JSON are editorial provenance, not linguistic commentary. They should not be rendered as lexical facts.

## Content Editor (administrator only)

A restricted content-only editor is included at `admin/`. It supports one-profile-at-a-time commits through an OAuth-authenticated Cloudflare Worker. **This ZIP does not create a live account or deploy the authentication service.** Installation and GitHub App/Worker authorization steps are in [`admin/SETUP.md`](admin/SETUP.md).

The public site remains fully readable without the Worker. The editor requires GitHub authentication and cannot change the database schema. The Worker permits only explicitly whitelisted fields, validates IDs, and checks the latest Git file SHA before writing. Test the backend with:

```bash
node --experimental-default-type=module scripts/test_editor_worker.mjs
```

## Botanical classification status fields

Each phytonym has `pan_arctic_species` and `endangered_species` (JSON boolean or `null`). All original records have `null`, rendered as **Not specified**. The Content Editor offers Not specified / Yes / No. `false` must only be used for a verified negative, not missing data. `endangered_species` refers to Red Data Book listing; future refinements should record jurisdiction and source.


## Removing obsolete files when updating the site

Replacing or uploading files from a release ZIP does **not** remove tracked
files absent from that ZIP. The old `sviridova/` page must be deleted from
the Git repository separately. In a local clone, run:

```bash
bash scripts/remove_legacy_paths.sh
git diff --cached --stat
git commit -m "Remove obsolete Sviridova website directory"
git push origin main
```

The historical bibliographic source *Sviridova 1995* in `data/sources.json`
is distinct from the obsolete site directory and is cited by Evenki data.

Run `python scripts/audit_project.py` for an attribute inventory, unused
bibliography list and missing-geolocation summary. The continuous-integration
validator rejects any reintroduced `sviridova/` directory.
