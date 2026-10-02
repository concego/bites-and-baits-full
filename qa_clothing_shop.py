"""Focused prototype checks for Marta's clothing shop and wardrobe."""
from pathlib import Path
import json
import dukpy

root = Path(__file__).parent
js = r'''
var __store = {};
var localStorage = {
  getItem: function(k) { return Object.prototype.hasOwnProperty.call(__store, k) ? __store[k] : null; },
  setItem: function(k, v) { __store[k] = String(v); },
  removeItem: function(k) { delete __store[k]; }
};
var Character = { load: function() { return JSON.parse(localStorage.getItem('bb_character') || '{}'); } };
var __coins = 100;
var Inventory = {
  coins: function() { return __coins; },
  spendCoins: function(n) { if (__coins < n) return false; __coins -= n; return true; }
};
localStorage.setItem('bb_character', JSON.stringify({
  name:'QA', confirmed:true,
  appearance:{arrivalOutfit:'neutral-arrivalOutfit-2', fishingOutfit:'neutral-fishingOutfit-4'}
}));
'''
for name in ('clothing-catalog.js', 'clothing-stock.js', 'wardrobe.js', 'character-avatar.js'):
    js += (root / name).read_text() + '\n'
js += r'''
function check(condition, message) { if (!condition) throw new Error(message); }
var ids = {};
CLOTHING_CATALOG.forEach(function(item) {
  check(item.id && !ids[item.id], 'unique product id'); ids[item.id] = true;
  check(item.styleId && CLOTHING_STYLES[item.styleId], 'known garment style '+item.id);
  check(['top','bottom','outerwear','headwear','gloves'].indexOf(item.slot) >= 0, 'valid slot '+item.id);
  check(item.price >= 8 && item.price <= 22, 'provisional prototype price range '+item.id);
  check(['pt','en','hu'].every(function(lang) { return item.name[lang] && item.description[lang] && item.colorName[lang]; }), 'localized item and color '+item.id);
  check(item.modes.length > 0 && item.modes.every(function(mode) { return mode === 'arrival' || mode === 'fishing'; }), 'valid modes '+item.id);
  check(!/conjunto|character-creator|creator outfit|creator's outfit|összeállítás/i.test(item.description.pt+' '+item.description.en+' '+item.description.hu), 'customer description has no creator-set reference '+item.id);
});
['arrival','fishing'].forEach(function(mode) {
  for (var setNo=1; setNo<=5; setNo++) {
    var pieces = CLOTHING_STARTER_SETS[mode][setNo];
    check(pieces && Object.keys(pieces).length > 0, 'starter mapping '+mode+setNo);
    Object.keys(pieces).forEach(function(slot) {
      var item = getClothingItem(pieces[slot]);
      check(item && item.slot === slot && item.modes.indexOf(mode) >= 0, 'starter piece exists in correct slot/mode '+mode+setNo+'/'+slot);
    });
  }
});
check(CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('arrival')>=0;}).length >= 9, 'everyday mode filtering');
check(CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('fishing')>=0;}).length >= 14, 'fishing mode filtering');
var dayOneArrival = ClothingStock.getAvailableItems('arrival', {year:1, month:3, day:1});
var dayTwoArrival = ClothingStock.getAvailableItems('arrival', {year:1, month:3, day:2});
check(dayOneArrival.length < CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('arrival')>=0;}).length, 'daily rotation filters the catalog');
check(dayOneArrival.map(function(item){return item.styleId;}).sort().join('|') === dayTwoArrival.map(function(item){return item.styleId;}).sort().join('|'), 'rotation keeps garment models');
var dayOneStyleIds = dayOneArrival.map(function(item){return item.styleId;});
check(new Set(dayOneStyleIds).size === dayOneStyleIds.length, 'one color per model each day');
var teeDayOne = dayOneArrival.filter(function(item){return item.styleId === 'basic_tshirt';})[0];
var teeDayTwo = dayTwoArrival.filter(function(item){return item.styleId === 'basic_tshirt';})[0];
check(teeDayOne && teeDayTwo && teeDayOne.id !== teeDayTwo.id, 'basic T-shirt color rotates by in-game day');
var teeVariants = CLOTHING_CATALOG.filter(function(item){return item.styleId === 'basic_tshirt';});
check(teeVariants.length >= 3 && teeVariants.every(function(item){return item.name.pt === teeVariants[0].name.pt && item.description.pt === teeVariants[0].description.pt;}), 'same garment name and description across color variants');
var before = Inventory.coins();
var starter = Wardrobe.state();
check(Inventory.coins() === before, 'starting clothes are free');
check(starter.equipped.arrival.top === 'top_dark_casual' && starter.equipped.arrival.bottom === 'bottom_simple', 'arrival starter outfit equip');
check(starter.equipped.fishing.top === 'top_waterproof' && starter.equipped.fishing.bottom === 'bottom_waterproof' && starter.equipped.fishing.outerwear === 'rain_cape', 'fishing starter outfit equip');
check(Wardrobe.owns('top_dark_casual') && Wardrobe.owns('rain_cape'), 'selected starting pieces are owned');
var buy = Wardrobe.buy('jacket_light');
check(buy.ok && Inventory.coins() === 80 && Wardrobe.owns('jacket_light'), 'successful purchase deducts price once');
var duplicate = Wardrobe.buy('jacket_light');
check(!duplicate.ok && duplicate.reason === 'owned' && Inventory.coins() === 80, 'owned clothing is not charged twice');
check(Wardrobe.equip('jacket_light','arrival'), 'owned clothing equips in valid mode');
check(Wardrobe.getEquipped('arrival').outerwear.id === 'jacket_light', 'arrival equip state');
check(Wardrobe.getEquipped('fishing').outerwear.id === 'rain_cape', 'outfit modes retain separate equipment');
var avatarPlayer = {innerHTML:''};
CharacterAvatar.render(avatarPlayer, Character.load(), {outfit:'arrival', isPlayer:true});
check(avatarPlayer.innerHTML.indexOf('#59647d') >= 0, 'equipped outerwear changes confirmed player avatar');
var avatarNpc = {innerHTML:''};
CharacterAvatar.render(avatarNpc, {confirmed:false, genderProfile:'neutral', appearance:Character.load().appearance}, {outfit:'arrival'});
check(avatarNpc.innerHTML.indexOf('#59647d') < 0, 'wardrobe never changes an NPC avatar');
check(!Wardrobe.equip('jacket_light','fishing'), 'item cannot equip in an unsupported mode');
__coins = 5;
var poor = Wardrobe.buy('vest_reinforced');
check(!poor.ok && poor.reason === 'coins' && Inventory.coins() === 5 && !Wardrobe.owns('vest_reinforced'), 'unaffordable purchase has no side effects');
var persisted = Wardrobe.state();
check(persisted.owned.indexOf('jacket_light') >= 0 && persisted.equipped.arrival.outerwear === 'jacket_light', 'ownership and equip persist');
JSON.stringify({items:CLOTHING_CATALOG.length, arrivalProducts:CLOTHING_CATALOG.filter(function(i){return i.modes.includes('arrival');}).length, fishingProducts:CLOTHING_CATALOG.filter(function(i){return i.modes.includes('fishing');}).length, dailyArrivalModels:dayOneArrival.length, dailyColorRotation:true, starterSets:10, freeStarter:true, purchaseDeducted:20, duplicateNotCharged:true, insufficientProtected:true, persistence:true, equippedChangesPlayerAvatar:true, npcUnaffected:true});
'''
result = json.loads(dukpy.evaljs(js))
# Verify the page exposes the route, accessible controls, live feedback, and no quest wiring.
html = (root / 'index.html').read_text()
game = (root / 'game.js').read_text()
for token in ('btn-hub-clothing-shop', 'screen-clothing-shop', 'clothing-mode', 'clothing-shop-feedback', 'clothing-shop-rotation-note', 'btn-clothing-shop-people', 'clothing-stock.js'): 
    assert token in html, f'missing shop UI hook: {token}'
for token in ("_openPeoplePanel('clothing_shop'", "id: 'marta'", "Wardrobe.buy(id)", "Wardrobe.equip(id, clothingShopMode)"):
    assert token in game, f'missing game integration: {token}'
assert "id: 'dani'" not in game, 'Dani quest/person should remain unimplemented'
i18n = (root / 'i18n.js').read_text() + r'''
var required = ['btn_clothing_shop_marta','clothing_shop_title','clothing_shop_mode_label','clothing_shop_everyday','clothing_shop_fishing','clothing_shop_provisional_prices','clothing_shop_balance_label','people_location_clothing_shop','people_marta_name','people_marta_desc','people_marta_generic_01','people_marta_generic_02'];
['pt','en','hu'].forEach(function(lang) { I18n.setLang(lang); required.forEach(function(key) { if (I18n.t(key) === key) throw new Error('missing '+lang+' translation: '+key); }); });
JSON.stringify({locales:['pt','en','hu'],keys:required.length});
'''
translations = json.loads(dukpy.evaljs("var localStorage={getItem:function(){return null},setItem:function(){}}; var document={documentElement:{}};\n" + i18n))
print('PASS: focused clothing shop QA:', result, '| translations:', translations)
