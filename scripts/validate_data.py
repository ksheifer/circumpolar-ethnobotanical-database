#!/usr/bin/env python3
"""Validate public JSON and all cross-references before deployment."""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'data'
errors = []

def read(relative):
    path = BASE / relative
    try:
        resolved = path.resolve()
        if not resolved.is_relative_to(BASE.resolve()):
            raise ValueError('Path escapes data directory')
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors.append(f'{relative}: {exc}')
        return []

def check_table(name, rows, key):
    if not isinstance(rows, list):
        errors.append(f'{name}: expected list')
        return set()
    ids = []
    for i, row in enumerate(rows):
        if not isinstance(row, dict):
            errors.append(f'{name}[{i}]: expected object')
            continue
        ident = row.get(key)
        if not isinstance(ident, str) or not ident:
            errors.append(f'{name}[{i}]: missing {key}')
        else:
            ids.append(ident)
    if len(ids) != len(set(ids)):
        errors.append(f'{name}: duplicate {key}')
    return set(ids)

def linked(value, allowed, path):
    if value is not None and value != '' and value not in allowed:
        errors.append(f'{path}: unknown ID {value!r}')

manifest = read('manifest.json')
if not isinstance(manifest, dict) or manifest.get('schema_version') != 3:
    errors.append('manifest.json: invalid schema version')
    manifest = {}
expected = {'languages','dialects','locations','contributors','sources','taxa'}
files = manifest.get('collections', {})
if not isinstance(files, dict) or set(files) != expected:
    errors.append('manifest.json: expected six named collections')
    files = {x:x+'.json' for x in expected}
phy_files = manifest.get('phytonym_files', [])
if not isinstance(phy_files, list) or not all(isinstance(x, str) and x.startswith('phytonyms/') and x.endswith('.json') for x in phy_files) or len(phy_files) != len(set(phy_files)):
    errors.append('manifest.json: invalid phytonym_files')
    phy_files = []
tables = {key:read(files[key]) for key in sorted(expected)}
tables['phytonyms'] = [p for filename in phy_files for p in read(filename)]
ids = {key:check_table(key, tables[key], singular+'_id') for key,singular in {
    'languages':'language','dialects':'dialect','locations':'location','contributors':'contributor',
    'sources':'source','taxa':'taxon','phytonyms':'phytonym'}.items()}
for loc in tables['locations']:
    if not all(isinstance(loc.get('name_'+lang),str) and loc['name_'+lang].strip() for lang in ('ru','en')):
        errors.append(f"{loc.get('location_id')}: bilingual location names missing")
    if 'settlement' in loc or not isinstance(loc.get('locality'),str):
        errors.append(f"{loc.get('location_id')}: locality key missing or old settlement key present")
    if not isinstance(loc.get('language_ids'),list):
        errors.append(f"{loc.get('location_id')}: language_ids must be list")
    for lid in loc.get('language_ids',[]):linked(lid,ids['languages'],loc.get('location_id'))
    if loc.get('visibility') == 'confidential':errors.append(f"{loc.get('location_id')}: confidential location in public dataset")
    lat,lon=loc.get('latitude'),loc.get('longitude')
    if (lat is None)!=(lon is None):errors.append(f"{loc.get('location_id')}: incomplete coordinates")
    elif lat is not None and (not all(isinstance(v,(float,int)) and math.isfinite(v) for v in (lat,lon)) or not(-90<=lat<=90 and -180<=lon<=180)):
        errors.append(f"{loc.get('location_id')}: invalid coordinates")
for d in tables['dialects']:
    if not all(isinstance(d.get('name_'+lang),str) and d['name_'+lang].strip() for lang in ('ru','en')):
        errors.append(f"{d.get('dialect_id')}: bilingual dialect names missing")
    linked(d.get('language_id'),ids['languages'],d.get('dialect_id'))
    if not isinstance(d.get('location_ids'),list):errors.append(f"{d.get('dialect_id')}: location_ids must be list")
    for loc in d.get('location_ids',[]):
        linked(loc,ids['locations'],d.get('dialect_id'))
        matching=next((p for p in tables['locations'] if p['location_id']==loc),None)
        if matching and d.get('language_id') not in matching['language_ids']:
            errors.append(f"{d.get('dialect_id')}: {loc} lacks dialect language")
for s in tables['sources']:
    label = s.get('source_id')
    if not s.get('citation_key') or not s.get('year'):
        errors.append(f'{label}: missing short citation metadata')
    if not isinstance(s.get('language_ids'), list) or not s['language_ids']:
        errors.append(f'{label}: missing language_ids')
    for language_id in s.get('language_ids', []):
        linked(language_id, ids['languages'], label)
for lang in tables['languages']:
    if lang['language_id'] == 'sakha' and (lang.get('name_ru') != 'Саха' or lang.get('name_en') != 'Sakha'):
        errors.append('sakha: incorrect display name')
