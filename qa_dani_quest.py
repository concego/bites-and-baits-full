"""Focused regression QA for Dani's History quest, Boss, and owned reward."""
from pathlib import Path
import json
import dukpy

ROOT = Path(__file__).parent

def source(name):
    return (ROOT / name).read_text()

harness = r'''
var localStorage = (function () {
  var data = {};
  return {
    getItem: function (key) { return data[key] === undefined ? null : data[key]; },
    setItem: function (key, value) { data[key] = String(value); },
    removeItem: function (key) { delete data[key]; }
  };
})();
var document = { documentElement: { lang: '' } };
''' + source('fish-data.js') + '\n' + source('fish-metrics.js') + '\n' + source('score-system.js') + '\n' + source('game-time.js') + '\n' + source('i18n.js') + '\n' + source('accessibility-announcer.js') + r'''
var hasGear = false;
var coinBalance = 7;
var Inventory = {
  hasInitialGear: function () { return hasGear; },
  addCoins: function (amount) { coinBalance += amount; return coinBalance; },
  coins: function () { return coinBalance; }
};
var checks = 0;
function check(condition, message) {
  if (!condition) throw new Error(message);
  checks += 1;
}
function createQuest() {
''' + source('dani-quest.js') + r'''
  return DaniQuest;
}
var quest = createQuest();
check(quest.getStatus() === 'not_started', 'starts not_started');
check(!quest.canMeet() && !quest.accept(), 'hidden before starter gear');
hasGear = true;
check(!quest.canMeet() && !quest.accept(), 'hidden until clothing shop module exists');
ClothingShopView = {};
check(quest.canMeet(), 'eligible after starter gear and clothing shop module');
check(quest.accept(), 'accepts once eligible');
check(quest.getStatus() === 'active', 'acceptance persists active state');
check(!quest.accept(), 'cannot re-accept an active quest');
check(quest.shouldSpawnBoss('lago_margem', 'margem', 'morning'), 'spawns at the lake shore in the morning');
check(!quest.shouldSpawnBoss('lago_margem', 'margem', 'dawn'), 'does not spawn at dawn');
check(!quest.shouldSpawnBoss('lago_margem', 'margem', 'afternoon'), 'does not spawn in afternoon');
check(!quest.shouldSpawnBoss('lago_margem', 'margem', 'evening'), 'does not spawn in evening');
check(!quest.shouldSpawnBoss('rio_doce', 'margem', 'morning'), 'does not spawn on another map');
check(!quest.shouldSpawnBoss('lago_margem', 'fundo', 'morning'), 'does not spawn in another zone');
var boss = quest.createBossFish();
var base = FISH_CATALOG.lambari;
check(boss.id === 'lambari' && boss.role === 'boss' && boss.special, 'Boss is a special lambari');
check(boss.storyQuestId === quest.id, 'Boss carries the story-quest identity');
check(boss.mapId === 'lago_margem' && boss.zoneId === 'margem', 'Boss metadata targets the correct map and zone');
check(!boss.freeBoss && boss.freeBossLevel === undefined, 'story Boss is not marked as a Free Fishing Boss');
var maxBossTier = FreeFishingSystem.levels.length;
check(maxBossTier === 4, 'current Free Fishing Boss resistance has four tiers');
check(Math.abs(boss.pull - base.pull * (1 + maxBossTier * 0.10)) < 1e-9, 'Boss uses maximum-tier pull multiplier');
check(Math.abs(boss.pullNeeded - base.pullNeeded * (1 + maxBossTier * 0.12)) < 1e-9, 'Boss uses maximum-tier pull-needed multiplier');
check(boss.stamina === base.stamina + maxBossTier * 3, 'Boss uses maximum-tier stamina');
check(boss.escapePatience === base.escapePatience + maxBossTier * 8, 'Boss uses maximum-tier escape patience');
check(boss.biteWindow === Math.max(1200, base.biteWindow - maxBossTier * 120), 'Boss uses maximum-tier bite window');
var specimen = FishMetrics.rollSpecimen(boss);
check(specimen.length === base.lengthRangeCm[1], 'quest Boss reaches species maximum length');
check(specimen.weight === base.weightRange[1], 'quest Boss reaches species maximum weight');
check(specimen.specimenRarity === 'trophy', 'quest Boss has trophy specimen quality');
check(!quest.recordCatch({ id: 'lambari', role: 'boss' }), 'ordinary lambari cannot complete the quest');
check(quest.getStatus() === 'active', 'wrong fish leaves quest active');
check(quest.recordCatch(boss), 'quest Boss advances the objective');
check(quest.getStatus() === 'caught', 'capture persists caught state');
check(!quest.shouldSpawnBoss('lago_margem', 'margem', 'morning'), 'no new quest Boss after capture');
check(!quest.recordCatch(boss), 'duplicate catch cannot re-advance state');
var reward = quest.claimRewards();
check(reward.ok && reward.coinsAwarded === 10 && reward.balance === 17, 'first return grants provisional 10 coins once');
check(quest.getStatus() === 'completed', 'claim completes quest');
check(quest.getState().rewardClaimed === true, 'coin reward is recorded claimed');
check(quest.getState().drawingOwned === true && quest.hasLambariDrawing(), 'drawing is preserved as owned reward');
check(quest.getState().rewardCoins === 10, 'stored reward amount is explicit');
var persisted = createQuest();
check(persisted.getStatus() === 'completed' && persisted.hasLambariDrawing(), 'completed drawing ownership survives module reload');
check(!persisted.claimRewards().ok && coinBalance === 17, 'reload cannot pay reward a second time');
check(!persisted.accept(), 'completed quest cannot be re-accepted');
GameTime.save({ year: 1, month: 1, day: 1, hour: 5, minute: 30 });
check(GameTime.period() === 'dawn', '05:30 is dawn');
GameTime.save({ year: 1, month: 1, day: 1, hour: 6, minute: 0 });
check(GameTime.period() === 'morning', '06:00 starts morning');
GameTime.save({ year: 1, month: 1, day: 1, hour: 11, minute: 30 });
check(GameTime.period() === 'morning', '11:30 remains morning');
GameTime.save({ year: 1, month: 1, day: 1, hour: 12, minute: 0 });
check(GameTime.period() === 'afternoon', '12:00 ends morning');
var localeKeys = [
  'people_dani_name', 'people_dani_desc', 'people_dani_intro_01',
  'people_player_dani_intro_01', 'people_dani_intro_02',
  'people_player_dani_intro_02', 'people_dani_intro_03',
  'people_player_dani_intro_03', 'people_dani_intro_04',
  'people_player_dani_intro_04', 'people_dani_intro_05',
  'people_dani_active_01', 'people_dani_caught_01',
  'people_player_dani_caught_01', 'people_dani_caught_02',
  'people_dani_completed_01', 'dani_quest_started',
  'dani_quest_boss_appears', 'dani_quest_return_to_village',
  'dani_quest_reward_received'
];
['pt', 'en', 'hu'].forEach(function (language) {
  I18n.setLang(language);
  localeKeys.forEach(function (key) {
    check(I18n.t(key) !== key && I18n.t(key) !== undefined, language + ' translation missing: ' + key);
  });
});
I18n.setLang('pt');
check(I18n.t('people_dani_intro_04').indexOf('piau') >= 0, 'Portuguese anecdote uses the catalog spelling piau');
check(I18n.t('people_dani_intro_04').indexOf('pial') < 0, 'Portuguese anecdote avoids the typo pial');
var liveAnnouncer = { textContent: '' };
document.getElementById = function () { return liveAnnouncer; };
setTimeout = function (callback) { callback(); return 0; };
A11yAnnouncer.sayCatchKeyWithFollowup('caught_noscore', 'Volte à vila e fale com Dani.',
  'Lambari', 'enorme', 'troféu', 1, 2, 8);
check(liveAnnouncer.textContent.indexOf('Lambari') >= 0, 'catch notice still includes the captured fish');
check(liveAnnouncer.textContent.indexOf('Volte à vila e fale com Dani.') > liveAnnouncer.textContent.indexOf('Lambari'),
  'quest follow-up is appended to the same catch announcement');
JSON.stringify({ checks: checks, questStatus: persisted.getStatus(), coinBalance: coinBalance, rewardCoins: reward.coinsAwarded });
'''
result = json.loads(dukpy.evaljs(harness))

game_js = source('game.js')
index_html = source('index.html')
assert "DaniQuest.shouldSpawnBoss(activeMap?.id, activeZone, GameTime.period())" in game_js
assert "gameMode === 'normal'" in game_js and 'DaniQuest.shouldSpawnBoss' in game_js
assert 'DaniQuest.recordCatch(currentFish)' in game_js
assert 'sayCatchKeyWithFollowup(catchMessageKey, t(\'dani_quest_return_to_village\')' in game_js
assert "DaniQuest.claimRewards()" in game_js and "questStatus === 'caught'" in game_js
assert "<script src=\"dani-quest.js?v=dani-quest-01\"></script>" in index_html
assert "<script src=\"accessibility-announcer.js?v=dani-catch-followup-01\"></script>" in index_html
assert index_html.index('dani-quest.js') < index_html.index('game.js?v=dani-quest-02')

print('PASS: %d quest assertions; all locales and game integration hooks verified; provisional reward=%d coins.' % (
    result['checks'], result['rewardCoins']))
