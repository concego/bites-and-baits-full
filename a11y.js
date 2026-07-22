/**
 * a11y.js — Bites & Baits
 * Módulo de preferências de acessibilidade.
 * Persiste em localStorage. Aplica os efeitos no DOM/CSS ao carregar e ao mudar.
 *
 * Toggles disponíveis:
 *   sound        → efeitos sonoros on/off         (padrão: true)
 *   haptic       → vibração háptica on/off         (padrão: true)
 *   highContrast → alto contraste visual           (padrão: false)
 *   largeText    → textos aumentados               (padrão: false)
 *   slowGame     → jogo mais lento (timers x1.6)  (padrão: false)
 *   verboseVoice → narração detalhada de estados  (padrão: false)
 *
 * Uso:
 *   A11y.get('sound')          → true/false
 *   A11y.set('sound', false)   → salva + aplica
 *   A11y.toggle('haptic')      → inverte + aplica
 */

const A11y = (() => {

  const STORAGE_KEY = 'bb_a11y';

  const DEFAULTS = {
    sound:        true,
    haptic:       true,
    highContrast: false,
    largeText:    false,
    slowGame:     false,
    verboseVoice: false,
  };

  // ── Carrega preferências salvas ──────────────────────────────────────────
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function _save(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* noop */ }
  }

  let _prefs = _load();

  // ── Aplica efeitos visuais no DOM ────────────────────────────────────────
  function _applyDOM() {
    const root = document.documentElement;

    // Alto contraste — adiciona classe ao <html>
    root.classList.toggle('a11y-high-contrast', _prefs.highContrast);

    // Texto grande — adiciona classe ao <html>
    root.classList.toggle('a11y-large-text', _prefs.largeText);
  }

  // ── API pública ──────────────────────────────────────────────────────────

  /** Retorna o valor atual de uma preferência */
  function get(key) {
    return _prefs[key] ?? DEFAULTS[key];
  }

  /** Define e persiste uma preferência */
  function set(key, value) {
    if (!(key in DEFAULTS)) return;
    _prefs[key] = value;
    _save(_prefs);
    _applyDOM();
  }

  /** Inverte o valor de uma preferência booleana */
  function toggle(key) {
    set(key, !get(key));
  }

  /** Retorna uma cópia de todas as preferências */
  function all() {
    return { ..._prefs };
  }

  /**
   * Retorna o multiplicador de tempo para timers de jogo.
   * slowGame = true → 1.6x mais tempo (reação mais fácil)
   * slowGame = false → 1.0x (normal)
   */
  function timeScale() {
    return _prefs.slowGame ? 1.6 : 1.0;
  }

  /** Aplica preferências salvas ao DOM (chamar no DOMContentLoaded) */
  function init() {
    _prefs = _load();
    _applyDOM();
  }

  return { get, set, toggle, all, timeScale, init };
})();
