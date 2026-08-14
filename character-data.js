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
    appearanceProfile: '',
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
    const current = load();
    const profileChanged = !!(current.genderProfile && current.genderProfile !== cleanGender);
    return save({
      ...current,
      name: cleanName,
      genderProfile: cleanGender,
      appearance: profileChanged ? {} : current.appearance,
      appearanceProfile: profileChanged ? '' : current.appearanceProfile,
      confirmed: true,
    });
  }

  function isConfirmed() {
    const current = load();
    return !!(current.confirmed && current.name && current.genderProfile);
  }

  function saveAppearance(appearance, profile) {
    const current = load();
    const nextAppearance = { ...(appearance || {}) };
    return save({ ...current, appearance: nextAppearance, appearanceProfile: String(profile || '') });
  }

  function hasAppearance(categoryKeys, profile) {
    const current = load();
    const keys = Array.isArray(categoryKeys) ? categoryKeys : [];
    return !!(
      keys.length &&
      current.appearanceProfile === String(profile || '') &&
      keys.every(key => current.appearance && current.appearance[key])
    );
  }

  function isComplete(categoryKeys, profile) {
    return isConfirmed() && hasAppearance(categoryKeys, profile);
  }

  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }

  return { load, save, confirmIdentity, isConfirmed, saveAppearance, hasAppearance, isComplete, clear, STORAGE_KEY };
})();
