/** dani-quest.js — fixed History quest, post-quest encounter and one-time gift. */
const DaniQuest = (() => {
  const QUEST_ID = 'dani_lambari';
  const STORAGE_KEY = 'bb_quest_dani_lambari';
  const QUEST_CATEGORIES = Object.freeze({ FIXED: 'fixed', SEASONAL: 'seasonal' });
  const QUEST_CATEGORY = QUEST_CATEGORIES.FIXED;
  const REWARD_COINS = 10; // Temporary balance value.
  const POST_QUEST_BOSS_CHANCE = 0.05;
  const POST_QUEST_BOSS_VALUE = 10;
  const DRAWING_DECORATION_ID = 'dani_lambari_drawing';
  const MARTA_GIFT_CLOTHING_ID = 'top_marta_courtesy';
  const BOSS_RESISTANCE_LEVEL = typeof FreeFishingSystem !== 'undefined'
    && Array.isArray(FreeFishingSystem.levels)
    ? FreeFishingSystem.levels.length : 4;
  const VALID_STATUSES = ['not_started', 'active', 'caught', 'completed'];

  function defaultState() {
    return {
      status: 'not_started',
      drawingOwned: false,
      rewardClaimed: false,
      questFishItemId: null,
      martaGiftClaimed: false,
      martaGiftItemId: null,
      postQuestBossRollDate: null,
      postQuestBossAvailable: false,
      postQuestBossUsedDate: null,
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function _isLegacyQuestFish(item) {
    return item?.storyQuestId === QUEST_ID
      || (!item?.postQuestBoss
        && item?.fishId === 'lambari'
        && item?.role === 'boss'
        && item?.mapId === 'lago_margem'
        && item?.zoneId === 'margem');
  }

  function _findQuestFishItem(state) {
    if (typeof Inventory === 'undefined' || typeof Inventory.getAll !== 'function') return null;
    const items = Inventory.getAll();
    const savedItem = state.questFishItemId
      ? items.find(item => item.id === state.questFishItemId)
      : null;
    return savedItem || items.find(_isLegacyQuestFish) || null;
  }

  function _syncInventory(state) {
    if (state.drawingOwned === true
      && typeof Inventory !== 'undefined'
      && typeof Inventory.addDecoration === 'function') {
      Inventory.addDecoration(DRAWING_DECORATION_ID);
    }

    const questFish = _findQuestFishItem(state);
    if (!questFish || typeof Inventory === 'undefined') return;

    if (state.status === 'caught') {
      let changed = false;
      if (state.questFishItemId !== questFish.id) {
        state.questFishItemId = questFish.id;
        changed = true;
      }
      if (typeof Inventory.markQuestItem === 'function') {
        Inventory.markQuestItem(questFish.id, QUEST_ID);
      }
      if (changed) saveState(state);
      return;
    }

    // Migration from the previous build: completed quest fish must not remain sellable.
    if (state.status === 'completed' && typeof Inventory.removeItem === 'function') {
      if (!state.questFishItemId) state.questFishItemId = questFish.id;
      Inventory.removeItem(questFish.id, true);
      saveState(state);
    }
  }

  function getState() {
    let state = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && VALID_STATUSES.includes(saved.status)) state = { ...defaultState(), ...saved };
    } catch { /* use fresh state */ }
    _syncInventory(state);
    return state;
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
    if (state.status !== 'not_started' || QUEST_CATEGORY !== QUEST_CATEGORIES.FIXED) return false;
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
      saleValue: POST_QUEST_BOSS_VALUE,
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

  function _gameDateKey() {
    const date = typeof GameTime !== 'undefined' && typeof GameTime.load === 'function'
      ? GameTime.load() : { year: 1, month: 1, day: 1 };
    return `${Number(date.year) || 1}-${Number(date.month) || 1}-${Number(date.day) || 1}`;
  }

  function shouldSpawnPostQuestBoss(mapId, zoneId, period) {
    if (getState().status !== 'completed'
      || mapId !== 'lago_margem'
      || zoneId !== 'margem'
      || period !== 'morning') return false;

    const state = getState();
    const dateKey = _gameDateKey();
    if (state.postQuestBossRollDate !== dateKey) {
      state.postQuestBossRollDate = dateKey;
      state.postQuestBossAvailable = Math.random() < POST_QUEST_BOSS_CHANCE;
      saveState(state);
    }
    return state.postQuestBossAvailable === true && state.postQuestBossUsedDate !== dateKey;
  }

  /** Consumes the daily encounter before the fish is spawned, preventing rerolls. */
  function markPostQuestBossSpawned() {
    const state = getState();
    const dateKey = _gameDateKey();
    if (state.status !== 'completed'
      || state.postQuestBossRollDate !== dateKey
      || state.postQuestBossAvailable !== true
      || state.postQuestBossUsedDate === dateKey) return false;
    state.postQuestBossAvailable = false;
    state.postQuestBossUsedDate = dateKey;
    return saveState(state);
  }

  function createPostQuestBossFish() {
    const fish = createBossFish();
    if (!fish) return null;
    delete fish.storyQuestId;
    fish.postQuestBoss = true;
    return fish;
  }

  function recordCatch(fish, inventoryItem = null) {
    const state = getState();
    if (state.status !== 'active' || fish?.storyQuestId !== QUEST_ID) return false;
    state.status = 'caught';
    state.questFishItemId = inventoryItem?.id || state.questFishItemId || null;
    if (state.questFishItemId && typeof Inventory.markQuestItem === 'function') {
      Inventory.markQuestItem(state.questFishItemId, QUEST_ID);
    }
    return saveState(state);
  }

  function claimRewards() {
    const state = getState();
    if (state.status !== 'caught' || state.rewardClaimed) {
      return { ok: false, alreadyClaimed: state.rewardClaimed };
    }
    if (typeof Inventory === 'undefined'
      || typeof Inventory.addCoins !== 'function'
      || typeof Inventory.addDecoration !== 'function'
      || typeof Inventory.hasDecoration !== 'function') {
      return { ok: false, alreadyClaimed: false };
    }
    if (!Inventory.hasDecoration(DRAWING_DECORATION_ID)
      && !Inventory.addDecoration(DRAWING_DECORATION_ID)) {
      return { ok: false, alreadyClaimed: false };
    }
    if (state.questFishItemId && typeof Inventory.removeItem === 'function') {
      Inventory.removeItem(state.questFishItemId, true);
    }
    state.status = 'completed';
    state.rewardClaimed = true;
    state.drawingOwned = true;
    state.rewardCoins = REWARD_COINS;
    if (!saveState(state)) return { ok: false, alreadyClaimed: false };
    const balance = Inventory.addCoins(REWARD_COINS);
    return { ok: true, coinsAwarded: REWARD_COINS, balance };
  }

  function canClaimMartaGift() {
    const state = getState();
    return state.status === 'completed' && state.martaGiftClaimed !== true;
  }

  function claimMartaGift() {
    const state = getState();
    if (state.status !== 'completed' || state.martaGiftClaimed === true) {
      return { ok: false, alreadyClaimed: state.martaGiftClaimed === true };
    }
    if (typeof Inventory === 'undefined'
      || typeof Inventory.hasClothing !== 'function'
      || typeof Inventory.addClothing !== 'function') {
      return { ok: false, alreadyClaimed: false };
    }
    if (!Inventory.hasClothing(MARTA_GIFT_CLOTHING_ID)
      && !Inventory.addClothing(MARTA_GIFT_CLOTHING_ID)) {
      return { ok: false, alreadyClaimed: false };
    }
    state.martaGiftClaimed = true;
    state.martaGiftItemId = MARTA_GIFT_CLOTHING_ID;
    if (!saveState(state)) return { ok: false, alreadyClaimed: false };
    return { ok: true, itemId: MARTA_GIFT_CLOTHING_ID };
  }

  function hasLambariDrawing() {
    const state = getState();
    if (typeof Inventory !== 'undefined' && typeof Inventory.hasDecoration === 'function') {
      return Inventory.hasDecoration(DRAWING_DECORATION_ID);
    }
    return state.status === 'completed' && state.drawingOwned === true;
  }

  // Migrates decoration and quest fish records from saves made by earlier builds.
  getState();

  return {
    id: QUEST_ID,
    category: QUEST_CATEGORY,
    categories: QUEST_CATEGORIES,
    rewardCoins: REWARD_COINS,
    postQuestBossChance: POST_QUEST_BOSS_CHANCE,
    postQuestBossValue: POST_QUEST_BOSS_VALUE,
    canMeet,
    getState,
    getStatus,
    accept,
    shouldSpawnBoss,
    createBossFish,
    shouldSpawnPostQuestBoss,
    markPostQuestBossSpawned,
    createPostQuestBossFish,
    recordCatch,
    claimRewards,
    canClaimMartaGift,
    claimMartaGift,
    hasLambariDrawing,
  };
})();
