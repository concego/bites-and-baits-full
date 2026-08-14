/* character-data.js — Bites & Baits
 * Persistência da identidade da personagem.
 * A aparência será adicionada sem misturar este estado aos equipamentos.
 */
const Character = (() => {
  const STORAGE_KEY = 'bb_character';
  const DEFAULT = {
    name: '',
    genderProfile: '',
    appearance: {},
    confirmed: false,
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...DEFAULT, ...(raw && typeof raw === 'object' ? raw : {}) };
    } catch {
      return { ...DEFAULT };
    }
  }

  function save(value) {
    const next = { ...DEFAULT, ...(value || {}) };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage indisponível */ }
    return next;
  }

  function confirmIdentity(name, genderProfile) {
    const cleanName = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const cleanGender = String(genderProfile || '').trim();
    if (!cleanName || !cleanGender) return null;
    return save({ name: cleanName, genderProfile: cleanGender, confirmed: true });
  }

  function isConfirmed() {
    const current = load();
    return !!(current.confirmed && current.name && current.genderProfile);
  }

  function saveAppearance(appearance) {
    const current = load();
    const nextAppearance = { ...(appearance || {}) };
    return save({ ...current, appearance: nextAppearance });
  }

  function hasAppearance(categoryKeys) {
    const current = load();
    const keys = Array.isArray(categoryKeys) ? categoryKeys : [];
    return !!(keys.length && keys.every(key => current.appearance && current.appearance[key]));
  }

  function isComplete(categoryKeys) {
    return isConfirmed() && hasAppearance(categoryKeys);
  }

  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }

  return { load, save, confirmIdentity, isConfirmed, saveAppearance, hasAppearance, isComplete, clear, STORAGE_KEY };
})();
