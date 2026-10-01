/**
 * last-catch-view.js — Bites & Baits
 *
 * Apresenta a captura como uma mensagem natural, sem pares de rótulo e valor.
 * O Game continua responsável por quando revelar ou focalizar o resumo.
 */

const LastCatchView = (() => {
  let _lastCatchInfo = null;

  function _sizeLabel(size) {
    return I18n.t(
      size <= 1 ? 'size_tiny' : size <= 2 ? 'size_small'
      : size <= 3 ? 'size_medium' : 'size_large'
    );
  }

  function _summaryData(info) {
    const fish = FISH_CATALOG[info.fishId];
    const map = info.mapId ? MAP_CATALOG[info.mapId] : null;
    const zone = map && info.zoneId
      ? map.zones?.find(item => item.id === info.zoneId) : null;

    return {
      fish: fish ? fishName(fish) : (info.fishName || info.fishId || ''),
      size: info.size != null ? _sizeLabel(info.size) : '',
      length: info.length != null ? `${info.length} cm` : '',
      weight: info.weight != null ? `${info.weight} kg` : '',
      rarity: info.specimenRarity || '',
      value: info.value != null ? info.value : '',
      location: [
        map ? I18n.t(map.nameKey) : null,
        zone ? I18n.t(zone.nameKey) : null,
      ].filter(Boolean).join(' — '),
      points: info.points != null ? info.points : '',
      score: info.score != null ? info.score : '',
    };
  }

  function render(info) {
    if (!info) return;
    _lastCatchInfo = info;
    const narrative = document.getElementById('last-catch-narrative');
    if (narrative) narrative.textContent = summaryText();
  }

  function summaryText() {
    if (!_lastCatchInfo) return I18n.t('last_catch_title');
    const key = _lastCatchInfo.mode === 'free'
      ? 'last_catch_readout_free' : 'last_catch_readout_story';
    return I18n.t(key, _summaryData(_lastCatchInfo));
  }

  return { render, summaryText };
})();
