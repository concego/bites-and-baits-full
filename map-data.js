/**
 * map-data.js — Bites & Baits
 * Catálogo de mapas. Cada mapa define:
 *   - visual (classe CSS aplicada ao #scene)
 *   - pool de peixes com peso próprio por mapa (usado pelo CreatureProfile)
 *
 * O mesmo peixe pode ser raro num mapa e comum em outro.
 * Os pesos de cada mapa devem somar 1.0.
 */

const MAP_CATALOG = {
  rio_doce: {
    id: 'rio_doce',
    nameKey: 'map_rio_doce',
    sceneClass: 'map-rio-doce',
    fish: [
      { id: 'lambari',  weight: 0.40 },
      { id: 'tilapia',  weight: 0.35 },
      { id: 'truta',    weight: 0.14 },
      { id: 'dourado',  weight: 0.08 },
      { id: 'pirarucu', weight: 0.03 },
    ],
  },
  // Novos mapas aqui seguem o mesmo schema:
  // mapa_id: {
  //   id, nameKey, sceneClass,
  //   fish: [{ id, weight }, ...]
  // }
};

/** Cache de pools por mapa (evita recriar a cada sorteio) */
const _mapPools = {};

/** Retorna (ou cria) o CreatureProfile.pool para o mapa dado */
function _getPool(mapObj) {
  if (_mapPools[mapObj.id]) return _mapPools[mapObj.id];

  const profiles = mapObj.fish.map(entry => ({
    ...FISH_CATALOG[entry.id],
    weight: entry.weight,
  }));
  _mapPools[mapObj.id] = CreatureProfile.createPool(profiles);
  return _mapPools[mapObj.id];
}

/** Retorna o objeto de mapa ativo (padrão: rio_doce) */
function getActiveMap() {
  const saved = localStorage.getItem('bb_map') || 'rio_doce';
  return MAP_CATALOG[saved] || MAP_CATALOG['rio_doce'];
}

/** Sorteia uma espécie com base nos pesos do mapa via CreatureProfile */
function pickFishFromMap(mapObj) {
  return _getPool(mapObj).roll();
}
