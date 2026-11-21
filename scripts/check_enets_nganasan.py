import json,pathlib
r=pathlib.Path(__file__).resolve().parents[1]/'data'
manifest=json.loads((r/'manifest.json').read_text())
langs={x['language_id'] for x in json.loads((r/'languages.json').read_text())}
sources={x['source_id'] for x in json.loads((r/'sources.json').read_text())}
for lang in ('enets','nganasan'):
 assert lang in langs
 assert 'phytonyms/'+lang+'.json' in manifest['phytonym_files']
 rows=json.loads((r/'phytonyms'/f'{lang}.json').read_text())
 assert rows,lang
 for x in rows:
  assert x['language_id']==lang and x['attestations']
  assert all(z['source_id'] in sources and z['source_pages'] for z in x['attestations'])
print('OK: Enets/Nganasan sources and phytonyms loaded')
