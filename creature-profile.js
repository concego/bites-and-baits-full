/**
 * creature-profile.js — Bites & Baits
 * Adaptado de CreatureProfile.js (ECJ Game Library) para uso sem ESM.
 *
 * Substitui pickFishFromMap() — sorteio ponderado de espécies por mapa.
 *
 * Uso:
 *   const pool = CreatureProfile.createPool([
 *     { ...FISH_CATALOG.lambari, weight: 0.6 },
 *     { ...FISH_CATALOG.pirarucu, weight: 0.05 },
 *   ]);
 *   const fish = pool.roll();
 */

const CreatureProfile = (() => {

  function createPool(profiles = []) {
    const total = profiles.reduce((s, p) => s + (p.weight ?? 1), 0);
    const normalized = profiles.map(p => ({ ...p, weight: (p.weight ?? 1) / total }));

    /** Sorteio ponderado — retorna uma cópia do perfil sorteado */
    function roll() {
      let r = Math.random();
      for (const p of normalized) {
        r -= p.weight;
        if (r <= 0) return { ...p };
      }
      return { ...normalized[normalized.length - 1] };
    }

    /** Busca espécie por id */
    function get(id) {
      return normalized.find(p => p.id === id) ?? null;
    }

    /** Retorna todas as espécies do pool */
    function all() {
      return normalized.map(p => ({ ...p }));
    }

    return { roll, get, all };
  }

  return { createPool };
})();
