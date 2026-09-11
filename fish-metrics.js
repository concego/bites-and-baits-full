/* fish-metrics.js — Bites & Baits
 * Geração dos dados individuais de cada exemplar.
 *
 * O catálogo fornece faixas biológicas. Um único percentil compartilhado,
 * com pequena variação entre comprimento e peso, mantém as duas medidas
 * relacionadas sem transformar o catálogo em um simulador de piscicultura.
 */
const FishMetrics = (() => {
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));

  function _range(fish, key, fallback) {
    const range = fish?.[key];
    return Array.isArray(range) && range.length === 2
      ? [Number(range[0]), Number(range[1])]
      : fallback;
  }

  function _roundWeight(value, min, max) {
    let rounded;
    if (max <= 0.5) rounded = Math.round(value * 1000) / 1000;
    else if (max <= 5) rounded = Math.round(value * 100) / 100;
    else if (max <= 25) rounded = Math.round(value * 10) / 10;
    else rounded = Math.round(value * 2) / 2;
    return clamp(rounded, min, max);
  }

  function _roundLength(value, min, max) {
    return clamp(Math.round(value * 10) / 10, min, max);
  }

  function _specimenRarity(score) {
    if (score >= 0.96) return 'trophy';
    if (score >= 0.86) return 'rare';
    if (score >= 0.70) return 'uncommon';
    return 'common';
  }

  function specimenMultiplier(rarity) {
    return ({ common: 1, uncommon: 1.12, rare: 1.30, trophy: 1.60 })[rarity] || 1;
  }

  function speciesMultiplier(rarity) {
    return ({ common: 1, uncommon: 1.12, rare: 1.28, legendary: 1.48 })[rarity] || 1;
  }

  function rollSpecimen(fish) {
    const [wMin, wMax] = _range(fish, 'weightRange', [0.01, 1]);
    const [lMin, lMax] = _range(fish, 'lengthRangeCm', [5, 30]);
    // Favorece exemplares comuns e reserva o extremo para capturas especiais.
    const shared = Math.pow(Math.random(), 2.15);
    const lengthPercentile = clamp(shared + (Math.random() - 0.5) * 0.10);
    const weightPercentile = clamp(shared + (Math.random() - 0.5) * 0.10);
    const rarityScore = Math.min(lengthPercentile, weightPercentile);
    const length = _roundLength(lMin + (lMax - lMin) * lengthPercentile, lMin, lMax);
    const weight = _roundWeight(wMin + (wMax - wMin) * weightPercentile, wMin, wMax);
    const specimenRarity = _specimenRarity(rarityScore);

    return {
      length,
      weight,
      lengthPercentile,
      weightPercentile,
      rarityScore,
      specimenRarity,
    };
  }

  function valueFor(fish, specimen) {
    const basePrice = (typeof Inventory !== 'undefined' && Inventory.basePricePerKg)
      ? Inventory.basePricePerKg(fish.id) : 3;
    const contextRarity = fish.rarity || (fish.special ? 'rare' : 'common');
    const base = basePrice * specimen.weight;
    return Math.max(1, Math.round(
      base * speciesMultiplier(contextRarity) * specimenMultiplier(specimen.specimenRarity)
    ));
  }

  function scoreFor(fish, specimen) {
    const speciesBase = ({ common: 10, uncommon: 20, rare: 35, legendary: 55 })[
      fish.rarity || (fish.special ? 'rare' : 'common')
    ] || 10;
    const maxWeight = Number(fish.weightRange?.[1]) || 1;
    const maxLength = Number(fish.lengthRangeCm?.[1]) || 30;
    const weightPoints = Math.max(1, Math.round((specimen.weight / maxWeight) * 24));
    const lengthPoints = Math.max(1, Math.round((specimen.length / maxLength) * 24));
    const rarityBonus = ({ common: 0, uncommon: 8, rare: 20, trophy: 40 })[
      specimen.specimenRarity
    ] || 0;
    const bossBonus = fish.freeBoss ? 30 : 0;
    return speciesBase + weightPoints + lengthPoints + rarityBonus + bossBonus;
  }

  function sizeClass(specimen) {
    const p = Number(specimen?.lengthPercentile ?? 0.5);
    return p <= 0.25 ? 1 : p <= 0.5 ? 2 : p <= 0.75 ? 3 : 4;
  }

  function sizeLabelKey(specimen) {
    return ({ 1: 'size_tiny', 2: 'size_small', 3: 'size_medium', 4: 'size_large' })[
      sizeClass(specimen)
    ];
  }

  return {
    rollSpecimen,
    valueFor,
    scoreFor,
    specimenMultiplier,
    speciesMultiplier,
    sizeClass,
    sizeLabelKey,
  };
})();
