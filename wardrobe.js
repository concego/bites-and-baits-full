/** wardrobe.js — Bites & Baits
 * Persistência de roupas compradas e peças equipadas nos dois contextos visuais.
 */
const Wardrobe = (() => {
  const STORAGE_KEY = 'bb_wardrobe_v1';
  const MODES = ['arrival', 'fishing'];

  function _empty() {
    return { owned: [], equipped: { arrival: {}, fishing: {} }, starterSynced: false };
  }

  function _load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return _empty();
      const state = _empty();
      state.owned = Array.isArray(raw.owned)
        ? [...new Set(raw.owned.filter(id => !!getClothingItem(id)))] : [];
      MODES.forEach(mode => {
        const source = raw.equipped && raw.equipped[mode] || {};
        Object.entries(source).forEach(([slot, id]) => {
          const item = getClothingItem(id);
          if (item && item.slot === slot && state.owned.includes(id)) state.equipped[mode][slot] = id;
        });
      });
      state.starterSynced = !!raw.starterSynced;
      return state;
    } catch {
      return _empty();
    }
  }

  function _save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
    return state;
  }

  function _outfitIndex(value) {
    const match = String(value || '').match(/-(\d+)$/);
    const index = match ? Number(match[1]) : 1;
    return Math.max(1, Math.min(5, Number.isFinite(index) ? index : 1));
  }

  function syncStarterPieces() {
    const state = _load();
    if (state.starterSynced || typeof Character === 'undefined') return state;
    const character = Character.load();
    if (!character.confirmed || !character.appearance) return state;
    const selections = {
      arrival: _outfitIndex(character.appearance.arrivalOutfit),
      fishing: _outfitIndex(character.appearance.fishingOutfit),
    };
    MODES.forEach(mode => {
      const pieces = CLOTHING_STARTER_SETS[mode][selections[mode]] || {};
      Object.entries(pieces).forEach(([slot, id]) => {
        if (!state.owned.includes(id)) state.owned.push(id);
        if (!state.equipped[mode][slot]) state.equipped[mode][slot] = id;
      });
    });
    state.starterSynced = true;
    return _save(state);
  }

  function ownedIds() {
    syncStarterPieces();
    return _load().owned.slice();
  }

  function owns(id) { return ownedIds().includes(id); }

  function getEquipped(mode) {
    syncStarterPieces();
    const state = _load();
    const result = {};
    Object.entries(state.equipped[mode] || {}).forEach(([slot, id]) => {
      const item = getClothingItem(id);
      if (item) result[slot] = item;
    });
    return result;
  }

  function isEquipped(id, mode) {
    return Object.values(_load().equipped[mode] || {}).includes(id);
  }

  function buy(id) {
    const item = getClothingItem(id);
    if (!item) return { ok: false, reason: 'missing' };
    const state = _load();
    if (state.owned.includes(id)) return { ok: false, reason: 'owned', item };
    if (typeof Inventory === 'undefined' || !Inventory.spendCoins(item.price)) {
      return { ok: false, reason: 'coins', item };
    }
    state.owned.push(id);
    _save(state);
    return { ok: true, item, coins: Inventory.coins() };
  }

  function equip(id, mode) {
    const item = getClothingItem(id);
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
