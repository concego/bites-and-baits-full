#!/usr/bin/env python3
"""Focused persistence QA for the house-decoration inventory category."""
from pathlib import Path
import json
import dukpy

ROOT = Path(__file__).parent
source = "\n".join((ROOT / name).read_text() for name in (
    "fish-data.js", "fish-metrics.js", "home-decoration-data.js", "inventory.js"
))
harness = r'''
var storage = { bb_coins: '37' };
var localStorage = {
  getItem: function (key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
  setItem: function (key, value) { storage[key] = String(value); },
  removeItem: function (key) { delete storage[key]; }
};
(function () {
  var id = 'dani_lambari_drawing';
  var item = getHomeDecorationItem(id);
  var initiallyEmpty = Inventory.getDecorations().length === 0;
  var firstAdd = Inventory.addDecoration(id);
  var duplicateAdd = Inventory.addDecoration(id);
  var savedList = Inventory.getDecorations();
  var invalidItemRejected = !Inventory.addDecoration('unknown_decoration');
  var persisted = JSON.parse(storage.bb_home_decorations || '[]').indexOf(id) >= 0;
  var coinsUnchanged = Inventory.coins() === 37;
  Inventory.reset();
  var resetClearsDecoration = Inventory.getDecorations().length === 0;
  return JSON.stringify({
    itemDefined: !!item && item.id === id,
    initiallyEmpty: initiallyEmpty,
    firstAdd: firstAdd,
    duplicateAddRejected: duplicateAdd === false,
    visibleInInventory: savedList.length === 1 && savedList[0] === id,
    persisted: persisted,
    invalidItemRejected: invalidItemRejected,
    coinsUnchanged: coinsUnchanged,
    resetClearsDecoration: resetClearsDecoration
  });
})()
'''
result = json.loads(dukpy.evaljs(source + "\n" + harness))
failed = [name for name, value in result.items() if value is not True]
if failed:
    raise SystemExit("FAIL: " + ", ".join(failed) + " | " + json.dumps(result))
print("PASS: decoration inventory definition, uniqueness, persistence, invalid-item rejection, coin isolation, and reset.")
