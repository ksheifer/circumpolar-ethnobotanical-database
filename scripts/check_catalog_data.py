#!/usr/bin/env python3
"""Check that every published phytonym file contributes to the user-facing catalog."""
import json
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[1]
base = root / 'data'
read = lambda filename: json.loads((base / filename).read_text(encoding='utf8'))
manifest = read('manifest.json')
languages = {language['language_id'] for language in read('languages.json')}
counts = Counter()
identifiers = set()
for filename in manifest['phytonym_files']:
    items = read(filename)
    if not isinstance(items, list):
        raise AssertionError(f'{filename} is not an array')
    for plant in items:
        name = plant['phytonym_id']
        assert name not in identifiers, f'duplicate ID {name}'
        identifiers.add(name)
        language_id = plant['language_id']
        assert language_id in languages, f'{name}: unknown language {language_id}'
        counts[language_id] += 1

# Regression guards for records established from the Rakin, Kurilova,
# Prokopeva, and Tsypanov publications. Do not remove these without
# deliberately reviewing and documenting a source-data revision.
expected_minimum = {'komi': 110, 'forest-yukaghir': 19, 'tundra-yukaghir': 3, 'tundra-nenets': 73}
for language_id, minimum in expected_minimum.items():
    actual = counts[language_id]
    assert actual >= minimum, f'{language_id}: {actual} records; expected at least {minimum}'

print(f'PASS: {len(identifiers)} phytonyms across {len(languages)} languages')
for language_id in expected_minimum:
    print(f'  {language_id}: {counts[language_id]}')
