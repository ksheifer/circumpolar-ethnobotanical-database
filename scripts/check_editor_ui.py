"""Static regression check for editor controls and obsolete UI fragments."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'admin/index.html').read_text()
js=(root/'admin/editor.js').read_text()
app=(root/'app.js').read_text()
for obsolete in ('Reload from GitHub','id="reload"','id="profile-subheading"','One commit per profile'):
    assert obsolete not in html, f"obsolete editor markup: {obsolete}"
for obsolete in ("getElementById('reload')", "getElementById('profile-subheading')"):
    assert obsolete not in js, f"obsolete editor handler: {obsolete}"
assert 'id="profile-heading"' in html and "getElementById('profile-heading')" in js
assert 'Save changes' in html and 'Saving…' in js
assert "data/id-aliases.json" in app, 'Legacy public URLs must still redirect'
print('PASS: editor has no reload button, no language-ID subtitle, no orphan handlers; old links remain compatible')
