#!/usr/bin/env python3
"""Behavior-preservation QA for the extracted fish-direction HUD renderer."""
from pathlib import Path
import json
import dukpy

ROOT = Path(__file__).parent
source = (ROOT / "fishing-hud-view.js").read_text()
harness = r'''
function makeClassList() {
  var values = {};
  return {
    add: function (name) { values[name] = true; },
    remove: function () { for (var i = 0; i < arguments.length; i++) delete values[arguments[i]]; },
    toggle: function (name, force) { if (force) values[name] = true; else delete values[name]; },
    has: function (name) { return !!values[name]; }
  };
}
function element() { return { classList: makeClassList(), textContent: '' }; }
var indicator = element(), label = element(), announcer = element(), arrow = element();
function translate(key) { return 'translated:' + key; }
var checks = 0;
function check(condition, message) { if (!condition) throw new Error(message); checks++; }
var a = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: arrow,
  phase: 'approaching', side: 'left', previousPhase: null, previousSide: null, translate: translate
});
check(a.phase === 'approaching' && a.side === 'left', 'approach state returned');
check(!indicator.classList.has('hidden') && indicator.classList.has('from-left') && !indicator.classList.has('from-right'), 'approach classes');
check(arrow.textContent === '→', 'left approach points inward');
check(label.textContent === 'translated:fish_direction_approaching' && announcer.textContent === label.textContent, 'approach text and announcement');
var priorAnnouncement = announcer.textContent;
var b = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: arrow,
  phase: 'approaching', side: 'right', previousPhase: a.phase, previousSide: a.side, translate: translate
});
check(b.phase === 'approaching' && b.side === 'right', 'same phase side update returned');
check(arrow.textContent === '←', 'right approach points inward');
check(announcer.textContent === priorAnnouncement, 'side-only change does not repeat announcement');
var c = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: arrow,
  phase: 'retreating', side: 'right', previousPhase: b.phase, previousSide: b.side, translate: translate
});
check(c.phase === 'retreating' && c.side === 'right', 'retreat state returned');
check(indicator.classList.has('is-retreating') && indicator.classList.has('from-right'), 'retreat classes');
check(arrow.textContent === '→', 'right retreat points outward');
check(announcer.textContent === 'translated:fish_direction_retreating', 'phase change announced');
var d = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: arrow,
  phase: null, side: null, previousPhase: c.phase, previousSide: c.side, translate: translate
});
check(d.phase === null && d.side === null, 'reset state returned');
check(indicator.classList.has('hidden') && !indicator.classList.has('from-left') && !indicator.classList.has('from-right') && !indicator.classList.has('is-retreating'), 'reset classes');
check(announcer.textContent === '', 'reset clears announcement');
var e = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: arrow,
  phase: 'approaching', side: 'unexpected', previousPhase: null, previousSide: null, translate: translate
});
check(e.side === 'right' && arrow.textContent === '←', 'unknown side defaults to right');
var untouched = FishingHudView.setFishDirection({
  indicator: null, label: label, announcer: announcer, arrow: arrow,
  phase: null, side: null, previousPhase: 'retreating', previousSide: 'left', translate: translate
});
check(untouched.phase === 'retreating' && untouched.side === 'left', 'missing indicator preserves previous state');
var noArrow = FishingHudView.setFishDirection({
  indicator: indicator, label: label, announcer: announcer, arrow: null,
  phase: 'approaching', side: 'left', previousPhase: 'approaching', previousSide: 'right', translate: translate
});
check(noArrow.side === 'right', 'missing arrow preserves previous side cache');
JSON.stringify({ checks: checks });
'''
result = json.loads(dukpy.evaljs(source + "\n" + harness))
print(f"PASS: fish direction HUD renderer: {result['checks']} assertions.")
