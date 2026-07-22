/**
 * inventory.js — Bites & Baits
 * Gerencia o inventário de peixes pescados, iscas e moedas do jogador.
 * Persiste em localStorage. Pronto para integração com a loja.
 *
 * Estrutura de um item de inventário (peixe):
 *   {
 *     id:        string   — id único do item (ex: "lambari_1720000000000")
 *     fishId:    string   — id da espécie (ex: "lambari")
 *     nameKey:   string   — chave i18n do nome
 *     weight:    number   — peso em kg (sorteado dentro do weightRange)
 *     value:     number   — valor base em moedas calculado ao pescar
 *     special:   boolean  — se era espécie especial
 *     caughtAt:  number   — timestamp
 *   }
 *
 * Iscas disponíveis (BAIT_CATALOG):
 *   worm, cricket, fly, spoon, live_bait, shrimp, jig
 *
 * Preço base por kg (shop-data.js vai expandir isso):
 *   Pirarucu  → 18 moedas/kg
 *   Dourado   → 12 moedas/kg
 *   Truta     → 8  moedas/kg
 *   Tilápia   → 5  moedas/kg
 *   Lambari   → 2  moedas/kg
 */

/** Catálogo de iscas — nameKey mapeado no i18n */
const BAIT_CATALOG = {
  worm:      { id: 'worm',      nameKey: 'bait_worm',      emoji: '🪱' },
  cricket:   { id: 'cricket',   nameKey: 'bait_cricket',   emoji: '🦗' },
  fly:       { id: 'fly',       nameKey: 'bait_fly',       emoji: '🪰' },
  spoon:     { id: 'spoon',     nameKey: 'bait_spoon',     emoji: '🥄' },
  live_bait: { id: 'live_bait', nameKey: 'bait_live_bait', emoji: '🐟' },
  shrimp:    { id: 'shrimp',    nameKey: 'bait_shrimp',    emoji: '🦐' },
  jig:       { id: 'jig',       nameKey: 'bait_jig',       emoji: '🎣' },
};

