"""Non-destructive QA inventory for the Circumpolar Ethnobotanical Database.

Run: python scripts/audit_project.py
This reports concerns; it never deletes research data.
"""
from pathlib import Path
import collections
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
read = lambda name: json.loads((DATA/name).read_text(encoding='utf-8'))
manifest = read('manifest.json')
plants = [p for name in manifest['phytonym_files'] for p in read(name)]
sources = read('sources.json')
locations = {x['location_id']: x for x in read('locations.json')}
dialects = {x['dialect_id']: x for x in read('dialects.json')}
taxa = read('taxa.json')
source_ids = {a.get('source_id') for p in plants for a in p.get('attestations',[])}
source_ids |= {r.get('source_id') for p in plants for grp in p.get('field_sources',{}).values() for refs in grp.values() for r in refs}
missing_geo = collections.Counter()
for p in plants:
    has_attested = any(a.get('location_id') in locations and locations[a['location_id']].get('latitude') is not None for a in p.get('attestations',[]))
    dialect_ids = [p.get('dialect_id'), *(a.get('dialect_id') for a in p.get('attestations',[])), *(d for a in p.get('attestations',[]) for d in a.get('dialect_ids',[]))]
    has_dialect = any(locations.get(loc,{}).get('latitude') is not None for did in dialect_ids if did in dialects for loc in dialects[did].get('location_ids',[]))
    has_fallback = locations.get(p.get('reference_location_id'),{}).get('latitude') is not None
    # Conventional group anchor, not evidence of an attested locality.
    has_group_anchor = any(locations.get(loc_id,{}).get('latitude') is not None for loc_id in p.get('group_reference_location_ids',{}).values())
    if not (has_attested or has_dialect or has_fallback or has_group_anchor): missing_geo[p['language_id']] += 1

common_keys = ['phytonym_id','language_id','dialect_id','taxon_id','name_native_language','names_other_varieties','russian_gloss','english_gloss','cognate','ecological_data','indigenous_knowledge','attestations','pan_arctic_species','endangered_species']
optional_keys = sorted(set().union(*(set(p) for p in plants))-set(common_keys))
unused_sources = [s for s in sources if s['source_id'] not in source_ids]
legacy_dir = (ROOT/'sviridova').exists()
print('# CEDB technical-debt and attribute audit')
print(f'\nRecords: {len(plants)}; languages: {len(read("languages.json"))}; sources: {len(sources)}; locations: {len(locations)}; taxa: {len(taxa)}')
print('\n## Repository / build hygiene')
print(f'- Legacy sviridova/ directory in this tree: {"PRESENT — REMOVE" if legacy_dir else "absent"}')
print('- Uploading a ZIP over an existing GitHub repository does **not** delete existing paths.')
print('- Deleted paths must be removed in Git with `git rm -r --ignore-unmatch sviridova` and committed.')
print('\n## Profile attribute inventory')
for k in common_keys:
    present=sum(k in p for p in plants)
    filled=sum(bool(p.get(k)) for p in plants)
    print(f'- `{k}`: {present}/{len(plants)} keys present, {filled} nonempty')
print('\nOther attributes (review whether they are intended source metadata, editor inputs or legacy fields):')
for k in optional_keys:
    present=sum(k in p for p in plants)
    print(f'- `{k}`: {present} records')
print('\n## Unused bibliography entries (not necessarily deletable; may be resources-only)')
for s in unused_sources:
    print(f'- {s["source_id"]} — {s.get("citation_key","")} {s.get("year","")}')
print('\n## Phytonyms with no available map coordinate (including conventional group anchors)')
print(f'- Total: {sum(missing_geo.values())}')
for lang,count in sorted(missing_geo.items(),key=lambda x:-x[1]): print(f'- {lang}: {count}')
print('\n## Source provenance distinctions')
print('- `data/sources.json` contains a genuine Sviridova 1995 bibliography entry cited by existing Evenki records.')
print('- This bibliography entry is NOT the obsolete `sviridova/` website directory. Do not conflate them.')
print('- More granular field-by-field semantic review requires inspecting scholarly sources; schema validation alone cannot verify scientific accuracy.')
