/**
 * last-catch-storage.js — Bites & Baits
 *
 * Persistência isolada dos dados da última captura. Não conhece DOM, telas,
 * catálogo visual ou máquina de estados.
 */

const LastCatchStorage = (() => {
  const KEYS = {
    normal: 'bb_last_catch_story',
    free:   'bb_last_catch_free',
  };
  const LEGACY_KEY = 'bb_last_catch';

  function load(mode = 'normal') {
    const key = KEYS[mode] || KEYS.normal;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      // Migra o histórico antigo para História, sem misturá-lo com Pesca Livre.
      if (mode === 'normal') {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          localStorage.setItem(key, legacy);
          return JSON.parse(legacy);
        }
      }
    } catch {
      // Um histórico inválido ou indisponível não impede a pescaria.
    }
    return null;
  }

  function save(info) {
    const key = KEYS[info?.mode] || KEYS.normal;
    try {
      localStorage.setItem(key, JSON.stringify(info));
    } catch {
      // A pescaria continua funcionando mesmo sem persistência disponível.
    }
  }

  return { load, save };
})();
