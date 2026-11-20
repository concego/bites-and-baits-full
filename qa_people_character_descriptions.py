#!/usr/bin/env python3
"""Focused structural QA for optional descriptions in People Present."""
import re
from pathlib import Path

ROOT = Path(__file__).parent
game = (ROOT / 'game.js').read_text(encoding='utf-8')
html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'style.css').read_text(encoding='utf-8')
i18n = (ROOT / 'i18n.js').read_text(encoding='utf-8')

# Actions exist in the present-people menu and for both participants in dialogue.
for element in ['btn-people-player-description', 'btn-people-dialogue-player-description',
                'btn-people-dialogue-npc-description', 'btn-people-description-close',
                'people-description-title', 'people-description-text']:
    assert f'id="{element}"' in html, f'missing UI element: {element}'
assert 'people_describe_person' in game and 'people_describe_player' in html
assert "personId === 'vitor'" in game and "ContentData.getNpc('vitor')" in game
assert "const isPlayer = personId === 'player'" in game

# No-visual NPCs receive localized fallback; generated descriptions are derived from current catalog values.
assert "people_description_not_implemented" in game
assert 'category?.options.find(item => item.value === appearance[field])' in game
for category in ['skinTone', 'height', 'bodyShape', 'faceShape', 'eyeDetails', 'eyeColor',
                 'hairStyle', 'hairColor', 'headCovering', 'facialHair', 'arrivalOutfit',
                 'footwear', 'accessories']:
    assert f"'{category}'" in game, f'missing appearance category: {category}'
assert "Wardrobe.getEquipped('arrival')" in game
assert 'item.description?.[lang]' in game and 'item.colorName?.[lang]' in game

# Closing restores the previous surface and trigger focus without advancing the dialogue.
assert 'peopleDescriptionReturnView' in game and 'peopleDescriptionReturnFocus' in game
assert 'target?.focus?.()' in game
close_body = game[game.index('function _closePeopleDescription'):game.index('function _renderPeopleConversation')]
assert '_advancePeopleConversation' not in close_body and 'peopleDialogueIndex =' not in close_body
assert 'requestAnimationFrame(() => ui.peopleDescriptionText?.focus())' in game
assert 'id="people-description-text" class="people-description-text" tabindex="-1"' in html
assert 'people-description-text { white-space: pre-line;' in css
assert 'role="region" aria-labelledby="people-description-title"' in html

# All required copy is present in each supported locale.
for key in ['people_describe_player', 'people_describe_person', 'people_description_title',
            'people_description_not_implemented', 'people_description_close']:
    assert len(re.findall(rf'\b{key}\s*:', i18n)) == 3, f'{key} must exist in pt/en/hu'
assert 'A descrição de ${name} ainda não foi implementada.' in i18n
assert 'A description of ${name} has not been implemented yet.' in i18n
assert '${name} leírása még nincs megvalósítva.' in i18n
print('PASS: People Present character descriptions: menu/dialogue actions, current data, fallback, localization, and return/focus behavior.')