const Inventory = (() => {

  const STORAGE_KEY_ITEMS  = 'bb_inventory';
  const STORAGE_KEY_COINS  = 'bb_coins';
  const STORAGE_KEY_BAITS  = 'bb_baits';
  const STORAGE_KEY_BAITS_V = 'bb_baits_v';
  const BAITS_VERSION = '1';   // incrementar aqui força reset do estoque
  const STORAGE_KEY_EQUIP  = 'bb_equip';   // { bait: 'worm' }

  // Estoque inicial generoso para testes
  const DEFAULT_BAITS = {
    worm:      30,
    cricket:   30,
    fly:       20,
    spoon:     20,
    live_bait: 20,
    shrimp:    15,
    jig:       15,
  };

  // Preço base por kg por espécie (expandir via shop-data.js futuramente)
  const BASE_PRICE_PER_KG = {
    lambari:  2,
    tilapia:  5,
    truta:    8,
    dourado:  12,
    pirarucu: 18,
  };

  // ── Persistência ──────────────────────────────────────────────────────────
  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ITEMS) || '[]'); }
    catch { return []; }
  }

  function _save(items) {
    try { localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items)); }
    catch { /* noop — storage cheio */ }
  }

  function _loadCoins() {
    try { return parseInt(localStorage.getItem(STORAGE_KEY_COINS) || '0'); }
    catch { return 0; }
  }

  function _saveCoins(coins) {
    try { localStorage.setItem(STORAGE_KEY_COINS, String(coins)); }
    catch { /* noop */ }
  }

  // ── Peso aleatório dentro do range ────────────────────────────────────────
  function rollWeight(fish) {
    const [min, max] = fish.weightRange ?? [0.1, 1.0];
    const raw = min + Math.random() * (max - min);
    return Math.round(raw * 10) / 10;  // 1 casa decimal
  }

  // ── Calcula valor em moedas ───────────────────────────────────────────────
  function calcValue(fish, weight) {
    const pricePerKg = BASE_PRICE_PER_KG[fish.id] ?? 3;
    const base       = pricePerKg * weight;
    const bonus      = fish.special ? base * 0.5 : 0;
    return Math.max(1, Math.round(base + bonus));
  }

  // ── API pública ───────────────────────────────────────────────────────────

  /**
   * Adiciona um peixe pescado ao inventário.
   * Retorna o item criado { weight, value, ... }.
   */
  function addFish(fish) {
    const weight = rollWeight(fish);
    const value  = calcValue(fish, weight);
    const item   = {
      id:       `${fish.id}_${Date.now()}`,
      fishId:   fish.id,
      nameKey:  fish.nameKey,
      weight,
      value,
      special:  fish.special ?? false,
      caughtAt: Date.now(),
    };
    const items = _load();
    items.push(item);
    _save(items);
    return item;
  }

  /**
   * Retorna todos os itens do inventário (mais recentes primeiro).
   */
  function getAll() {
    return _load().slice().reverse();
  }

  /**
   * Retorna o total de itens no inventário.
   */
  function count() {
    return _load().length;
  }

  /**
   * Remove um item do inventário pelo id (para quando vender na loja).
   * Retorna true se removido, false se não encontrado.
   */
  function removeItem(itemId) {
    const items    = _load();
    const filtered = items.filter(i => i.id !== itemId);
    if (filtered.length === items.length) return false;
    _save(filtered);
    return true;
  }

  /**
   * Vende um item: remove do inventário e adiciona o valor às moedas.
   * Retorna { ok, coins } ou { ok: false, reason }.
   */
  function sellItem(itemId) {
    const items = _load();
    const item  = items.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: 'not_found' };
    const filtered = items.filter(i => i.id !== itemId);
    _save(filtered);
    const coins = _loadCoins() + item.value;
    _saveCoins(coins);
    return { ok: true, coins, earned: item.value };
  }

  /**
   * Vende todos os itens do inventário de uma vez.
   * Retorna { ok, coins, earned, count }.
   */
  function sellAll() {
    const items  = _load();
    if (items.length === 0) return { ok: false, reason: 'empty' };
    const earned = items.reduce((s, i) => s + i.value, 0);
    _save([]);
    const coins  = _loadCoins() + earned;
    _saveCoins(coins);
    return { ok: true, coins, earned, count: items.length };
  }

  /** Retorna saldo atual de moedas */
  function coins() { return _loadCoins(); }

  /** Adiciona moedas (recompensa externa, bônus, etc.) */
  function addCoins(amount) {
    const coins = _loadCoins() + Math.max(0, amount);
    _saveCoins(coins);
    return coins;
  }

  /** Gasta moedas (compra de isca, etc.). Retorna false se saldo insuficiente. */
  function spendCoins(amount) {
    const current = _loadCoins();
    if (current < amount) return false;
    _saveCoins(current - amount);
    return true;
  }

  /** Limpa inventário e moedas (reset total — usar com cuidado) */
  function reset() {
    _save([]);
    _saveCoins(0);
  }

  // ── Iscas ─────────────────────────────────────────────────────────────────

  function _loadBaits() {
    try {
      // Versioning — se versão mudou ou chave não existe, reseta estoque
      const savedVer = localStorage.getItem(STORAGE_KEY_BAITS_V);
      if (savedVer !== BAITS_VERSION) {
        const fresh = { ...DEFAULT_BAITS };
        localStorage.setItem(STORAGE_KEY_BAITS,   JSON.stringify(fresh));
        localStorage.setItem(STORAGE_KEY_BAITS_V, BAITS_VERSION);
        return fresh;
      }
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_BAITS));
      return saved || { ...DEFAULT_BAITS };
    } catch { return { ...DEFAULT_BAITS }; }
  }

  function _saveBaits(baits) {
    try { localStorage.setItem(STORAGE_KEY_BAITS, JSON.stringify(baits)); }
    catch { /* noop */ }
  }

  function _loadEquip() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIP));
      return saved || { bait: 'worm' };
    } catch { return { bait: 'worm' }; }
  }

  function _saveEquip(equip) {
    try { localStorage.setItem(STORAGE_KEY_EQUIP, JSON.stringify(equip)); }
    catch { /* noop */ }
  }

  /** Retorna o estoque de iscas: { worm: 30, cricket: 28, ... } */
  function getBaits() { return _loadBaits(); }

  /** Retorna a quantidade de uma isca específica */
  function baitCount(baitId) { return _loadBaits()[baitId] ?? 0; }

  /** Equipamento ativo: { bait: 'worm' } */
  function getEquip() { return _loadEquip(); }

  /** Define a isca equipada. Retorna false se não houver estoque. */
  function equipBait(baitId) {
    if (!BAIT_CATALOG[baitId]) return false;
    if ((_loadBaits()[baitId] ?? 0) <= 0) return false;
    const equip = _loadEquip();
    equip.bait = baitId;
    _saveEquip(equip);
    return true;
  }

  /**
   * Consome 1 unidade da isca equipada ao lançar.
   * Retorna { ok, remaining } ou { ok: false, reason }.
   */
  function consumeBait() {
    const equip  = _loadEquip();
    const baitId = equip.bait;
    const baits  = _loadBaits();
    if ((baits[baitId] ?? 0) <= 0) return { ok: false, reason: 'no_bait' };
    baits[baitId]--;
    _saveBaits(baits);
    return { ok: true, remaining: baits[baitId] };
  }

  /** Adiciona iscas ao estoque (compra na loja, etc.) */
  function addBaits(baitId, qty) {
    if (!BAIT_CATALOG[baitId]) return false;
    const baits = _loadBaits();
    baits[baitId] = (baits[baitId] ?? 0) + qty;
    _saveBaits(baits);
    return true;
  }

  return {
    addFish,
    getAll,
    count,
    removeItem,
    sellItem,
    sellAll,
    coins,
    addCoins,
    spendCoins,
    rollWeight,
    calcValue,
    reset,
    // Iscas
    getBaits,
    baitCount,
    getEquip,
    equipBait,
    consumeBait,
    addBaits,
  };
})();
