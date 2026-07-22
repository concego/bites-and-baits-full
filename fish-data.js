/**
 * fish-data.js — Bites & Baits
 * Catálogo global de espécies. O peso (weight) fica no mapa, não aqui.
 * Cada espécie define comportamento, física e aparência.
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
 * baits:
 *   Array de IDs de isca que aumentam chance de mordida.
 *   IDs disponíveis: 'worm', 'cricket', 'fly', 'spoon', 'live_bait', 'shrimp', 'jig'
 *   (o sistema de iscas vai consumir esses IDs — manter coerentes)
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
    habitat: 'freshwater',
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
    habitat: 'freshwater',
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
    habitat: 'freshwater',
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
    habitat: 'freshwater',
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
    habitat: 'freshwater',
    baits: ['live_bait', 'jig'],
    physics: { swimSpeed: 0.7, approachSpeed: 1.0, wobble: 10, wobbleFreq: 0.09 },
  },
};
