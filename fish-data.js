/**
 * fish-data.js — Bites & Baits
 * Catálogo global de espécies.
 *
 * physics:
 *   swimSpeed     → velocidade de nado em px/frame (decorativo)
 *   approachSpeed → velocidade ao se aproximar da isca
 *   wobble        → amplitude de ondulação vertical (px)
 *   wobbleFreq    → frequência da ondulação (rad/frame)
 *
 * habitat:
 *   'freshwater'  → água doce
 *   'saltwater'   → água salgada
 *   'both'        → suporta os dois
 *
 * weightRange: [min, max] em kg — dados reais da fauna brasileira
 *
 * baits:
 *   IDs de isca que aumentam chance de mordida.
 *   IDs: 'worm', 'cricket', 'fly', 'spoon', 'live_bait', 'shrimp', 'jig'
 *
 * stamina:
 *   Ticks de linha estática (peixe lutando) para cansar.
 *   Menor = cansa mais rápido. 1 tick ≈ 120ms.
 *
 * recovery:
 *   Milissegundos para o peixe recuperar o fôlego após cansar.
 *   Se o jogador não aproveitar a janela, o peixe volta à força total.
 *
 * escapePatience:
 *   Ticks totais de inércia do jogador antes de o peixe escapar.
 *   Conta continuamente no REELING — independente de cansaço.
 */

/**
 * Retorna o nome traduzido de um peixe no idioma ativo.
 * Usar sempre em vez de fish.name para evitar undefined.
 */
function fishName(fish) {
  return (typeof I18n !== 'undefined') ? I18n.t(fish.nameKey) : fish.nameKey;
}

