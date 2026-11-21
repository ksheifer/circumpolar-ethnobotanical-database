# Circumpolar Ethnobotanical Database

A static, bilingual (English/Russian) catalogue of Indigenous phytonyms, botanical identifications, ecological information, Indigenous knowledge, bibliographic evidence and geographic references. Hosted using GitHub Pages; no backend or private database.

## Publishing

1. Upload **all** files and folders in this repository to the GitHub Pages publishing root, including `data/manifest.json` and every file listed in `phytonym_files`.
2. Publish from the repository root (or configure GitHub Pages accordingly). `.nojekyll` enables direct publishing.
3. Wait for the Pages deployment to complete. A hard refresh may be necessary after changing site versions; all JSON fetches use cache-busting release versions.
4. The site requires a network connection for Leaflet's JavaScript/CSS and the SheetJS Excel-export library. Map tiles also require a connection. If these services are unreachable, the lexical catalogue still loads.

## Data structure

- `data/manifest.json` lists the six reference collections and all phytonym collections.
- `data/languages.json`: top-level languages. Enets is **one language** with forest and tundra varieties in `data/dialects.json`.
- `data/dialects.json`: language varieties and optional geographic reference places.
- `data/locations.json`: named geographic entities, with bilingual labels and coordinates where available.
- `data/sources.json`: bibliographic metadata and verified source links.
- `data/taxa.json`: botanically identified taxa. Empty family/species is permitted when identification is unsupported.
- `data/phytonyms/*.json`: lexical records, attestations, botanical and ethnobotanical fields and optionally field-level references.

**Geography:** `attestations[].location_id` represents a source-linked place; dialect location IDs and `reference_location_id` are geographic *reference points*, not proven attestation sites. If no more precise locality is known, Forest Yukaghir records use Nelemnoe and Tundra Yukaghir records use Andryushkino as community reference points. Do not silently promote these points to evidence of recording.

**Evidence:** each attestation links to a bibliographic source; some enriched ethnobotanical fields also include per-field sources with printed page references. Older records can contain attestation-level evidence without a separate citation on every field. Do not invent source page numbers to fill these gaps.

## Validation

Requires Python >=3.11 and Node.js >=18; no package installation needed for routine checks.

```sh
python scripts/validate_data.py
python scripts/check_catalog_data.py
python scripts/check_enets_nganasan.py
node --check app.js
node scripts/test_catalog_runtime.cjs
node scripts/test_audit_regressions.cjs
```

These checks run automatically in GitHub Actions on pushes and pull requests. For an **optional** real-browser test, install Playwright and Chromium and run `python scripts/smoke_browser.py`. Browser smoke testing requires access to the local test server, which some sandbox environments block.

## Release information

Audit release: `20261121-audited-v2`. Contains 981 phytonyms, 18 languages, 99 language varieties, 216 localities, 37 sources, 278 taxa and one contributor.

## Known limitations

- Some sources do not identify the plant to genus/family; no identification should be inferred without evidence.
- Some ethnobotanical fields have only record-level source attribution rather than an individual field-level page citation.
- Community reference points intentionally convey less certainty than source-attested localities.
- External stylesheet, map and Excel libraries require network access; no bundled offline dependencies are included.
- The published GitHub Pages deployment must be checked separately after uploads; local validation does not prove remote publication has propagated.
