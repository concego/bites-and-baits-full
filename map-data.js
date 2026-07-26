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
    emoji:   '🏞️',
    sceneClass: 'map-rio-doce',
    fish: [
      { id: 'lambari',  weight: 0.40 },
      { id: 'tilapia',  weight: 0.35 },
      { id: 'truta',    weight: 0.14 },
      { id: 'dourado',  weight: 0.08 },
      { id: 'pirarucu', weight: 0.03 },
    ],
  },

  lago_margem: {
    id: 'lago_margem',
    nameKey: 'map_lago_margem',
    emoji:   '🏕️',
    sceneClass: 'map-lago-margem',
    requiredVessel: null,   // sem barco — pesca da margem
    // Pools separados por período do dia
    // O pool ativo é escolhido em pickFishFromMap() via GameTime.period()
    fishByPeriod: {
      // madrugada (00–05): predadores noturnos dominam
      dawn:    [
        { id: 'traira',                 weight: 0.40 },
        { id: 'tucunare',               weight: 0.20 },
        { id: 'cara',                   weight: 0.20 },
        { id: 'curimbata',              weight: 0.12 },
        { id: 'peixe_dourado_ornamental', weight: 0.08 },
      ],
      // manhã (06–11): melhor janela geral
      morning: [
        { id: 'lambari',                weight: 0.30 },
        { id: 'tilapia',                weight: 0.25 },
        { id: 'cara',                   weight: 0.18 },
        { id: 'piau',                   weight: 0.12 },
        { id: 'curimbata',              weight: 0.08 },
        { id: 'traira',                 weight: 0.05 },
        { id: 'peixe_dourado_ornamental', weight: 0.02 },
      ],
      // tarde (12–17): calor — peixes de fundo
      afternoon: [
        { id: 'curimbata',              weight: 0.32 },
        { id: 'cara',                   weight: 0.28 },
        { id: 'tilapia',                weight: 0.20 },
        { id: 'piau',                   weight: 0.12 },
        { id: 'lambari',                weight: 0.08 },
      ],
      // noite (18–23): tucunaré acorda
      evening: [
        { id: 'tucunare',               weight: 0.28 },
        { id: 'traira',                 weight: 0.25 },
        { id: 'tilapia',                weight: 0.18 },
        { id: 'cara',                   weight: 0.14 },
        { id: 'curimbata',              weight: 0.10 },
        { id: 'peixe_dourado_ornamental', weight: 0.05 },
      ],
    },
    // Pool fallback (sem sistema de tempo ativo)
    fish: [
      { id: 'lambari',                weight: 0.28 },
      { id: 'tilapia',                weight: 0.22 },
      { id: 'cara',                   weight: 0.18 },
      { id: 'piau',                   weight: 0.12 },
      { id: 'curimbata',              weight: 0.10 },
      { id: 'traira',                 weight: 0.06 },
      { id: 'tucunare',               weight: 0.03 },
      { id: 'peixe_dourado_ornamental', weight: 0.01 },
    ],
  },
  // Novos mapas aqui seguem o mesmo schema:
  // mapa_id: {
  //   id, nameKey, sceneClass,
  //   fish: [{ id, weight }, ...]
  // }
};

/** Array ordenado de mapas para UI (renderTravel, etc.) */
const MAPS = Object.values(MAP_CATALOG);

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
  const saved = localStorage.getItem('bb_map') || 'lago_margem';
  return MAP_CATALOG[saved] || MAP_CATALOG['rio_doce'];
}

/** Sorteia uma espécie com base nos pesos do mapa via CreatureProfile.
 *  Se o mapa tiver fishByPeriod e o sistema de tempo estiver ativo,
 *  usa o pool do período atual; caso contrário usa o pool genérico (fish).
 */
function pickFishFromMap(mapObj) {
  let poolSource = mapObj.fish;
  if (mapObj.fishByPeriod && typeof GameTime !== 'undefined') {
    const period = GameTime.period();            // 'dawn'|'morning'|'afternoon'|'evening'
    poolSource = mapObj.fishByPeriod[period] || mapObj.fish;
  }
  // Gera chave de cache incluindo o período
  const cacheKey = mapObj.id + '_' + (
    (mapObj.fishByPeriod && typeof GameTime !== 'undefined')
      ? GameTime.period() : 'default'
  );
  if (!_mapPools[cacheKey]) {
    const profiles = poolSource.map(entry => ({
      ...FISH_CATALOG[entry.id],
      weight: entry.weight,
    }));
    _mapPools[cacheKey] = CreatureProfile.createPool(profiles);
  }
  return _mapPools[cacheKey].roll();
}