for p in tables['phytonyms']:
    label=p.get('phytonym_id')
    if not p.get('name_native_language', '').strip():
        errors.append(f'{label}: missing phytonym')
    if p.get('language_id')=='sakha' and p.get('name_native_language','') != p.get('name_native_language','').lower():
        errors.append(f'{label}: Sakha phytonym must be lowercase')
    if 'ipa' not in p or (p['ipa'] is not None and not isinstance(p['ipa'], str)):
        errors.append(f'{label}: ipa must be a string or null')
    if not isinstance(p.get('russian_gloss'),str) or not isinstance(p.get('english_gloss'),str) or not p['english_gloss'].strip():
        errors.append(f'{label}: Russian and English glosses must be strings, English gloss must be present')
    if 'common_name_state_language' in p or 'common_names_by_language' in p:
        errors.append(f'{label}: obsolete common-name fields')
    if p.get('language_id')=='chukchi' and p.get('ipa') != p.get('source_lemma'):
        errors.append(f'{label}: Chukchi IPA must preserve source transcription')
    linked(p.get('language_id'),ids['languages'],label)
    linked(p.get('dialect_id'),ids['dialects'],label)
    linked(p.get('taxon_id'),ids['taxa'],label)
    if p.get('dialect_id'):
        d=next((x for x in tables['dialects'] if x['dialect_id']==p['dialect_id']),None)
        if d and d['language_id'] !=p['language_id']:errors.append(f'{label}: dialect language mismatch')
    for key in ('ecological_data','indigenous_knowledge'):
        if not isinstance(p.get(key),dict):errors.append(f'{label}: expected {key} object')
    if 'traditional_knowledge' in p:errors.append(f'{label}: legacy traditional_knowledge key')
    for group,fields in p.get('field_sources',{}).items():
        if group not in ('ecological_data','indigenous_knowledge') or not isinstance(fields,dict):
            errors.append(f'{label}: invalid evidence group {group}')
            continue
        for field,references in fields.items():
            if not p.get(group,{}).get(field):
                errors.append(f'{label}: evidence attached to empty {group}.{field}')
            if not isinstance(references,list) or not references:
                errors.append(f'{label}: no evidence references for {group}.{field}')
                continue
            for ref in references:
                linked(ref.get('source_id'),ids['sources'],f'{label}.{group}.{field}.source_id')
                if not ref.get('source_pages'):
                    errors.append(f'{label}: missing evidence page for {group}.{field}')

    if not isinstance(p.get('attestations'),list):errors.append(f'{label}: attestations must be list')
    for a in p.get('attestations',[]):
        for field,table in [('location_id','locations'),('contributor_id','contributors'),('source_id','sources'),('dialect_id','dialects')]:
            linked(a.get(field),ids[table],f'{label}.{field}')
        for did in a.get('dialect_ids', []):
            linked(did, ids['dialects'], f'{label}.attestation.dialect_ids')
            dialect=next((d for d in tables['dialects'] if d['dialect_id']==did),None)
            if dialect and dialect['language_id'] !=p['language_id']:
                errors.append(f'{label}: attestation dialect language mismatch')
        source=next((s for s in tables['sources'] if s['source_id']==a.get('source_id')),None)
        if source and p.get('language_id') not in source.get('language_ids',[]):
            errors.append(f'{label}: source language mismatch')
    if p.get('language_id')=='evenki' and ('ҥ' in p.get('name_native_language','') or p.get('name_native_language','') != p.get('name_native_language','').lower()):
        errors.append(f'{label}: Evenki script or case mismatch')
    if p.get('language_id')=='even' and ('ң' in p.get('name_native_language','') or any('ң' in (a.get('folklore') or '') for a in p.get('attestations',[]))):
        errors.append(f'{label}: unexpected ң in Even text')
for filename in phy_files:
    key=filename[len('phytonyms/'):-len('.json')]
    if key not in ids['languages']:errors.append(f'{filename}: no matching language')
    for p in read(filename):
        if p.get('language_id') != key:errors.append(f'{filename}: wrong language for {p.get("phytonym_id")}')
for c in tables['contributors']:
    if c.get('consent_status') in ('pending',):errors.append(f"{c['contributor_id']}: pending consent in public dataset")
# Chukchi orthography and reversible source spelling.
for p in tables['phytonyms']:
    if p.get('language_id') == 'chukchi':
        native = p.get('name_native_language', '')
        if any('a' <= c.lower() <= 'z' for c in native) or 'ɬ' in native or 'ŋ' in native or 'ә' in native or 'q' in native:
            errors.append(f"{p.get('phytonym_id')}: non-Cyrillic Chukchi name")
        if not p.get('ipa') or p.get('ipa') != p.get('source_lemma'):
            errors.append(f"{p.get('phytonym_id')}: missing or inconsistent IPA source spelling")
if errors:
    for e in errors: print('ERROR:',e)
    sys.exit(1)
print('PASS:',', '.join(f'{k}={len(v)}' for k,v in tables.items()))

