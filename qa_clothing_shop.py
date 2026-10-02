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
  spendCoins: function(n) { if (__coins < n) return false; __coins -= n; return true; },
  addCoins: function(n) { __coins += n; return __coins; },
  getClothing: function() { return JSON.parse(localStorage.getItem('bb_clothing_inventory') || '[]').slice().reverse(); },
  hasClothing: function(id) { return JSON.parse(localStorage.getItem('bb_clothing_inventory') || '[]').indexOf(id) >= 0; },
  addClothing: function(id) {
    var owned = JSON.parse(localStorage.getItem('bb_clothing_inventory') || '[]');
    if (owned.indexOf(id) >= 0) return false;
    owned.push(id); localStorage.setItem('bb_clothing_inventory', JSON.stringify(owned)); return true;
  },
  removeClothing: function(id) {
    var owned = JSON.parse(localStorage.getItem('bb_clothing_inventory') || '[]');
    var filtered = owned.filter(function(x){return x!==id;});
    if (filtered.length === owned.length) return false;
    localStorage.setItem('bb_clothing_inventory', JSON.stringify(filtered)); return true;
  }
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
  if (item.giftOnly) check(item.id === 'top_marta_courtesy' && item.price === 0, 'Marta courtesy shirt is free and gift-only');
  else check(item.price >= 8 && item.price <= 22, 'provisional prototype price range '+item.id);
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
check(CLOTHING_CATALOG.filter(function(item){return !item.giftOnly;}).length === 38, '38 purchasable variants remain in the shop');
check(CLOTHING_CATALOG.length === 39, 'the courtesy shirt is an additional gift-only inventory item');
check(new Set(CLOTHING_CATALOG.map(function(item){return item.styleId;})).size === 16, 'catalog still represents 16 garment models');
check(CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('arrival')>=0;}).length >= 9, 'everyday mode filtering');
check(CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('fishing')>=0;}).length >= 14, 'fishing mode filtering');
var dayOneArrival = ClothingStock.getAvailableItems('arrival', {year:1, month:3, day:1});
var dayTwoArrival = ClothingStock.getAvailableItems('arrival', {year:1, month:3, day:2});
var dayOneFishing = ClothingStock.getAvailableItems('fishing', {year:1, month:3, day:1});
var dayTwoFishing = ClothingStock.getAvailableItems('fishing', {year:1, month:3, day:2});
check(!dayOneArrival.some(function(item){return item.giftOnly;}), 'gift-only shirt is not offered in store rotation');
check(dayOneArrival.length < CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('arrival')>=0 && !item.giftOnly;}).length, 'daily rotation filters the catalog');
check(dayOneArrival.map(function(item){return item.styleId;}).sort().join('|') === dayTwoArrival.map(function(item){return item.styleId;}).sort().join('|'), 'rotation keeps garment models');
var dayOneStyleIds = dayOneArrival.map(function(item){return item.styleId;});
check(new Set(dayOneStyleIds).size === dayOneStyleIds.length, 'one color per model each day');
var teeDayOne = dayOneArrival.filter(function(item){return item.styleId === 'basic_tshirt';})[0];
var teeDayTwo = dayTwoArrival.filter(function(item){return item.styleId === 'basic_tshirt';})[0];
check(teeDayOne && teeDayTwo && teeDayOne.id !== teeDayTwo.id, 'basic T-shirt color rotates by in-game day');
check(dayOneFishing.length < CLOTHING_CATALOG.filter(function(item){return item.modes.indexOf('fishing')>=0;}).length, 'fishing stock rotates too');
check(dayOneFishing.map(function(item){return item.styleId;}).sort().join('|') === dayTwoFishing.map(function(item){return item.styleId;}).sort().join('|'), 'fishing rotation keeps garment models');
check(new Set(dayOneFishing.map(function(item){return item.styleId;})).size === dayOneFishing.length, 'one fishing color variant per model each day');
var teeVariants = CLOTHING_CATALOG.filter(function(item){return item.styleId === 'basic_tshirt';});
check(teeVariants.length >= 3 && teeVariants.every(function(item){return item.name.pt === teeVariants[0].name.pt && item.description.pt === teeVariants[0].description.pt;}), 'same garment name and description across color variants');
var before = Inventory.coins();
var starter = Wardrobe.state();
check(Inventory.coins() === before, 'starting clothes are free');
check(starter.equipped.arrival.top === 'top_dark_casual' && starter.equipped.arrival.bottom === 'bottom_simple', 'arrival starter outfit equip');
check(starter.equipped.fishing.top === 'top_waterproof' && starter.equipped.fishing.bottom === 'bottom_waterproof' && starter.equipped.fishing.outerwear === 'rain_cape', 'fishing starter outfit equip');
check(Wardrobe.owns('top_dark_casual') && Wardrobe.owns('rain_cape'), 'selected starting pieces are owned');
check(Inventory.hasClothing('top_dark_casual') && Inventory.hasClothing('rain_cape'), 'starter clothes are stored in player inventory');
var buy = Wardrobe.buy('jacket_light');
check(buy.ok && Inventory.coins() === 80 && Inventory.hasClothing('jacket_light'), 'successful purchase enters inventory and deducts price once');
var duplicate = Wardrobe.buy('jacket_light');
check(!duplicate.ok && duplicate.reason === 'owned' && Inventory.coins() === 80, 'owned clothing is not charged twice');
check(Wardrobe.equip('jacket_light','arrival'), 'owned clothing equips in valid mode');
check(Wardrobe.getEquipped('arrival').outerwear.id === 'jacket_light', 'arrival equip state');
check(Wardrobe.getEquipped('fishing').outerwear.id === 'rain_cape', 'outfit modes retain separate equipment');
var fishingBuy = Wardrobe.buy('vest_reinforced');
check(fishingBuy.ok && Inventory.coins() === 58 && Inventory.hasClothing('vest_reinforced'), 'fishing clothing purchase is added and charged once');
check(Wardrobe.equip('vest_reinforced','fishing'), 'owned clothing equips for fishing');
check(Wardrobe.getEquipped('fishing').outerwear.id === 'vest_reinforced' && Wardrobe.getEquipped('arrival').outerwear.id === 'jacket_light', 'equipping for fishing preserves everyday outfit');
check(Inventory.getClothing().indexOf('vest_reinforced') >= 0, 'bought clothing remains in inventory storage');
var avatarPlayer = {innerHTML:''};
CharacterAvatar.render(avatarPlayer, Character.load(), {outfit:'arrival', isPlayer:true});
check(avatarPlayer.innerHTML.indexOf('#59647d') >= 0, 'equipped outerwear changes confirmed player avatar');
var avatarNpc = {innerHTML:''};
CharacterAvatar.render(avatarNpc, {confirmed:false, genderProfile:'neutral', appearance:Character.load().appearance}, {outfit:'arrival'});
check(avatarNpc.innerHTML.indexOf('#59647d') < 0, 'wardrobe never changes an NPC avatar');
check(!Wardrobe.equip('jacket_light','fishing'), 'item cannot equip in an unsupported mode');
__coins = 5;
var poor = Wardrobe.buy('jacket_light_olive');
check(!poor.ok && poor.reason === 'coins' && Inventory.coins() === 5 && !Wardrobe.owns('jacket_light_olive'), 'unaffordable purchase has no side effects');
var persisted = Wardrobe.state();
check(Inventory.hasClothing('jacket_light') && persisted.equipped.arrival.outerwear === 'jacket_light', 'inventory ownership and equip state persist');
localStorage.setItem('bb_wardrobe_v1', JSON.stringify({
  owned:['top_dark_casual','jacket_light'],
  equipped:{arrival:{top:'top_dark_casual'}, fishing:{outerwear:'rain_cape'}},
  starterSynced:true
}));
localStorage.removeItem('bb_clothing_equipment_v1');
localStorage.removeItem('bb_clothing_inventory');
var migrated = Wardrobe.state();
check(migrated.legacyMigrated && Inventory.hasClothing('top_dark_casual') && Inventory.hasClothing('jacket_light'), 'legacy owned pieces migrate to player inventory');
check(migrated.equipped.arrival.top === 'top_dark_casual' && migrated.equipped.fishing.outerwear === 'rain_cape', 'legacy outfits migrate by context');
Wardrobe.syncStarterPieces();
check(Inventory.getClothing().length === 3, 'legacy migration is idempotent and imports equipped pieces missing from owned list');
JSON.stringify({items:CLOTHING_CATALOG.length, garmentModels:16, arrivalProducts:CLOTHING_CATALOG.filter(function(i){return i.modes.includes('arrival');}).length, fishingProducts:CLOTHING_CATALOG.filter(function(i){return i.modes.includes('fishing');}).length, dailyArrivalModels:dayOneArrival.length, dailyFishingModels:dayOneFishing.length, dailyColorRotation:true, starterSets:10, freeStarter:true, purchaseDeducted:20, duplicateNotCharged:true, insufficientProtected:true, persistence:true, legacyMigration:true, equipBothContexts:true, equippedChangesPlayerAvatar:true, npcUnaffected:true});
'''
result = json.loads(dukpy.evaljs(js))
# Verify the page exposes the route, accessible controls, live feedback, and the quest's shop prerequisite.
html = (root / 'index.html').read_text()
game = (root / 'game.js').read_text()
for token in ('btn-hub-clothing-shop', 'screen-clothing-shop', 'clothing-mode', 'clothing-shop-feedback', 'clothing-shop-rotation-note', 'btn-clothing-shop-people', 'clothing-stock.js', 'inv-tab-clothing', 'inv-clothing-mode', 'inv-clothing-list'):
    assert token in html, f'missing shop/inventory UI hook: {token}'
for token in ("_openPeoplePanel('clothing_shop'", "id: 'marta'", "Wardrobe.buy(id)", "InventoryClothingView.render", "Wardrobe.equip(id, mode)"):
    assert token in game or token in (root / 'wardrobe.js').read_text(), f'missing game integration: {token}'
shop_view = (root / 'clothing-shop-view.js').read_text()
assert 'onEquip' not in shop_view, 'clothes should not be equipped directly from the shop'
assert '<label for="inv-clothing-mode" data-i18n="inv_clothing_mode_label"></label>' in html, 'inventory clothing context selector needs an associated localized label'
assert 'aria-live="assertive"' in html and 'id="inv-feedback"' in html, 'inventory equip feedback must be announced'
player_text = (root / 'i18n.js').read_text() + shop_view + game
for secret in ('Mãe de Dani', "Dani's mother", 'Dani is Marta', 'Dani az anyja'):
    assert secret not in player_text, f'Marta/Dani relationship must stay hidden before the quest: {secret}'
assert "id: 'dani'" in game and 'DaniQuest.canMeet()' in game, 'Dani appears only behind the quest prerequisite gate'
assert 'typeof ClothingShopView !== \'undefined\'' in (root / 'dani-quest.js').read_text(), 'Dani availability requires the clothing shop feature'
i18n = (root / 'i18n.js').read_text() + r'''
var required = ['btn_clothing_shop_marta','clothing_shop_title','clothing_shop_mode_label','clothing_shop_everyday','clothing_shop_fishing','clothing_shop_provisional_prices','clothing_shop_balance_label','people_location_clothing_shop','people_marta_name','people_marta_desc','people_marta_generic_01','people_marta_generic_02','inv_tab_clothing','inv_empty_clothing','inv_clothing_mode_label','inv_clothing_equip_arrival','inv_clothing_equip_fishing','inv_clothing_equipped','inv_clothing_success','inv_clothing_slot_top','inv_clothing_slot_bottom','inv_clothing_slot_outerwear','inv_clothing_slot_headwear','inv_clothing_slot_gloves','inv_equip_btn'];
['pt','en','hu'].forEach(function(lang) { I18n.setLang(lang); required.forEach(function(key) { if (I18n.t(key) === key) throw new Error('missing '+lang+' translation: '+key); }); });
JSON.stringify({locales:['pt','en','hu'],keys:required.length});
'''
translations = json.loads(dukpy.evaljs("var localStorage={getItem:function(){return null},setItem:function(){}}; var document={documentElement:{}};\n" + i18n))
actual_inventory_js = r'''
var __store = {};
var localStorage = {
  getItem:function(k){return Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null;},
  setItem:function(k,v){__store[k]=String(v);},
  removeItem:function(k){delete __store[k];}
};
var Character = {load:function(){return JSON.parse(localStorage.getItem('bb_character')||'{}');}};
localStorage.setItem('bb_character', JSON.stringify({confirmed:true,appearance:{arrivalOutfit:'neutral-arrivalOutfit-2',fishingOutfit:'neutral-fishingOutfit-4'}}));
localStorage.setItem('bb_wardrobe_v1', JSON.stringify({
  owned:['top_dark_casual','bottom_simple','top_waterproof','bottom_waterproof','rain_cape'],
  equipped:{arrival:{top:'top_dark_casual',bottom:'bottom_simple'},fishing:{top:'top_waterproof',bottom:'bottom_waterproof',outerwear:'rain_cape'}},
  starterSynced:true
}));
'''
for name in ('clothing-catalog.js', 'inventory.js', 'wardrobe.js'):
    actual_inventory_js += (root / name).read_text() + '\n'
actual_inventory_js += r'''
function check(condition,message){if(!condition)throw new Error(message);}
Inventory.addCoins(100);
Wardrobe.syncStarterPieces();
check(Inventory.hasClothing('top_dark_casual')&&Inventory.hasClothing('rain_cape'),'real Inventory stores migrated starter clothes');
check(Wardrobe.getEquipped('arrival').top.id==='top_dark_casual'&&Wardrobe.getEquipped('fishing').outerwear.id==='rain_cape','real equipment state migrates in both modes');
var purchase=Wardrobe.buy('jacket_light');
check(purchase.ok&&Inventory.coins()===80&&Inventory.hasClothing('jacket_light'),'real inventory saves shop purchase and charges once');
var duplicate=Wardrobe.buy('jacket_light');
check(!duplicate.ok&&Inventory.coins()===80,'real inventory blocks duplicate charge');
check(Wardrobe.equip('jacket_light','arrival'),'real inventory equips arrival clothing');
var fishing=Wardrobe.buy('vest_reinforced');
check(fishing.ok&&Inventory.coins()===58&&Wardrobe.equip('vest_reinforced','fishing'),'real inventory equips fishing clothing');
check(Wardrobe.getEquipped('arrival').outerwear.id==='jacket_light'&&Wardrobe.getEquipped('fishing').outerwear.id==='vest_reinforced','real equipment contexts persist independently');
Inventory.reset();
check(Inventory.getClothing().length===0&&Inventory.coins()===0,'Inventory.reset clears clothing and coins');
JSON.stringify({migration:true,purchasePersistence:true,duplicateChargeBlocked:true,coinsAfterPurchases:58,contextualEquip:true,resetClearsClothing:true});
'''
real_inventory = json.loads(dukpy.evaljs(actual_inventory_js))
print('PASS: focused clothing shop QA:', result, '| translations:', translations, '| real Inventory/Wardrobe:', real_inventory)
