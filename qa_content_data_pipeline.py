#!/usr/bin/env python3
"""Fatia 1 do pipeline de conteúdo: manifest -> índice de NPCs -> JSON do Vitor."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
manifest_path = ROOT / 'content/manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
assert manifest.get('schemaVersion') == 1
assert manifest.get('domains', {}).get('npcs') == 'npcs/index.json'

index_path = ROOT / 'content' / manifest['domains']['npcs']
index = json.loads(index_path.read_text(encoding='utf-8'))
assert index.get('schemaVersion') == 1 and index.get('domain') == 'npcs'
records = index.get('records')
assert isinstance(records, list) and records
ids = set()
loaded = {}
for record in records:
    assert re.fullmatch(r'[a-z][a-z0-9_-]*', record['id'])
    assert record['id'] not in ids, f"duplicate NPC id: {record['id']}"
    ids.add(record['id'])
    assert not record['path'].startswith('/') and '..' not in Path(record['path']).parts
    npc_path = index_path.parent / record['path']
    assert npc_path.is_file(), f'missing NPC record: {npc_path}'
    npc = json.loads(npc_path.read_text(encoding='utf-8'))
    assert npc.get('id') == record['id'], f"record id mismatch for {record['id']}"
    assert isinstance(npc.get('name'), str) and npc['name'].strip()
    assert npc.get('genderProfile') in {'feminine', 'masculine', 'neutral'}
    appearance = npc.get('appearance')
    required = {'skinTone','bodyShape','height','faceShape','eyeDetails','eyeColor','hairStyle','hairColor','headCovering','facialHair','arrivalOutfit','fishingOutfit','footwear','accessories'}
    assert isinstance(appearance, dict) and required <= appearance.keys()
    assert all(isinstance(appearance[k], str) and appearance[k] for k in required)
    loaded[npc['id']] = npc

# Preset is byte-for-byte equivalent in field values to the removed JS source.
vitor = loaded['vitor']
assert vitor == {
    'id':'vitor','name':'Vitor','genderProfile':'masculine',
    'appearance':{
        'skinTone':'masculine-skinTone-3','bodyShape':'masculine-bodyShape-3','height':'masculine-height-3',
        'faceShape':'masculine-faceShape-1','eyeDetails':'masculine-eyeDetails-3','eyeColor':'masculine-eyeColor-1',
        'hairStyle':'masculine-hairStyle-2','hairColor':'masculine-hairColor-2','headCovering':'masculine-headCovering-2',
        'facialHair':'masculine-facialHair-3','arrivalOutfit':'masculine-arrivalOutfit-5',
        'fishingOutfit':'masculine-fishingOutfit-5','footwear':'masculine-footwear-5','accessories':'masculine-accessories-3'
    }
}

# Structural checks for runtime ordering, atomic publication and diagnosed errors.
loader = (ROOT / 'content-data.js').read_text(encoding='utf-8')
html = (ROOT / 'index.html').read_text(encoding='utf-8')
game = (ROOT / 'game.js').read_text(encoding='utf-8')
i18n = (ROOT / 'i18n.js').read_text(encoding='utf-8')
assert 'ContentData.load().then' in game and ".catch(_showContentLoadError)" in game
assert html.index('content-data.js') < html.index('game.js?v=json-content-vitor-01')
assert 'npc-data.js' not in html
assert "ContentData.getNpc('vitor')" in game
assert 'npcs = Object.freeze(loaded)' in loader
assert "response.ok" in loader and 'await response.text()' in loader and 'JSON.parse(text)' in loader
assert 'ID duplicado' in loader and 'ID não corresponde ao índice' in loader
assert all(k in i18n for k in ('content_load_failed_title','content_load_failed_message','content_load_retry'))
assert not (ROOT / 'npc-data.js').exists(), 'legacy duplicate preset must not remain'
print(f'PASS: content JSON pipeline, Vitor preset equivalence, reference/schema validation, bootstrap/error handling; {len(records)} NPC record(s).')
