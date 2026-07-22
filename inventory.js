/**
 * inventory.js — Bites & Baits
 * Gerencia o inventário de peixes pescados e as moedas do jogador.
 * Persiste em localStorage. Pronto para integração com a loja.
 *
 * Estrutura de um item de inventário:
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
 * Preço base por kg (shop-data.js vai expandir isso):
 *   Pirarucu  → 18 moedas/kg
 *   Dourado   → 12 moedas/kg
 *   Truta     → 8  moedas/kg
 *   Tilápia   → 5  moedas/kg
 *   Lambari   → 2  moedas/kg
 */

const Inventory = (() => {

  const STORAGE_KEY_ITEMS = 'bb_inventory';
  const STORAGE_KEY_COINS = 'bb_coins';

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
  };
})();
