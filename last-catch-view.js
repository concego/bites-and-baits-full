/**
 * last-catch-view.js — Bites & Baits
 *
 * Renderiza os dados da última captura e monta seu texto completo para o
 * leitor de tela. A decisão de quando exibir ou focalizar continua no Game.
 */

const LastCatchView = (() => {
  const $ = id => document.getElementById(id);

  function render(info) {
    if (!info) return;
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
    $('last-catch-value').textContent = info.value != null ? `${info.value} 🪙` : '';
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
    const parts = [I18n.t('last_catch_title')];
    const add = (labelKey, elementId, rowId) => {
      const row = $(rowId);
      const value = $(elementId)?.textContent?.trim();
      if (value && !row?.hidden) parts.push(`${I18n.t(labelKey)}: ${value}`);
    };
    add('last_catch_fish_label', 'last-catch-fish', 'last-catch-fish-row');
    add('last_catch_size_label', 'last-catch-size', 'last-catch-size-row');
    add('last_catch_weight_label', 'last-catch-weight', 'last-catch-weight-row');
    add('last_catch_value_label', 'last-catch-value', 'last-catch-value-row');
    add('last_catch_location_label', 'last-catch-location', 'last-catch-location-row');
    add('last_catch_score_label', 'last-catch-score', 'last-catch-score-row');
    return parts.join('. ');
  }

  return { render, summaryText };
})();
