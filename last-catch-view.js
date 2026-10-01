/**
 * last-catch-view.js — Bites & Baits
 *
 * Renderiza os dados da última captura e monta seu texto completo para o
 * leitor de tela. A decisão de quando exibir ou focalizar continua no Game.
 */

const LastCatchView = (() => {
  const $ = id => document.getElementById(id);
  let _lastCatchInfo = null;

  function render(info) {
    if (!info) return;
    _lastCatchInfo = info;
    const fish = FISH_CATALOG[info.fishId];
    const map = info.mapId ? MAP_CATALOG[info.mapId] : null;
    const zone = map && info.zoneId
      ? map.zones?.find(z => z.id === info.zoneId) : null;

    $('last-catch-fish').textContent = fish
      ? fishName(fish) : (info.fishName || info.fishId || '—');
    $('last-catch-size').textContent = I18n.t(
      info.size <= 1 ? 'size_tiny' : info.size <= 2 ? 'size_small'
      : info.size <= 3 ? 'size_medium' : 'size_large'
    );
    $('last-catch-weight').textContent = info.weight != null ? `${info.weight} kg` : '';
    $('last-catch-length').textContent = info.length != null ? `${info.length} cm` : '';
    $('last-catch-specimen-rarity').textContent = info.specimenRarity
      ? I18n.t(`inv_rarity_${info.specimenRarity}`) : '';
    $('last-catch-value').textContent = info.value != null ? `${info.value} 🪙` : '';
    $('last-catch-length-row').hidden = info.length == null;
    $('last-catch-specimen-rarity-row').hidden = !info.specimenRarity;
    $('last-catch-location').textContent = [
      map ? I18n.t(map.nameKey) : null,
      zone ? I18n.t(zone.nameKey) : null,
    ].filter(Boolean).join(' — ') || '—';
    $('last-catch-score').textContent = info.score != null ? String(info.score) : '';

    $('last-catch-size-row').hidden = info.size == null;
    $('last-catch-weight-row').hidden = info.weight == null;
    $('last-catch-value-row').hidden = info.value == null;
    $('last-catch-location-row').hidden = !map && !zone;
    $('last-catch-score-row').hidden = info.mode !== 'free';
  }

  function summaryText() {
    const value = id => $(id)?.textContent?.trim() || '';
    const info = _lastCatchInfo || {};
    const data = {
      fish: value('last-catch-fish'),
      size: value('last-catch-size'),
      length: value('last-catch-length'),
      weight: value('last-catch-weight'),
      rarity: info.specimenRarity || '',
      value: info.value != null ? info.value : '',
      location: value('last-catch-location'),
      points: info.points != null ? info.points : '',
      score: value('last-catch-score'),
    };
    const key = info.mode === 'free' ? 'last_catch_readout_free' : 'last_catch_readout_story';
    return I18n.t(key, data);
  }

  return { render, summaryText };
})();