const FISH_CATALOG = {
  lambari: {
    id: 'lambari',
    nameKey: 'fish_lambari',
    sprite: 'fish-lambari',
    spriteW: 52, spriteH: 26,
    size: 1,
    special: false,
    pull: 1.8,
    pullNeeded: 65,
    biteWindow: 4500,
    tiredBase: 3000,
    stamina: 6,          // cansa rápido — peixe pequeno
    recovery: 4000,      // recupera em 4s — mas pouca força de qualquer jeito
    escapePatience: 35,  // ~4s de inércia tolerada
    habitat: 'freshwater',
    weightRange: [0.02, 0.15],  // lambari real: 20–150g
    baits: ['worm', 'cricket'],
    physics: { swimSpeed: 1.2, approachSpeed: 2.0, wobble: 4,  wobbleFreq: 0.18 },
  },
  tilapia: {
    id: 'tilapia',
    nameKey: 'fish_tilapia',
    sprite: 'fish-tilapia',
    spriteW: 60, spriteH: 30,
    size: 1.5,
    special: false,
    pull: 3.5,
    pullNeeded: 95,
    biteWindow: 3500,
    tiredBase: 4500,
    stamina: 8,          // resistência média
    recovery: 5500,      // janela de 5.5s para aproveitar
    escapePatience: 45,  // ~5.4s
    habitat: 'freshwater',
    weightRange: [0.3, 2.5],
    baits: ['worm', 'live_bait', 'cricket'],
    physics: { swimSpeed: 0.9, approachSpeed: 1.5, wobble: 5,  wobbleFreq: 0.14 },
  },
  truta: {
    id: 'truta',
    nameKey: 'fish_truta',
    sprite: 'fish-truta',
    spriteW: 68, spriteH: 28,
    size: 2,
    special: false,
    pull: 5.5,
    pullNeeded: 125,
    biteWindow: 3000,
    tiredBase: 6000,
    stamina: 14,         // boa resistência
    recovery: 5500,      // janela de 5.5s
    escapePatience: 55,  // ~6.6s
    habitat: 'freshwater',
    weightRange: [0.5, 4.0],
    baits: ['fly', 'spoon', 'worm'],
    physics: { swimSpeed: 1.5, approachSpeed: 2.5, wobble: 6,  wobbleFreq: 0.16 },
  },
  dourado: {
    id: 'dourado',
    nameKey: 'fish_dourado',
    sprite: 'fish-dourado',
    spriteW: 76, spriteH: 34,
    size: 2.5,
    special: true,
    pull: 6.5,
    pullNeeded: 140,
    biteWindow: 2500,
    tiredBase: 9000,
    stamina: 18,         // difícil de cansar
    recovery: 7000,      // janela de 7s — aproveite o cansaço
    escapePatience: 65,  // ~7.8s
    habitat: 'freshwater',
    weightRange: [2.0, 20.0],
    baits: ['live_bait', 'spoon', 'jig'],
    physics: { swimSpeed: 1.8, approachSpeed: 3.0, wobble: 8,  wobbleFreq: 0.12 },
  },

  // ── Mapa 1: Margem do Lago ───────────────────────────────────────────
  cara: {
    id: 'cara',
    nameKey: 'fish_cara',
    sprite: 'fish-cara',
    spriteW: 56, spriteH: 28,
    size: 1.2,
    special: false,
    pull: 2.2,
    pullNeeded: 70,
    biteWindow: 4000,
    tiredBase: 3500,
    stamina: 7,
    recovery: 4500,
    escapePatience: 38,
    habitat: 'freshwater',
    weightRange: [0.08, 0.6],   // cara: 80g–600g
    baits: ['worm', 'cricket'],
    maps: ['lago_margem'],
    physics: { swimSpeed: 0.8, approachSpeed: 1.4, wobble: 4, wobbleFreq: 0.15 },
  },
  traira: {
    id: 'traira',
    nameKey: 'fish_traira',
    sprite: 'fish-traira',
    spriteW: 72, spriteH: 30,
    size: 2,
    special: false,
    pull: 5.0,
    pullNeeded: 115,
    biteWindow: 2800,
    tiredBase: 5500,
    stamina: 12,
    recovery: 6000,
    escapePatience: 50,
    habitat: 'freshwater',
    weightRange: [0.3, 3.5],
    baits: ['live_bait', 'spoon'],
    maps: ['lago_margem'],
    physics: { swimSpeed: 1.6, approachSpeed: 2.8, wobble: 7, wobbleFreq: 0.13 },
  },
  piau: {
    id: 'piau',
    nameKey: 'fish_piau',
    sprite: 'fish-piau',
    spriteW: 62, spriteH: 28,
    size: 1.5,
    special: false,
    pull: 3.0,
    pullNeeded: 85,
    biteWindow: 3200,
    tiredBase: 4000,
    stamina: 9,
    recovery: 5000,
    escapePatience: 42,
    habitat: 'freshwater',
    weightRange: [0.2, 1.8],
    baits: ['worm', 'fly'],   // seletivo — isca vegetal representada por fly
    maps: ['lago_margem'],
    physics: { swimSpeed: 1.0, approachSpeed: 1.6, wobble: 5, wobbleFreq: 0.14 },
  },
  curimbata: {
    id: 'curimbata',
    nameKey: 'fish_curimbata',
    sprite: 'fish-curimbata',
    spriteW: 66, spriteH: 30,
    size: 1.8,
    special: false,
    pull: 4.0,
    pullNeeded: 105,
    biteWindow: 3500,
    tiredBase: 5000,
    stamina: 11,
    recovery: 5500,
    escapePatience: 48,
    habitat: 'freshwater',
    weightRange: [0.4, 3.0],
    baits: ['worm', 'cricket'],
    maps: ['lago_margem'],
    physics: { swimSpeed: 0.7, approachSpeed: 1.2, wobble: 5, wobbleFreq: 0.12 },
  },
  tucunare: {
    id: 'tucunare',
    nameKey: 'fish_tucunare',
    sprite: 'fish-tucunare',
    spriteW: 78, spriteH: 34,
    size: 2.5,
    special: true,
    pull: 6.0,
    pullNeeded: 135,
    biteWindow: 2500,
    tiredBase: 8000,
    stamina: 17,
    recovery: 7000,
    escapePatience: 60,
    habitat: 'freshwater',
    weightRange: [0.5, 5.0],
    baits: ['live_bait', 'spoon', 'jig'],
    maps: ['lago_margem'],
    physics: { swimSpeed: 1.7, approachSpeed: 3.0, wobble: 9, wobbleFreq: 0.11 },
  },
  peixe_dourado_ornamental: {
    id: 'peixe_dourado_ornamental',
    nameKey: 'fish_peixe_dourado_ornamental',
    sprite: 'fish-peixe-dourado-ornamental',
    spriteW: 58, spriteH: 26,
    size: 1.2,
    special: true,
    pull: 2.5,
    pullNeeded: 75,
    biteWindow: 3000,
    tiredBase: 3500,
    stamina: 6,
    recovery: 4000,
    escapePatience: 30,   // frágil — linha estica rápido
    habitat: 'freshwater',
    weightRange: [0.05, 0.3],
    baits: ['fly', 'cricket'],
    maps: ['lago_margem'],
    physics: { swimSpeed: 1.4, approachSpeed: 2.0, wobble: 6, wobbleFreq: 0.20 },
  },
  pirarucu: {
    id: 'pirarucu',
    nameKey: 'fish_pirarucu',
    sprite: 'fish-pirarucu',
    spriteW: 96, spriteH: 40,
    size: 4,
    special: true,
    pull: 7.0,
    pullNeeded: 170,
    biteWindow: 2000,
    tiredBase: 14000,
    stamina: 22,         // resistência máxima — quase não cansa
    recovery: 9000,      // janela de 9s
    escapePatience: 80,  // ~9.6s — muito paciente mas implacável
    habitat: 'freshwater',
    weightRange: [20.0, 200.0],
    baits: ['live_bait', 'jig'],
    physics: { swimSpeed: 0.7, approachSpeed: 1.0, wobble: 10, wobbleFreq: 0.09 },
  },
};
