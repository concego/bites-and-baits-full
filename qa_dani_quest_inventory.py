"""Integration QA for Dani's quest against the production Inventory module."""
from pathlib import Path
import json
import dukpy

ROOT = Path(__file__).parent


def source(name):
    return (ROOT / name).read_text()


harness = r'''
var storage = { bb_coins: '37', bb_initial_gear_received: '1' };
var localStorage = {
  getItem: function (key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
  setItem: function (key, value) { storage[key] = String(value); },
  removeItem: function (key) { delete storage[key]; }
};
var serial = 100;
Date.now = function () { serial += 1; return serial; };
var FreeFishingSystem = { levels: [1, 2, 3, 4] };
var ClothingShopView = {};
var checks = 0;
function check(condition, message) { if (!condition) throw new Error(message); checks += 1; }
''' + source('fish-data.js') + '\n' + source('fish-metrics.js') + '\n' + source('home-decoration-data.js') + '\n' + source('clothing-catalog.js') + '\n' + source('inventory.js') + '\n' + source('game-time.js') + '\n' + source('dani-quest.js') + r'''
check(DaniQuest.accept(), 'real Inventory accepts the quest after initial equipment');
var questBoss = DaniQuest.createBossFish();
var questItem = Inventory.addFish(questBoss);
check(questItem.storyQuestId === DaniQuest.id, 'real caught mission Boss is tagged in the inventory');
check(Inventory.isProtected(questItem.id), 'quest-linked fish is protected from sale');
check(Inventory.removeItem(questItem.id) === false && Inventory.count() === 1, 'quest fish cannot be discarded before delivery');
check(Inventory.toggleProtect(questItem.id) === true && Inventory.isProtected(questItem.id), 'quest item cannot be unprotected');
check(Inventory.sellItem(questItem.id).reason === 'protected', 'direct quest-fish sale is blocked');
check(Inventory.sellFishQty('lambari', 1).reason === 'not_found', 'bulk species sale excludes quest fish');
check(Inventory.sellAll().reason === 'empty', 'sell-all excludes quest fish');
check(DaniQuest.recordCatch(questBoss, questItem), 'real catch enters the caught quest state');
var reward = DaniQuest.claimRewards();
check(reward.ok && Inventory.count() === 0, 'talking to Dani removes the quest fish from inventory');
check(reward.balance === 47, '10-coin reward is added once to existing 37-coin balance');
check(DaniQuest.canClaimMartaGift(), 'Marta courtesy dialogue becomes available after completion');
var gift = DaniQuest.claimMartaGift();
check(gift.ok && Inventory.hasClothing('top_marta_courtesy'), 'gift-only courtesy shirt is granted to clothing inventory');
check(!DaniQuest.claimMartaGift().ok, 'courtesy shirt cannot be granted twice');
GameTime.save({ year: 1, month: 1, day: 1, hour: 8, minute: 0 });
var originalRandom = Math.random;
Math.random = function () { return 0.01; };
check(DaniQuest.shouldSpawnPostQuestBoss('lago_margem', 'margem', 'morning'), 'real post-quest encounter rolls positive');
check(DaniQuest.markPostQuestBossSpawned(), 'real encounter consumed before spawning');
var postFish = DaniQuest.createPostQuestBossFish();
var postItem = Inventory.addFish(postFish);
check(!postItem.storyQuestId && postItem.postQuestBoss, 'post-quest Boss remains separate from quest lock');
check(postItem.value === 10, 'real Inventory stores the post-quest Boss at exactly 10 coins');
var sold = Inventory.sellItem(postItem.id);
check(sold.ok && sold.earned === 10 && Inventory.coins() === 57, 'post-quest Boss is sellable for 10 coins');
Math.random = originalRandom;
var oldQuestFish = { id: 'old-quest', fishId: 'lambari', role: 'boss', mapId: 'lago_margem', zoneId: 'margem', value: 1 };
var newPostQuestFish = { id: 'new-post', fishId: 'lambari', role: 'boss', mapId: 'lago_margem', zoneId: 'margem', postQuestBoss: true, value: 10 };
localStorage.setItem('bb_inventory', JSON.stringify([oldQuestFish, newPostQuestFish]));
localStorage.setItem('bb_quest_dani_lambari', JSON.stringify({ status: 'completed', drawingOwned: true, rewardClaimed: true }));
DaniQuest.getState();
check(Inventory.getAll().length === 1 && Inventory.getAll()[0].id === 'new-post', 'completed-save migration removes only legacy quest Boss, not future post-quest Boss');
localStorage.setItem('bb_inventory', JSON.stringify([oldQuestFish]));
localStorage.setItem('bb_quest_dani_lambari', JSON.stringify({ status: 'caught', drawingOwned: false, rewardClaimed: false }));
DaniQuest.getState();
check(Inventory.getAll()[0].storyQuestId === DaniQuest.id && Inventory.isProtected('old-quest'), 'caught-save migration protects a legacy quest fish');
JSON.stringify({ checks: checks });
'''

result = json.loads(dukpy.evaljs(harness))
print('PASS: %d real-Inventory quest integration assertions (fish locking/removal, quest reward, Marta gift, exact resale value, and save migrations).' % result['checks'])
