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
    pull: 1.5,
    pullNeeded: 40,
    biteWindow: 4500,
    tiredBase: 3000,
    stamina: 8,          // cansa rápido — peixe pequeno
    recovery: 3000,      // recupera em 3s — mas pouca força de qualquer jeito
    escapePatience: 20,  // pouca paciência — foge rápido se ignorado
    habitat: 'freshwater',
    weightRange: [0.02, 0.12],
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
    pull: 3,
    pullNeeded: 60,
    biteWindow: 3500,
    tiredBase: 4500,
    stamina: 12,         // resistência média
    recovery: 4000,      // janela de 4s para aproveitar
    escapePatience: 28,  // um pouco mais paciente que o lambari
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
    pull: 5,
    pullNeeded: 80,
    biteWindow: 3000,
    tiredBase: 6000,
    stamina: 15,         // boa resistência
    recovery: 5000,      // janela de 5s
    escapePatience: 32,
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
    pull: 7,
    pullNeeded: 110,
    biteWindow: 2500,
    tiredBase: 9000,
    stamina: 20,         // difícil de cansar
    recovery: 6500,      // janela generosa, mas força é alta
    escapePatience: 38,
    habitat: 'freshwater',
    weightRange: [2.0, 20.0],
    baits: ['live_bait', 'spoon', 'jig'],
    physics: { swimSpeed: 1.8, approachSpeed: 3.0, wobble: 8,  wobbleFreq: 0.12 },
  },
  pirarucu: {
    id: 'pirarucu',
    nameKey: 'fish_pirarucu',
    sprite: 'fish-pirarucu',
    spriteW: 96, spriteH: 40,
    size: 4,
    special: true,
    pull: 10,
    pullNeeded: 150,
    biteWindow: 2000,
    tiredBase: 14000,
    stamina: 25,         // resistência máxima — quase não cansa
    recovery: 8000,      // janela de 8s, mas se recuperar a força é brutal
    escapePatience: 45,  // muito paciente — mas quando resolve ir, vai
    habitat: 'freshwater',
    weightRange: [20.0, 200.0],
    baits: ['live_bait', 'jig'],
    physics: { swimSpeed: 0.7, approachSpeed: 1.0, wobble: 10, wobbleFreq: 0.09 },
  },
};
