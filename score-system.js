/**
 * score-system.js — Bites & Baits
 * Adaptado de ScoreSystem.js (ECJ Game Library) para uso sem ESM.
 *
 * Gerencia pontuação, highscore (localStorage), multiplicador e combo.
 *
 * Eventos emitidos (via .on):
 *   "score"      → { points, total, multiplier }
 *   "combo"      → { combo, multiplier }
 *   "combobreak" → { combo }
 *   "highscore"  → { total, previous }
 *   "reset"      → {}
 *
 * Uso:
 *   const score = ScoreSystem.create({ storageKey: 'bb_score' });
 *   score.on('highscore', ({ total }) => speak('Novo recorde!'));
 *   score.add(100);
 *   score.combo();
 */

const ScoreSystem = (() => {

  function create({
    storageKey      = 'bb_highscore',
    baseMultiplier  = 1,
    multiplierStep  = 0.5,
    maxMultiplier   = 4,
    comboThresholds = [3, 5, 10],
  } = {}) {

    // ── Eventos ───────────────────────────────────────────────────────────
    const _listeners = {};
    function on(event, cb)  { (_listeners[event] ??= []).push(cb); return api; }
    function off(event, cb) {
      if (_listeners[event]) _listeners[event] = _listeners[event].filter(f => f !== cb);
      return api;
    }
    function _emit(event, data = {}) {
      (_listeners[event] ?? []).forEach(cb => cb(data));
    }

    // ── Estado ────────────────────────────────────────────────────────────
    let _total      = 0;
    let _combo      = 0;
    let _multiplier = baseMultiplier;
    let _highscore  = (() => {
      try { return parseInt(localStorage.getItem(storageKey) || '0'); }
      catch { return 0; }
    })();

    // ── Internos ──────────────────────────────────────────────────────────
    function _checkHighscore() {
      if (_total > _highscore) {
        const previous = _highscore;
        _highscore = _total;
        try { localStorage.setItem(storageKey, _highscore); } catch { /* noop */ }
        _emit('highscore', { total: _total, previous });
      }
    }

    function _updateMultiplier() {
      _multiplier = Math.min(baseMultiplier + (_combo * multiplierStep), maxMultiplier);
      _multiplier = Math.round(_multiplier * 10) / 10;
    }

    // ── API pública ───────────────────────────────────────────────────────

    /** Adiciona pontos (aplica multiplicador atual) */
    function add(points) {
      const earned = Math.round(points * _multiplier);
      _total += earned;
      _emit('score', { points: earned, total: _total, multiplier: _multiplier });
      _checkHighscore();
    }

    /** Registra acerto em sequência — aumenta combo e multiplicador */
    function combo() {
      _combo++;
      _updateMultiplier();
      if (comboThresholds.includes(_combo)) {
        _emit('combo', { combo: _combo, multiplier: _multiplier });
      }
    }

    /** Registra erro — reseta combo e multiplicador */
    function breakCombo() {
      if (_combo > 0) {
        const broken = _combo;
        _combo      = 0;
        _multiplier = baseMultiplier;
        _emit('combobreak', { combo: broken });
      }
    }

    /** Reseta pontuação e combo (highscore persiste) */
    function reset() {
      _total      = 0;
      _combo      = 0;
      _multiplier = baseMultiplier;
      _emit('reset');
    }

    function total()        { return _total;      }
    function currentCombo() { return _combo;      }
    function multiplier()   { return _multiplier; }
    function highscore()    { return _highscore;  }

    const api = { on, off, add, combo, breakCombo, reset, total, currentCombo, multiplier, highscore };
    return api;
  }

  return { create };
})();
