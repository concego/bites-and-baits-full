/**
 * map-data.js — Bites & Baits
 * Pools finitos de peixes por mapa/zona.
 *
 * rarity e role são contextuais: a mesma espécie pode ser comum, rara ou
 * boss dependendo do local. Os pesos de cada pool somam 1.0.
 */

const MAP_CATALOG = {
  margem_rio_doce: {
    id: 'margem_rio_doce', nameKey: 'map_margem_rio_doce', emoji: '🏞️',
    sceneClass: 'map-margem-rio-doce', allowedBoats: [], requiredRod: 'rod_medium', maxZones: 1,
    zones: [{ id: 'margem', nameKey: 'zone_margem_rio_doce', emoji: '🏞️' }],
    initialZones: ['margem'],
    fish: [
      { id: 'lambari',       weight: 0.28, rarity: 'common',    role: 'common' },
      { id: 'piau',          weight: 0.18, rarity: 'common',    role: 'common' },
      { id: 'tilapia',       weight: 0.17, rarity: 'common',    role: 'common' },
      { id: 'curimbata',     weight: 0.12, rarity: 'common',    role: 'common' },
      { id: 'traira',        weight: 0.12, rarity: 'uncommon',  role: 'uncommon' },
      { id: 'traira_grande', weight: 0.08, rarity: 'rare',      role: 'rare' },
      { id: 'dourado',       weight: 0.05, rarity: 'legendary', role: 'boss' },
    ],
  },

  rio_doce: {
    id: 'rio_doce', nameKey: 'map_rio_doce', emoji: '🏞️',
    sceneClass: 'map-rio-doce', allowedBoats: ['barco_aluminio', 'lancha'],
    requiredRod: 'rod_medium', maxZones: 4,
    zones: [
      { id: 'correnteza_baixa', nameKey: 'zone_correnteza_baixa', emoji: '🌊' },
      { id: 'remanso',          nameKey: 'zone_remanso',          emoji: '🌀' },
      { id: 'poco_profundo',    nameKey: 'zone_poco_profundo',    emoji: '🕳️', hidden: true },
      { id: 'encontro_aguas',   nameKey: 'zone_encontro_aguas',   emoji: '🔀', hidden: true },
    ],
    initialZones: ['correnteza_baixa', 'remanso'],
    fishByZone: {
      correnteza_baixa: [
        { id: 'curimbata', weight: 0.25, rarity: 'common',    role: 'common' },
        { id: 'piau',      weight: 0.20, rarity: 'common',    role: 'common' },
        { id: 'traira',    weight: 0.18, rarity: 'common',    role: 'common' },
        { id: 'dourado',   weight: 0.12, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'tilapia',   weight: 0.12, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'pintado',   weight: 0.08, rarity: 'rare',      role: 'rare' },
        { id: 'jau',       weight: 0.05, rarity: 'legendary', role: 'boss' },
      ],
      remanso: [
        { id: 'piau',      weight: 0.24, rarity: 'common',    role: 'common' },
        { id: 'tilapia',   weight: 0.20, rarity: 'common',    role: 'common' },
        { id: 'curimbata', weight: 0.19, rarity: 'common',    role: 'common' },
        { id: 'traira',    weight: 0.12, rarity: 'common',    role: 'common' },
        { id: 'dourado',   weight: 0.12, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'pintado',   weight: 0.07, rarity: 'rare',      role: 'rare' },
        { id: 'jau',       weight: 0.06, rarity: 'legendary', role: 'boss' },
      ],
      poco_profundo: [
        { id: 'curimbata', weight: 0.28, rarity: 'common',    role: 'common' },
        { id: 'traira',    weight: 0.25, rarity: 'common',    role: 'common' },
        { id: 'piau',      weight: 0.15, rarity: 'common',    role: 'common' },
        { id: 'dourado',   weight: 0.14, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'tilapia',   weight: 0.08, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'pintado',   weight: 0.06, rarity: 'rare',      role: 'rare' },
        { id: 'jau',       weight: 0.04, rarity: 'legendary', role: 'boss' },
      ],
      encontro_aguas: [
        { id: 'piau',      weight: 0.22, rarity: 'common',    role: 'common' },
        { id: 'traira',    weight: 0.20, rarity: 'common',    role: 'common' },
        { id: 'tilapia',   weight: 0.18, rarity: 'common',    role: 'common' },
        { id: 'curimbata', weight: 0.15, rarity: 'common',    role: 'common' },
        { id: 'dourado',   weight: 0.12, rarity: 'uncommon',  role: 'uncommon' },
        { id: 'pintado',   weight: 0.08, rarity: 'rare',      role: 'rare' },
        { id: 'jau',       weight: 0.05, rarity: 'legendary', role: 'boss' },
      ],
    },
    fish: [
      { id: 'curimbata', weight: 0.25, rarity: 'common', role: 'common' },
      { id: 'piau',      weight: 0.20, rarity: 'common', role: 'common' },
      { id: 'traira',    weight: 0.18, rarity: 'common', role: 'common' },
      { id: 'dourado',   weight: 0.12, rarity: 'uncommon', role: 'uncommon' },
      { id: 'tilapia',   weight: 0.12, rarity: 'uncommon', role: 'uncommon' },
      { id: 'pintado',   weight: 0.08, rarity: 'rare', role: 'rare' },
      { id: 'jau',       weight: 0.05, rarity: 'legendary', role: 'boss' },
    ],
  },

  lago_margem: {
    id: 'lago_margem', nameKey: 'map_lago_margem', emoji: '🏕️',
    sceneClass: 'map-lago-margem', allowedBoats: [], maxZones: 1,
    zones: [{ id: 'margem', nameKey: 'zone_margem', emoji: '🏕️' }],
    initialZones: ['margem'],
    fish: [
      { id: 'lambari',                  weight: 0.25, rarity: 'common',    role: 'common' },
      { id: 'tilapia',                  weight: 0.20, rarity: 'common',    role: 'common' },
      { id: 'cara',                     weight: 0.18, rarity: 'common',    role: 'common' },
      { id: 'piau',                     weight: 0.15, rarity: 'common',    role: 'common' },
      { id: 'curimbata',                weight: 0.10, rarity: 'uncommon',  role: 'uncommon' },
      { id: 'traira',                   weight: 0.07, rarity: 'uncommon',  role: 'uncommon' },
      { id: 'peixe_dourado_ornamental', weight: 0.03, rarity: 'rare',      role: 'rare' },
      { id: 'traira',                   weight: 0.02, rarity: 'legendary', role: 'boss' },
    ],
  },

  lago_central: {
    id: 'lago_central', nameKey: 'map_lago_central', emoji: '🚣',
    sceneClass: 'map-lago-central', allowedBoats: ['canoe', 'barco_aluminio', 'lancha'],
    maxZones: 4,
    zones: [
      { id: 'raso',          nameKey: 'zone_raso',          emoji: '🌊' },
      { id: 'meio',          nameKey: 'zone_meio',          emoji: '🌀' },
      { id: 'fundo',         nameKey: 'zone_fundo',         emoji: '🌑', hidden: true },
      { id: 'baia_isolada',  nameKey: 'zone_baia_isolada',  emoji: '🏝️', hidden: true },
    ],
    initialZones: ['raso', 'meio'],
    fishByZone: {
      raso: [
        { id: 'lambari', weight: 0.35, rarity: 'common', role: 'common' },
        { id: 'tilapia', weight: 0.25, rarity: 'common', role: 'common' },
        { id: 'cara',    weight: 0.20, rarity: 'common', role: 'common' },
        { id: 'piau',    weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
        { id: 'curimbata', weight: 0.06, rarity: 'rare', role: 'rare' },
        { id: 'traira',  weight: 0.04, rarity: 'legendary', role: 'boss' },
      ],
      meio: [
        { id: 'piau', weight: 0.25, rarity: 'common', role: 'common' },
        { id: 'curimbata', weight: 0.20, rarity: 'common', role: 'common' },
        { id: 'tilapia', weight: 0.20, rarity: 'common', role: 'common' },
        { id: 'traira', weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
        { id: 'dourado', weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
        { id: 'tucunare', weight: 0.10, rarity: 'rare', role: 'rare' },
        { id: 'dourado', weight: 0.05, rarity: 'legendary', role: 'boss' },
      ],
      fundo: [
        { id: 'curimbata', weight: 0.30, rarity: 'common', role: 'common' },
        { id: 'traira', weight: 0.25, rarity: 'common', role: 'common' },
        { id: 'tucunare', weight: 0.20, rarity: 'common', role: 'common' },
        { id: 'cara', weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
        { id: 'pintado', weight: 0.10, rarity: 'rare', role: 'rare' },
        { id: 'pirarucu', weight: 0.05, rarity: 'legendary', role: 'boss' },
      ],
      // Nome e pool provisórios até definirmos a história desta área.
      baia_isolada: [
        { id: 'curimbata', weight: 0.25, rarity: 'common', role: 'common' },
        { id: 'cara', weight: 0.20, rarity: 'common', role: 'common' },
        { id: 'piau', weight: 0.15, rarity: 'common', role: 'common' },
        { id: 'tilapia', weight: 0.15, rarity: 'common', role: 'common' },
        { id: 'traira', weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
        { id: 'tucunare', weight: 0.08, rarity: 'uncommon', role: 'uncommon' },
        { id: 'peixe_dourado_ornamental', weight: 0.04, rarity: 'rare', role: 'rare' },
        { id: 'dourado', weight: 0.03, rarity: 'legendary', role: 'boss' },
      ],
    },
    fish: [
      { id: 'lambari', weight: 0.35, rarity: 'common', role: 'common' },
      { id: 'tilapia', weight: 0.25, rarity: 'common', role: 'common' },
      { id: 'cara', weight: 0.20, rarity: 'common', role: 'common' },
      { id: 'piau', weight: 0.10, rarity: 'uncommon', role: 'uncommon' },
      { id: 'curimbata', weight: 0.06, rarity: 'rare', role: 'rare' },
      { id: 'traira', weight: 0.04, rarity: 'legendary', role: 'boss' },
    ],
  },
};

const MAPS = Object.values(MAP_CATALOG);
const _mapPools = {};

function _profilePool(mapId, zoneId, cacheKey, source) {
  if (_mapPools[cacheKey]) return _mapPools[cacheKey];
  const profiles = source.map(entry => ({
    ...FISH_CATALOG[entry.id],
    ...entry,
    mapId,
    zoneId: zoneId || null,
    special: entry.role === 'rare' || entry.role === 'boss',
  }));
  _mapPools[cacheKey] = CreatureProfile.createPool(profiles);
  return _mapPools[cacheKey];
}

function getActiveMap() {
  const saved = localStorage.getItem('bb_map') || 'lago_margem';
  return MAP_CATALOG[saved] || MAP_CATALOG['rio_doce'];
}

function pickFishFromMap(mapObj, zoneId) {
  let source = mapObj.fish;
  let cacheKey = `${mapObj.id}_default`;
  if (mapObj.fishByZone && zoneId && mapObj.fishByZone[zoneId]) {
    source = mapObj.fishByZone[zoneId];
    cacheKey = `${mapObj.id}_zone_${zoneId}`;
  }
  return _profilePool(mapObj.id, zoneId, cacheKey, source || []).roll();
}
