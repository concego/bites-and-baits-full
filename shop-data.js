/**
 * shop-data.js — Bites & Baits
 * Catálogo da loja: iscas e equipamentos disponíveis para compra.
 *
 * Cada item tem:
 *   id        — chave única
 *   type      — 'bait' | 'rod' | 'line' | 'hook' | 'float'
 *   nameKey   — chave i18n
 *   descKey   — chave i18n (descrição curta)
 *   emoji     — ícone
 *   price     — custo em moedas
 *   qty       — quantidade que vem por compra (iscas: pacote; equipamento: 1)
 *   stock     — null = ilimitado; number = unidades disponíveis (itens raros)
 *
 * Equipamentos também têm:
 *   tier      — 1..5 (nível de progressão)
 *   modifiers — objeto com multiplicadores aplicados no combate
 *     pullMult    — multiplica a força de puxada do jogador (vara)
 *     snapReduct  — reduz chance de snap (linha)
 *     biteWindow  — multiplica a janela de fisgada (boia)
 *     hookRate    — multiplica a taxa de fisgada (anzol)
 */

const SHOP_CATALOG = [

  // ── ISCAS ──────────────────────────────────────────────────────────────
  {
    id: 'worm',      type: 'bait', nameKey: 'bait_worm',      descKey: 'shop_desc_worm',
    emoji: '🪱', price: 5,  qty: 5,  stock: null,
  },
  {
    id: 'cricket',   type: 'bait', nameKey: 'bait_cricket',   descKey: 'shop_desc_cricket',
    emoji: '🦗', price: 5,  qty: 5,  stock: null,
  },
  {
    id: 'fly',       type: 'bait', nameKey: 'bait_fly',       descKey: 'shop_desc_fly',
    emoji: '🪰', price: 8,  qty: 5,  stock: null,
  },
  {
    id: 'spoon',     type: 'bait', nameKey: 'bait_spoon',     descKey: 'shop_desc_spoon',
    emoji: '🥄', price: 12, qty: 3,  stock: null,
  },
  {
    id: 'live_bait', type: 'bait', nameKey: 'bait_live_bait', descKey: 'shop_desc_live_bait',
    emoji: '🐟', price: 15, qty: 3,  stock: null,
  },
  {
    id: 'shrimp',    type: 'bait', nameKey: 'bait_shrimp',    descKey: 'shop_desc_shrimp',
    emoji: '🦐', price: 18, qty: 3,  stock: null,
  },
  {
    id: 'jig',       type: 'bait', nameKey: 'bait_jig',       descKey: 'shop_desc_jig',
    emoji: '🎣', price: 20, qty: 2,  stock: null,
  },

  // ── VARAS ──────────────────────────────────────────────────────────────
  {
    id: 'rod_basic',    type: 'rod',  nameKey: 'rod_basic',    descKey: 'shop_desc_rod_basic',
    emoji: '🎋', price: 0,   qty: 1, stock: null, tier: 1,
    modifiers: { pullMult: 1.0, snapReduct: 0 },
  },
  {
    id: 'rod_medium',   type: 'rod',  nameKey: 'rod_medium',   descKey: 'shop_desc_rod_medium',
    emoji: '🎋', price: 80,  qty: 1, stock: null, tier: 2,
    modifiers: { pullMult: 1.3, snapReduct: 0.05 },
  },
  {
    id: 'rod_carbon',   type: 'rod',  nameKey: 'rod_carbon',   descKey: 'shop_desc_rod_carbon',
    emoji: '🎋', price: 200, qty: 1, stock: null, tier: 3,
    modifiers: { pullMult: 1.7, snapReduct: 0.10 },
  },
  {
    id: 'rod_pro',      type: 'rod',  nameKey: 'rod_pro',      descKey: 'shop_desc_rod_pro',
    emoji: '🎋', price: 420, qty: 1, stock: null, tier: 4,
    modifiers: { pullMult: 2.1, snapReduct: 0.15 },
  },
  {
    id: 'rod_master',   type: 'rod',  nameKey: 'rod_master',   descKey: 'shop_desc_rod_master',
    emoji: '🎋', price: 800, qty: 1, stock: null, tier: 5,
    modifiers: { pullMult: 2.6, snapReduct: 0.20 },
  },

  // ── LINHAS ─────────────────────────────────────────────────────────────
  {
    id: 'line_mono',    type: 'line', nameKey: 'line_mono',    descKey: 'shop_desc_line_mono',
    emoji: '🧵', price: 0,   qty: 1, stock: null, tier: 1,
    modifiers: { snapReduct: 0 },
  },
  {
    id: 'line_fluoro',  type: 'line', nameKey: 'line_fluoro',  descKey: 'shop_desc_line_fluoro',
    emoji: '🧵', price: 60,  qty: 1, stock: null, tier: 2,
    modifiers: { snapReduct: 0.10 },
  },
  {
    id: 'line_braided', type: 'line', nameKey: 'line_braided', descKey: 'shop_desc_line_braided',
    emoji: '🧵', price: 150, qty: 1, stock: null, tier: 3,
    modifiers: { snapReduct: 0.22 },
  },
  {
    id: 'line_dyneema', type: 'line', nameKey: 'line_dyneema', descKey: 'shop_desc_line_dyneema',
    emoji: '🧵', price: 350, qty: 1, stock: null, tier: 4,
    modifiers: { snapReduct: 0.35 },
  },

  // ── ANZÓIS ─────────────────────────────────────────────────────────────
  {
    id: 'hook_basic',   type: 'hook', nameKey: 'hook_basic',   descKey: 'shop_desc_hook_basic',
    emoji: '🪝', price: 0,  qty: 1, stock: null, tier: 1,
    modifiers: { hookRate: 1.0 },
  },
  {
    id: 'hook_offset',  type: 'hook', nameKey: 'hook_offset',  descKey: 'shop_desc_hook_offset',
    emoji: '🪝', price: 40, qty: 1, stock: null, tier: 2,
    modifiers: { hookRate: 1.25 },
  },
  {
    id: 'hook_treble',  type: 'hook', nameKey: 'hook_treble',  descKey: 'shop_desc_hook_treble',
    emoji: '🪝', price: 90, qty: 1, stock: null, tier: 3,
    modifiers: { hookRate: 1.55 },
  },

  // ── BOIAS ──────────────────────────────────────────────────────────────
  {
    id: 'float_basic',   type: 'float', nameKey: 'float_basic',   descKey: 'shop_desc_float_basic',
    emoji: '🎈', price: 0,  qty: 1, stock: null, tier: 1,
    modifiers: { biteWindow: 1.0 },
  },
  {
    id: 'float_sensitive', type: 'float', nameKey: 'float_sensitive', descKey: 'shop_desc_float_sensitive',
    emoji: '🎈', price: 50, qty: 1, stock: null, tier: 2,
    modifiers: { biteWindow: 1.4 },
  },
  {
    id: 'float_pro',     type: 'float', nameKey: 'float_pro',     descKey: 'shop_desc_float_pro',
    emoji: '🎈', price: 130, qty: 1, stock: null, tier: 3,
    modifiers: { biteWindow: 1.9 },
  },

  // ── BARCOS (Estaleiro) ──────────────────────────────────────────────
  {
    id: 'canoe',    type: 'boat', nameKey: 'boat_canoe',    descKey: 'shop_desc_canoe',
    emoji: '🛶', price: 120, qty: 1, stock: null,
    holdCapacity: 8,
    unlocks: ['lago_central'],
  },
  {
    id: 'rowboat',  type: 'boat', nameKey: 'boat_rowboat',  descKey: 'shop_desc_rowboat',
    emoji: '⛵', price: 350, qty: 1, stock: null,
    holdCapacity: 15,
    unlocks: ['lago_central'],
  },
];

/** Retorna um item do catálogo pelo id */
function getShopItem(id) {
  return SHOP_CATALOG.find(i => i.id === id) ?? null;
}

/** Retorna todos os itens de um tipo */
function getShopByType(type) {
  return SHOP_CATALOG.filter(i => i.type === type);
}