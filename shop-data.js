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

  // ── CESTOS PARA PESCA DA MARGEM ─────────────────────────────────────────
  // Cestos só limitam a carga quando nenhum barco está ativo.
  {
    id: 'basket_basic',      type: 'basket', nameKey: 'shop_name_basket_basic',
    descKey: 'shop_desc_basket_basic', emoji: '🧺', price: 0,   qty: 1,
    stock: null, tier: 1, holdCap: 8,
  },
  {
    id: 'basket_reinforced', type: 'basket', nameKey: 'shop_name_basket_reinforced',
    descKey: 'shop_desc_basket_reinforced', emoji: '🧺', price: 60,  qty: 1,
    stock: null, tier: 2, holdCap: 12,
  },
  {
    id: 'basket_large',      type: 'basket', nameKey: 'shop_name_basket_large',
    descKey: 'shop_desc_basket_large', emoji: '🧺', price: 150, qty: 1,
    stock: null, tier: 3, holdCap: 16,
  },

  // ── VARAS ──────────────────────────────────────────────────────────────
  {
    id: 'rod_basic',    type: 'rod',  nameKey: 'shop_name_rod_basic',    descKey: 'shop_desc_rod_basic',
    emoji: '🎋', price: 0,   qty: 1, stock: null, tier: 1,
    modifiers: { pullMult: 1.0, snapReduct: 0 },
  },
  {
    id: 'rod_medium',   type: 'rod',  nameKey: 'shop_name_rod_medium',   descKey: 'shop_desc_rod_medium',
    emoji: '🎋', price: 80,  qty: 1, stock: null, tier: 2,
    modifiers: { pullMult: 1.3, snapReduct: 0.05 },
  },
  {
    id: 'rod_carbon',   type: 'rod',  nameKey: 'shop_name_rod_carbon',   descKey: 'shop_desc_rod_carbon',
    emoji: '🎋', price: 200, qty: 1, stock: null, tier: 3,
    modifiers: { pullMult: 1.7, snapReduct: 0.10 },
  },
  {
    id: 'rod_pro',      type: 'rod',  nameKey: 'shop_name_rod_pro',      descKey: 'shop_desc_rod_pro',
    emoji: '🎋', price: 420, qty: 1, stock: null, tier: 4,
    modifiers: { pullMult: 2.1, snapReduct: 0.15 },
  },
  {
    id: 'rod_master',   type: 'rod',  nameKey: 'shop_name_rod_master',   descKey: 'shop_desc_rod_master',
    emoji: '🎋', price: 800, qty: 1, stock: null, tier: 5,
    modifiers: { pullMult: 2.6, snapReduct: 0.20 },
  },

  // ── LINHAS ─────────────────────────────────────────────────────────────
  {
    id: 'line_mono',    type: 'line', nameKey: 'shop_name_line_mono',    descKey: 'shop_desc_line_mono',
    emoji: '🧵', price: 0,   qty: 1, stock: null, tier: 1,
    modifiers: { snapReduct: 0 },
  },
  {
    id: 'line_fluoro',  type: 'line', nameKey: 'shop_name_line_fluoro',  descKey: 'shop_desc_line_fluoro',
    emoji: '🧵', price: 60,  qty: 1, stock: null, tier: 2,
    modifiers: { snapReduct: 0.10 },
  },
  {
    id: 'line_braided', type: 'line', nameKey: 'shop_name_line_braid', descKey: 'shop_desc_line_braid',
    emoji: '🧵', price: 150, qty: 1, stock: null, tier: 3,
    modifiers: { snapReduct: 0.22 },
  },
  {
    id: 'line_dyneema', type: 'line', nameKey: 'shop_name_line_dyneema', descKey: 'shop_desc_line_dyneema',
    emoji: '🧵', price: 350, qty: 1, stock: null, tier: 4,
    modifiers: { snapReduct: 0.35 },
  },

  // ── ANZÓIS ─────────────────────────────────────────────────────────────
  {
    id: 'hook_basic',   type: 'hook', nameKey: 'shop_name_hook_basic',   descKey: 'shop_desc_hook_basic',
    emoji: '🪝', price: 0,  qty: 1, stock: null, tier: 1,
    modifiers: { hookRate: 1.0 },
  },
  {
    id: 'hook_offset',  type: 'hook', nameKey: 'shop_name_hook_circle',  descKey: 'shop_desc_hook_circle',
    emoji: '🪝', price: 40, qty: 1, stock: null, tier: 2,
    modifiers: { hookRate: 1.25 },
  },
  {
    id: 'hook_treble',  type: 'hook', nameKey: 'shop_name_hook_treble',  descKey: 'shop_desc_hook_treble',
    emoji: '🪝', price: 90, qty: 1, stock: null, tier: 3,
    modifiers: { hookRate: 1.55 },
  },

  // ── BOIAS ──────────────────────────────────────────────────────────────
  {
    id: 'float_basic',   type: 'float', nameKey: 'shop_name_float_basic',   descKey: 'shop_desc_float_basic',
    emoji: '🎈', price: 0,  qty: 1, stock: null, tier: 1,
    modifiers: { biteWindow: 1.0 },
  },
  {
    id: 'float_sensitive', type: 'float', nameKey: 'shop_name_float_sensor', descKey: 'shop_desc_float_sensor',
    emoji: '🎈', price: 50, qty: 1, stock: null, tier: 2,
    modifiers: { biteWindow: 1.4 },
  },
  {
    id: 'float_pro',     type: 'float', nameKey: 'shop_name_float_pro',     descKey: 'shop_desc_float_pro',
    emoji: '🎈', price: 130, qty: 1, stock: null, tier: 3,
    modifiers: { biteWindow: 1.9 },
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


// ── EMBARCAÇÕES ────────────────────────────────────────────────────────────
// category: 'portable' | 'garage' | 'dock'
// dockFee: taxa/viagem para barcos de doca (quando sem doca privada na casa)
const VESSELS_CATALOG = [
  {
    id:       'canoe',
    nameKey:  'boat_canoe',
    descKey:  'shop_desc_canoe',
    emoji:    '🛶',
    price:    200,
    holdCap:  8,
    category: 'portable',
    dockFee:  0,
  },
  {
    id:       'barco_aluminio',
    nameKey:  'boat_barco_aluminio',
    descKey:  'shop_desc_barco_aluminio',
    emoji:    '🛥️',
    price:    850,
    holdCap:  20,
    category: 'portable',
    dockFee:  0,
  },
  {
    id:       'lancha',
    nameKey:  'boat_lancha',
    descKey:  'shop_desc_lancha',
    emoji:    '🚤',
    price:    1500,
    holdCap:  30,
    category: 'garage',
    dockFee:  0,
  },
  {
    id:       'veleiro',
    nameKey:  'boat_veleiro',
    descKey:  'shop_desc_veleiro',
    emoji:    '⛵',
    price:    3000,
    holdCap:  50,
    category: 'garage',
    dockFee:  0,
  },
  {
    id:       'iate',
    nameKey:  'boat_iate',
    descKey:  'shop_desc_iate',
    emoji:    '🛥️',
    price:    8000,
    holdCap:  100,
    category: 'dock',
    dockFee:  300,
  },
  {
    id:       'navio_pesca',
    nameKey:  'boat_navio_pesca',
    descKey:  'shop_desc_navio_pesca',
    emoji:    '🚢',
    price:    20000,
    holdCap:  250,
    category: 'dock',
    dockFee:  700,
  },
];

function getVessel(id) {
  return VESSELS_CATALOG.find(v => v.id === id) ?? null;
}
