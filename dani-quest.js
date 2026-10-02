/** dani-quest.js — first History quest and its persistent reward state. */
const DaniQuest = (() => {
  const QUEST_ID = 'dani_lambari';
  const STORAGE_KEY = 'bb_quest_dani_lambari';
  // Temporary balancing value; keep this isolated until the reward is balanced.
  const REWARD_COINS = 10;
  const BOSS_RESISTANCE_LEVEL = typeof FreeFishingSystem !== 'undefined'
    && Array.isArray(FreeFishingSystem.levels)
    ? FreeFishingSystem.levels.length : 4;
  const VALID_STATUSES = ['not_started', 'active', 'caught', 'completed'];

  function defaultState() {
    return { status: 'not_started', drawingOwned: false, rewardClaimed: false };
  }

  function getState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved || !VALID_STATUSES.includes(saved.status)) return defaultState();
      return { ...defaultState(), ...saved };
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function canMeet() {
    return typeof Inventory !== 'undefined'
      && typeof Inventory.hasInitialGear === 'function'
      && Inventory.hasInitialGear()
      && typeof ClothingShopView !== 'undefined';
  }

  function getStatus() {
    return getState().status;
  }

  function accept() {
    if (!canMeet()) return false;
    const state = getState();
    if (state.status !== 'not_started') return false;
    state.status = 'active';
    return saveState(state);
  }

  function shouldSpawnBoss(mapId, zoneId, period) {
    return getState().status === 'active'
      && mapId === 'lago_margem'
      && zoneId === 'margem'
      && period === 'morning';
  }

  function createBossFish() {
    const base = typeof FISH_CATALOG !== 'undefined' ? FISH_CATALOG.lambari : null;
    if (!base) return null;
    return {
      ...base,
      rarity: base.rarity || 'common',
      role: 'boss',
      special: true,
      storyQuestId: QUEST_ID,
      mapId: 'lago_margem',
      zoneId: 'margem',
      // Use the highest resistance tier currently defined by Free Fishing Bosses.
      pull: base.pull * (1 + BOSS_RESISTANCE_LEVEL * 0.10),
      pullNeeded: base.pullNeeded * (1 + BOSS_RESISTANCE_LEVEL * 0.12),
      stamina: base.stamina + BOSS_RESISTANCE_LEVEL * 3,
      escapePatience: base.escapePatience + BOSS_RESISTANCE_LEVEL * 8,
      biteWindow: Math.max(1200, base.biteWindow - BOSS_RESISTANCE_LEVEL * 120),
    };
  }

  function recordCatch(fish) {
    const state = getState();
    if (state.status !== 'active' || fish?.storyQuestId !== QUEST_ID) return false;
    state.status = 'caught';
    return saveState(state);
  }

  function claimRewards() {
    const state = getState();
    if (state.status !== 'caught' || state.rewardClaimed) {
      return { ok: false, alreadyClaimed: state.rewardClaimed };
    }
    if (typeof Inventory === 'undefined' || typeof Inventory.addCoins !== 'function') {
      return { ok: false, alreadyClaimed: false };
    }
    state.status = 'completed';
    state.rewardClaimed = true;
    state.drawingOwned = true;
    state.rewardCoins = REWARD_COINS;
    if (!saveState(state)) return { ok: false, alreadyClaimed: false };
    const balance = Inventory.addCoins(REWARD_COINS);
    return { ok: true, coinsAwarded: REWARD_COINS, balance };
  }

  function hasLambariDrawing() {
    const state = getState();
    return state.status === 'completed' && state.drawingOwned === true;
  }

  return {
    id: QUEST_ID,
    rewardCoins: REWARD_COINS,
    canMeet,
    getState,
    getStatus,
    accept,
    shouldSpawnBoss,
    createBossFish,
    recordCatch,
    claimRewards,
    hasLambariDrawing,
  };
})();
