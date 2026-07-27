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

  lago_central: {
    id: 'lago_central',
    nameKey: 'map_lago_central',
    emoji:   '🌊',
    sceneClass: 'map-lago-central',
    requiredVessel: 'canoe',   // mínimo: canoa
    // Este mapa usa zonas de pesca — cada zona tem seu próprio fishByPeriod
    zones: [
      {
        id: 'raso',
        nameKey: 'zone_raso',
        emoji: '🪨',
        distanceSteps: 2,   // passos de remo até chegar
        fishByPeriod: {
          dawn:      [
            { id: 'cara',      weight: 0.45 },
            { id: 'lambari',   weight: 0.35 },
            { id: 'tilapia',   weight: 0.20 },
          ],
          morning:   [
            { id: 'lambari',   weight: 0.40 },
            { id: 'tilapia',   weight: 0.35 },
            { id: 'cara',      weight: 0.25 },
          ],
          afternoon: [
            { id: 'tilapia',   weight: 0.50 },
            { id: 'lambari',   weight: 0.30 },
            { id: 'cara',      weight: 0.20 },
          ],
          evening:   [
            { id: 'cara',      weight: 0.50 },
            { id: 'traira',    weight: 0.30 },
            { id: 'lambari',   weight: 0.20 },
          ],
        },
      },
      {
        id: 'meio',
        nameKey: 'zone_meio',
        emoji: '🌀',
        distanceSteps: 4,
        fishByPeriod: {
          dawn:      [
            { id: 'traira',    weight: 0.35 },
            { id: 'curimbata', weight: 0.30 },
            { id: 'piau',      weight: 0.20 },
            { id: 'tilapia',   weight: 0.15 },
          ],
          morning:   [
            { id: 'curimbata', weight: 0.35 },
            { id: 'piau',      weight: 0.30 },
            { id: 'tilapia',   weight: 0.20 },
            { id: 'traira',    weight: 0.15 },
          ],
          afternoon: [
            { id: 'piau',      weight: 0.40 },
            { id: 'curimbata', weight: 0.30 },
            { id: 'tilapia',   weight: 0.20 },
            { id: 'cara',      weight: 0.10 },
          ],
          evening:   [
            { id: 'traira',    weight: 0.40 },
            { id: 'piau',      weight: 0.30 },
            { id: 'curimbata', weight: 0.20 },
            { id: 'tucunare',  weight: 0.10 },
          ],
        },
      },
      {
        id: 'fundo',
        nameKey: 'zone_fundo',
        emoji: '🌑',
        distanceSteps: 6,
        fishByPeriod: {
          dawn:      [
            { id: 'tucunare',               weight: 0.40 },
            { id: 'traira',                 weight: 0.30 },
            { id: 'peixe_dourado_ornamental', weight: 0.30 },
          ],
          morning:   [
            { id: 'tucunare',               weight: 0.35 },
            { id: 'peixe_dourado_ornamental', weight: 0.35 },
            { id: 'traira',                 weight: 0.30 },
          ],
          afternoon: [
            { id: 'peixe_dourado_ornamental', weight: 0.45 },
            { id: 'tucunare',               weight: 0.35 },
            { id: 'curimbata',              weight: 0.20 },
          ],
          evening:   [
            { id: 'tucunare',               weight: 0.50 },
            { id: 'peixe_dourado_ornamental', weight: 0.35 },
            { id: 'traira',                 weight: 0.15 },
          ],
        },
      },
    ],
    // pool genérico fallback (caso sem zona ativa)
    fish: [
      { id: 'lambari',   weight: 0.20 },
      { id: 'tilapia',   weight: 0.20 },
      { id: 'curimbata', weight: 0.20 },
      { id: 'piau',      weight: 0.15 },
      { id: 'traira',    weight: 0.12 },
      { id: 'tucunare',  weight: 0.08 },
      { id: 'peixe_dourado_ornamental', weight: 0.05 },
    ],
  },};

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

/** Sorteia um peixe da zona de barco ativa */
function pickFishFromZone(zone) {
  if (!zone) return null;
  const period     = (typeof GameTime !== 'undefined') ? GameTime.period() : 'morning';
  const poolSource = zone.fishByPeriod?.[period] || zone.fishByPeriod?.morning || [];
  if (!poolSource.length) return null;
  const cacheKey = 'zone_' + zone.id + '_' + period;
  if (!_mapPools[cacheKey]) {
    const profiles = poolSource.map(e => ({ ...FISH_CATALOG[e.id], weight: e.weight }));
    _mapPools[cacheKey] = CreatureProfile.createPool(profiles);
  }
  return _mapPools[cacheKey].roll();
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
