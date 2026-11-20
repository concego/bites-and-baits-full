#!/usr/bin/env python3
"""Execute os validadores reais de ContentData com casos positivos e negativos."""
from pathlib import Path
import json
import dukpy

ROOT = Path(__file__).parent
loader = (ROOT / 'content-data.js').read_text(encoding='utf-8')
manifest = json.loads((ROOT / 'content/manifest.json').read_text(encoding='utf-8'))
index = json.loads((ROOT / 'content/npcs/index.json').read_text(encoding='utf-8'))
npc = json.loads((ROOT / 'content/npcs/vitor.json').read_text(encoding='utf-8'))
harness = r'''
var checks=0;
function check(ok,msg){if(!ok)throw new Error(msg);checks++;}
function rejects(fn,needle,msg){var thrown='';try{fn();}catch(e){thrown=String(e.message||e);}check(thrown.indexOf(needle)>=0,msg+': '+thrown);}
'''
# Values are passed as JSON literals so the executed tests use the real bundled JSON.
harness += 'var manifest='+json.dumps(manifest,ensure_ascii=False)+';\n'
harness += 'var index='+json.dumps(index,ensure_ascii=False)+';\n'
harness += 'var npc='+json.dumps(npc,ensure_ascii=False)+';\n'
harness += r'''
check(ContentData.validation.manifest(manifest).domains.npcs==='npcs/index.json','valid manifest');
check(ContentData.validation.npcIndex(index).records.length===1,'valid NPC index');
check(ContentData.validation.npc(npc,'vitor','content/npcs/vitor.json').name==='Vitor','valid NPC');
rejects(function(){ContentData.validation.manifest({schemaVersion:2,domains:{npcs:'npcs/index.json'}});},'schemaVersion','wrong manifest version rejected');
rejects(function(){ContentData.validation.manifest({schemaVersion:1,domains:{npcs:'../evil.json'}});},'caminho','path traversal rejected');
rejects(function(){ContentData.validation.npcIndex({schemaVersion:1,domain:'npcs',records:[{id:'vitor',path:'vitor.json'},{id:'vitor',path:'other.json'}]});},'duplicado','duplicate id rejected');
rejects(function(){ContentData.validation.npcIndex({schemaVersion:1,domain:'npcs',records:[{id:'bad id',path:'vitor.json'}]});},'ID inválido','malformed id rejected');
rejects(function(){ContentData.validation.npc(Object.assign({},npc,{id:'zeca'}),'vitor','vitor.json');},'não corresponde','record/index id mismatch rejected');
var incomplete=JSON.parse(JSON.stringify(npc)); delete incomplete.appearance.hairColor;
rejects(function(){ContentData.validation.npc(incomplete,'vitor','vitor.json');},'hairColor','missing required appearance field rejected');
JSON.stringify({checks:checks});
'''
shim="var document={baseURI:'https://example.test/bites-and-baits/'}; function URL(path,base){this.href=/^https?:/.test(path)?path:String(base).replace(/\\/?$/,'/')+path;}\n"
result=json.loads(dukpy.evaljs(shim+loader+'\n'+harness))
print('PASS: runtime ContentData validators: %d assertions (valid manifest/index/NPC; wrong version, traversal, duplicate/malformed/mismatched IDs, and incomplete appearance).' % result['checks'])
