/** clothing-equipment.js — equip clothes from the player's inventory.
 * The future wardrobe furniture is not required to equip clothing.
 */
const Wardrobe = (() => {
  const STORAGE_KEY = 'bb_clothing_equipment_v1';
  const LEGACY_STORAGE_KEY = 'bb_wardrobe_v1';
  const MODES = ['arrival', 'fishing'];

  function _empty() {
    return { equipped: { arrival: {}, fishing: {} }, starterSynced: false, legacyMigrated: false };
  }

  function _load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return _empty();
      const state = _empty();
      MODES.forEach(mode => {
        const source = raw.equipped && raw.equipped[mode] || {};
        Object.entries(source).forEach(([slot, id]) => {
          const item = typeof getClothingItem === 'function' ? getClothingItem(id) : null;
          if (item && item.slot === slot) state.equipped[mode][slot] = id;
        });
      });
      state.starterSynced = !!raw.starterSynced;
      state.legacyMigrated = !!raw.legacyMigrated;
      return state;
    } catch {
      return _empty();
    }
  }

  function _save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
    return state;
  }

  function _loadLegacy() {
    try { return JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null'); }
    catch { return null; }
  }

  function _outfitIndex(value) {
    const match = String(value || '').match(/-(\d+)$/);
    const index = match ? Number(match[1]) : 1;
    return Math.max(1, Math.min(5, Number.isFinite(index) ? index : 1));
  }

  function syncStarterPieces() {
    const state = _load();
    if (typeof Inventory === 'undefined') return state;
    let dirty = false;

    // Migra as roupas que saves antigos guardavam em bb_wardrobe_v1 para o inventário.
    if (!state.legacyMigrated) {
      const old = _loadLegacy();
      (Array.isArray(old?.owned) ? old.owned : []).forEach(id => Inventory.addClothing(id));
      MODES.forEach(mode => {
        Object.entries(old?.equipped?.[mode] || {}).forEach(([slot, id]) => {
          const item = typeof getClothingItem === 'function' ? getClothingItem(id) : null;
          if (!item || item.slot !== slot) return;
          Inventory.addClothing(id);
          if (!state.equipped[mode][slot]) state.equipped[mode][slot] = id;
        });
      });
      state.starterSynced = state.starterSynced || !!old?.starterSynced;
      state.legacyMigrated = true;
      dirty = true;
    }

    if (!state.starterSynced && typeof Character !== 'undefined') {
      const character = Character.load();
      if (character.confirmed && character.appearance) {
        const selections = {
          arrival: _outfitIndex(character.appearance.arrivalOutfit),
          fishing: _outfitIndex(character.appearance.fishingOutfit),
        };
        MODES.forEach(mode => {
          const pieces = CLOTHING_STARTER_SETS[mode][selections[mode]] || {};
          Object.entries(pieces).forEach(([slot, id]) => {
            Inventory.addClothing(id);
            if (!state.equipped[mode][slot]) state.equipped[mode][slot] = id;
          });
        });
        state.starterSynced = true;
        dirty = true;
      }
    }

    return dirty ? _save(state) : state;
  }

  function ownedIds() {
    syncStarterPieces();
    return typeof Inventory !== 'undefined' ? Inventory.getClothing() : [];
  }

  function owns(id) {
    syncStarterPieces();
    return typeof Inventory !== 'undefined' && Inventory.hasClothing(id);
  }

  function getEquipped(mode) {
    syncStarterPieces();
    const state = _load();
    const result = {};
    Object.entries(state.equipped[mode] || {}).forEach(([slot, id]) => {
      const item = typeof getClothingItem === 'function' ? getClothingItem(id) : null;
      if (item && owns(id)) result[slot] = item;
    });
    return result;
  }

  function isEquipped(id, mode) {
    syncStarterPieces();
    return Object.values(_load().equipped[mode] || {}).includes(id);
  }

  /** Compra uma peça e a registra no inventário de roupas. */
  function buy(id) {
    const item = typeof getClothingItem === 'function' ? getClothingItem(id) : null;
    if (!item) return { ok: false, reason: 'missing' };
    if (owns(id)) return { ok: false, reason: 'owned', item };
    if (!Inventory.spendCoins(item.price)) return { ok: false, reason: 'coins', item };
    const added = Inventory.addClothing(id);
    if (!added) {
      Inventory.addCoins(item.price);
      return { ok: false, reason: 'owned', item };
    }
    return { ok: true, item, coins: Inventory.coins() };
  }

  function equip(id, mode) {
    const item = typeof getClothingItem === 'function' ? getClothingItem(id) : null;
    if (!item || !MODES.includes(mode) || !owns(id) || !item.modes.includes(mode)) return false;
    const state = _load();
    state.equipped[mode][item.slot] = item.id;
    _save(state);
    return true;
  }

  function state() {
    syncStarterPieces();
    return _load();
  }

  return { syncStarterPieces, ownedIds, owns, getEquipped, isEquipped, buy, equip, state, STORAGE_KEY };
})();
