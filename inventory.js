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
  const STORAGE_KEY_EQUIP    = 'bb_equip';     // { bait:'worm', rod:'rod_basic', ... }
  const STORAGE_KEY_PROTECTED = 'bb_protected'; // Set de ids de peixes protegidos
  const STORAGE_KEY_ZONEMAP   = 'bb_zonemap';   // { mapId: [zoneId, ...] }

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

  // Preço base inteiro por kg — escala de moedas sem centavos (estilo iene).
  // A ordem representa valor aproximado de mercado, enquanto o peso e a
  // raridade continuam diferenciando o retorno final de cada captura.
  const BASE_PRICE_PER_KG = {
    // Espécies comuns — valor baixo
    lambari:                   4,   // isca viva, valor baixo mas volume alto
    cara:                      3,
    piau:                      5,
    curimbata:                 6,
    // Espécies de consumo médio
    tilapia:                   7,
    traira:                    9,
    traira_grande:            11,
    truta:                    10,
    // Espécies nobres / especiais
    tucunare:                 13,
    dourado:                  16,
    pintado:                  14,
    jau:                      15,
    pirarucu:                 14,
    peixe_dourado_ornamental: 20,  // ornamental — raridade eleva o preço
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
    // Precisão adaptativa: peixes leves (<0.5 kg max) exibem 2 casas;
    // peixes médios (<5 kg max) exibem 1 casa; peixes grandes arredondam.
    // Garante mínimo de 0.01 kg — nenhum peixe tem peso zero.
    if (max <= 0.5)      return Math.max(0.01, Math.round(raw * 100) / 100); // 2 dec — peixes <500g
    if (max <= 5.0)      return Math.max(0.1,  Math.round(raw * 10)  / 10);  // 1 dec — até 5 kg
    if (max <= 25.0)     return Math.max(0.5,  Math.round(raw * 2)   / 2);   // 0.5 kg — até 25 kg
    return Math.max(1,   Math.round(raw));                                    // inteiro — grandes
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
      rarity:   fish.rarity || (fish.special ? 'rare' : 'common'),
      role:     fish.role || null,
      mapId:    fish.mapId || null,
      zoneId:   fish.zoneId || null,
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

  // Capacidade padrão para pesca da margem, quando nenhum barco está equipado.
  const DEFAULT_HOLD_CAPACITY = 8;

  /** Retorna a capacidade de carga do barco ativo (ou da pesca da margem). */
  function holdCapacity(boatId = getActiveBoat()) {
    const vessel = (typeof VESSELS_CATALOG !== 'undefined')
      ? VESSELS_CATALOG.find(v => v.id === boatId) : null;
    return vessel?.holdCap ?? DEFAULT_HOLD_CAPACITY;
  }

  /** Retorna quantos peixes ocupam a carga/inventário atualmente. */
  function holdUsed() {
    return count();
  }

  /** Verifica se ainda cabe pelo menos um peixe na carga. */
  function hasHoldSpace(boatId = getActiveBoat()) {
    return holdUsed() < holdCapacity(boatId);
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
   * Vende N peixes de uma espécie (fishId).
   * Remove os N mais baratos (ou os que tiver, se qty > count).
   * Retorna { ok, sold, earned, coins }.
   */
  function sellFishQty(fishId, qty) {
    const items   = _load();
    const ofKind  = items.filter(i => i.fishId === fishId && !isProtected(i.id));
    if (ofKind.length === 0) return { ok: false, reason: 'not_found' };
    const toSell  = ofKind.slice(0, Math.min(qty, ofKind.length));
    const earned  = toSell.reduce((s, i) => s + i.value, 0);
    const sellIds = new Set(toSell.map(i => i.id));
    _save(items.filter(i => !sellIds.has(i.id)));
    const coins = _loadCoins() + earned;
    _saveCoins(coins);
    return { ok: true, sold: toSell.length, earned, coins };
  }

  // sellAll() movida para bloco de proteção acima

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
    const starter = {
      bait:  'worm',
      rod:   'rod_basic',
      line:  'line_mono',
      hook:  'hook_basic',
      float: 'float_basic',
    };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIP));
      // Migra saves antigos que só tinham a isca, sem substituir slots que
      // o jogador tenha deixado explicitamente desequipados (null).
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
        localStorage.setItem(STORAGE_KEY_EQUIP, JSON.stringify(starter));
        return starter;
      }
      const equip = { ...starter, ...saved };
      const migrated = Object.keys(starter).some(slot => !(slot in saved));
      if (migrated) localStorage.setItem(STORAGE_KEY_EQUIP, JSON.stringify(equip));
      return equip;
    } catch {
      return starter;
    }
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


  // ── Proteção de itens ────────────────────────────────────────────────────

  function _loadProtected() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_PROTECTED) || '[]')); }
    catch { return new Set(); }
  }

  function _saveProtected(set) {
    try { localStorage.setItem(STORAGE_KEY_PROTECTED, JSON.stringify([...set])); }
    catch { /* noop */ }
  }

  /** Retorna true se o item está protegido */
  function isProtected(itemId) { return _loadProtected().has(itemId); }

  /** Alterna proteção de um item. Retorna o novo estado (true = protegido). */
  function toggleProtect(itemId) {
    const set = _loadProtected();
    if (set.has(itemId)) { set.delete(itemId); } else { set.add(itemId); }
    _saveProtected(set);
    return set.has(itemId);
  }

  /** Vende todos os peixes NÃO protegidos. Retorna { ok, earned, count }. */
  function sellAll() {
    const items     = _load();
    const protected_ = _loadProtected();
    const toSell    = items.filter(i => !protected_.has(i.id));
    if (toSell.length === 0) return { ok: false, reason: 'empty' };
    const earned    = toSell.reduce((s, i) => s + i.value, 0);
    const keep      = items.filter(i => protected_.has(i.id));
    _save(keep);
    const coins = _loadCoins() + earned;
    _saveCoins(coins);
    return { ok: true, coins, earned, count: toSell.length };
  }

  // ── Venda granular na loja ────────────────────────────────────────────────

  /** Vende qty unidades de uma isca. Retorna { ok, earned } ou { ok:false }. */
  function sellBaits(baitId, qty) {
    if (!BAIT_CATALOG[baitId]) return { ok: false, reason: 'unknown' };
    const baits   = _loadBaits();
    const have    = baits[baitId] ?? 0;
    const selling = Math.min(qty, have);
    if (selling <= 0) return { ok: false, reason: 'no_stock' };
    // Preço de revenda = 50% do preço de compra (buscado no SHOP_CATALOG global)
    const shopItem  = (typeof SHOP_CATALOG !== 'undefined')
      ? SHOP_CATALOG.find(i => i.type === 'bait' && i.id === baitId) : null;
    const unitPrice = shopItem ? Math.max(1, Math.floor(shopItem.price * 0.5)) : 1;
    // Custo é por pacote — preço unitário = price / qty_per_pack
    const unitSell  = shopItem
      ? Math.max(1, Math.floor((shopItem.price / (shopItem.qty || 1)) * 0.5)) : 1;
    const earned    = selling * unitSell;
    baits[baitId]   = have - selling;
    _saveBaits(baits);
    const coins     = _loadCoins() + earned;
    _saveCoins(coins);
    return { ok: true, earned, unitPrice: unitSell, sold: selling };
  }

  /**
   * Vende um equipamento que o jogador possui (não pode estar equipado).
   * id = id do item (ex: 'rod_carbon').
   * Retorna { ok, earned } ou { ok:false, reason }.
   */
  function sellEquip(itemId) {
    if (isProtected(itemId)) return { ok: false, reason: 'protected' };
    const equip = _loadEquip();
    // Verifica se está equipado em algum slot
    for (const [slot, equipped] of Object.entries(equip)) {
      if (equipped === itemId) return { ok: false, reason: 'equipped' };
    }
    const owned = _loadOwnedEquip();
    const idx   = owned.indexOf(itemId);
    if (idx === -1) return { ok: false, reason: 'not_owned' };
    owned.splice(idx, 1);
    _saveOwnedEquip(owned);
    // Preço de revenda = 50% do preço de compra
    const shopItem = (typeof SHOP_CATALOG !== 'undefined')
      ? SHOP_CATALOG.find(i => i.id === itemId) : null;
    const earned   = shopItem ? Math.max(1, Math.floor(shopItem.price * 0.5)) : 1;
    const coins    = _loadCoins() + earned;
    _saveCoins(coins);
    return { ok: true, earned };
  }

  // ── Equipamentos possuídos ────────────────────────────────────────────────
  // Equipamentos comprados ficam em bb_owned_equip (array de ids).
  // O equipado ativo fica em bb_equip (por slot).

  const STORAGE_KEY_OWNED_EQUIP  = 'bb_owned_equip';
  const STORAGE_KEY_ACTIVE_BOAT  = 'bb_active_boat';
  const STORAGE_KEY_HOUSE_LEVEL  = 'bb_house_level';

  function _loadOwnedEquip() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_OWNED_EQUIP) || '[]');
      if (!Array.isArray(saved)) return [];
      // Migra o antigo Barco a Remo para o novo Barco de Alumínio.
      const migrated = [...new Set(saved.map(id => id === 'rowboat' ? 'barco_aluminio' : id))];
      if (JSON.stringify(migrated) !== JSON.stringify(saved)) _saveOwnedEquip(migrated);
      return migrated;
    } catch { return []; }
  }

  function _saveOwnedEquip(arr) {
    try { localStorage.setItem(STORAGE_KEY_OWNED_EQUIP, JSON.stringify(arr)); }
    catch { /* noop */ }
  }

  /** Registra um equipamento como possuído (chamado ao comprar). */
  function addEquip(itemId) {
    const owned = _loadOwnedEquip();
    if (!owned.includes(itemId)) { owned.push(itemId); _saveOwnedEquip(owned); }
  }

  /** Retorna array de ids de equipamentos possuídos. */
  function getOwnedEquip() { return _loadOwnedEquip(); }

  // ── Barco ativo ──────────────────────────────────────────────────────────

  /** Define o barco ativo (equipado). */
  function setActiveBoat(boatId) {
    try { localStorage.setItem(STORAGE_KEY_ACTIVE_BOAT, boatId); }
    catch { /* noop */ }
  }

  /** Retorna o id do barco ativo, ou null se nenhum. */
  function getActiveBoat() {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_BOAT) || null;
    if (saved === 'rowboat') {
      setActiveBoat('barco_aluminio');
      return 'barco_aluminio';
    }
    return saved;
  }

  // ── Casa ─────────────────────────────────────────────────────────────────

  /** Retorna o nível atual da casa (0 = barraco). */
  function getHouseLevel() {
    return parseInt(localStorage.getItem(STORAGE_KEY_HOUSE_LEVEL) || '0');
  }

  /** Avança a casa para o próximo nível (salva e retorna novo nível). */
  function upgradeHouse() {
    const next = getHouseLevel() + 1;
    try { localStorage.setItem(STORAGE_KEY_HOUSE_LEVEL, String(next)); }
    catch { /* noop */ }
    return next;
  }

  /**
   * Calcula a taxa de estaleiro para uma viagem com o barco dado.
   * Retorna 0 se a casa suporta guardar esse tipo de barco.
   */
  function calcBoatFee(boatId) {
    if (!boatId) return 0;
    const vessel = (typeof VESSELS_CATALOG !== 'undefined')
      ? VESSELS_CATALOG.find(v => v.id === boatId) : null;
    if (!vessel) return 0;

    const houseData = (typeof HOUSE_LEVELS !== 'undefined')
      ? HOUSE_LEVELS[getHouseLevel()] : null;
    if (!houseData) return 0;

    // Casa suporta a categoria do barco → sem taxa
    if (houseData.boatTypes.includes(vessel.category)) return 0;

    // Barco de doca → usa dockFee do próprio barco
    if (vessel.category === 'dock') return vessel.dockFee || 0;

    // Portátil ou garagem → taxa fixa do BOATYARD_FEE
    const fees = (typeof BOATYARD_FEE !== 'undefined') ? BOATYARD_FEE : {};
    return fees[vessel.category] ?? 0;
  }


  /** Remove um item de um slot específico (rod/line/hook/float/bait). Slot fica null. */
  function unequipSlot(slot) {
    const equip = _loadEquip();
    if (!(slot in equip)) return false;
    equip[slot] = null;
    _saveEquip(equip);
    return true;
  }

  // ── Zone Map ─────────────────────────────────────────────────────────────

  function _loadZoneMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ZONEMAP) || '{}'); }
    catch { return {}; }
  }

  function _saveZoneMap(zm) {
    try { localStorage.setItem(STORAGE_KEY_ZONEMAP, JSON.stringify(zm)); }
    catch { /* noop */ }
  }

  /**
   * Revela uma zona para o jogador.
   * Se já conhecida, é idempotente.
   */
  function knowZone(mapId, zoneId) {
    const zm = _loadZoneMap();
    if (!zm[mapId]) zm[mapId] = [];
    if (!zm[mapId].includes(zoneId)) {
      zm[mapId].push(zoneId);
      _saveZoneMap(zm);
      return true; // revelação nova
    }
    return false; // já conhecia
  }

  /**
   * Retorna array de zoneIds conhecidos para um mapa.
   * Se nunca visitado, retorna [].
   */
  function getKnownZones(mapId) {
    const zm = _loadZoneMap();
    return zm[mapId] ? [...zm[mapId]] : [];
  }

  /**
   * Verifica se o jogador conhece uma zona específica.
   */
  function knowsZone(mapId, zoneId) {
    return getKnownZones(mapId).includes(zoneId);
  }

  /**
   * Retorna a zona ativa salva para um mapa (última usada).
   * Falha graciosamente para a primeira zona conhecida.
   */
  function getActiveZone(mapId) {
    try {
      const saved = JSON.parse(localStorage.getItem('bb_activezone') || '{}');
      return saved[mapId] || null;
    } catch { return null; }
  }

  /**
   * Salva a zona ativa para um mapa.
   */
  function setActiveZone(mapId, zoneId) {
    try {
      const saved = JSON.parse(localStorage.getItem('bb_activezone') || '{}');
      saved[mapId] = zoneId;
      localStorage.setItem('bb_activezone', JSON.stringify(saved));
    } catch { /* noop */ }
  }

  return {
    addFish,
    getAll,
    count,
    holdCapacity,
    holdUsed,
    hasHoldSpace,
    removeItem,
    sellItem,
    sellFishQty,
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
    unequipSlot,
    // Proteção
    isProtected,
    toggleProtect,
    // Venda na loja
    sellBaits,
    sellEquip,
    // Equipamentos possuídos
    addEquip,
    getOwnedEquip,
    // Barco ativo
    setActiveBoat,
    getActiveBoat,
    // Casa
    getHouseLevel,
    upgradeHouse,
    calcBoatFee,
    // Zone Map
    knowZone,
    getKnownZones,
    knowsZone,
    getActiveZone,
    setActiveZone,
  };
})();
