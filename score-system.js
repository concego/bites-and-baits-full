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

/** Free Fishing progression extension. */
const FreeFishingSystem = (() => {
  const STORAGE_KEY = 'bb_best';
  const LEVELS = Object.freeze([
    { level: 1, target: 100, fish: [['lambari', .34], ['tilapia', .28], ['cara', .22], ['piau', .16]], boss: 'traira' },
    { level: 2, target: 180, fish: [['lambari', .18], ['tilapia', .18], ['piau', .16], ['curimbata', .18], ['traira', .16], ['truta', .14]], boss: 'dourado' },
    { level: 3, target: 300, fish: [['curimbata', .18], ['traira', .18], ['truta', .16], ['dourado', .14], ['tucunare', .16], ['pintado', .10], ['peixe_dourado_ornamental', .08]], boss: 'jau' },
    { level: 4, target: 500, fish: [['traira_grande', .18], ['dourado', .17], ['tucunare', .16], ['pintado', .18], ['jau', .12], ['pirarucu', .10], ['truta', .09]], boss: 'pirarucu' },
  ]);
  let level = 1, levelScore = 0, sessionScore = 0, best = 0, bossPending = false, completed = false;
  function levelData() { return LEVELS[Math.min(level - 1, LEVELS.length - 1)]; }
  function weighted(entries) {
    const total = entries.reduce((s, [, w]) => s + w, 0); let cursor = Math.random() * total;
    for (const [id, weight] of entries) { cursor -= weight; if (cursor <= 0) return id; }
    return entries[entries.length - 1][0];
  }
  function profile(id, meta = {}) {
    const base = FISH_CATALOG[id]; if (!base) return null;
    const fish = { ...base, ...meta, id, mapId: 'pesca_livre', zoneId: `nivel_${level}`, freeLevel: level };
    if (!meta.rarity) fish.rarity = base.rarity || (base.special ? 'rare' : 'common');
    return fish;
  }
  function bossProfile() {
    const id = levelData().boss, fish = FISH_CATALOG[id];
    return profile(id, { rarity: 'legendary', role: 'boss', special: true, freeBoss: true, freeBossLevel: level,
      pull: fish.pull * (1 + level * .10), pullNeeded: fish.pullNeeded * (1 + level * .12),
      stamina: fish.stamina + level * 3, escapePatience: fish.escapePatience + level * 8,
      biteWindow: Math.max(1200, fish.biteWindow - level * 120) });
  }
  function start() { level = 1; levelScore = 0; sessionScore = 0; bossPending = false; completed = false; best = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0; }
  function pickFish() { return bossPending ? bossProfile() : profile(weighted(levelData().fish), { role: 'common' }); }
  function saveBest() { if (sessionScore > best) { best = sessionScore; localStorage.setItem(STORAGE_KEY, String(best)); } }
  function state(extra = {}) { return { ...extra, level, levelScore, target: levelData().target, sessionScore, best, bossPending, completed, levelCount: LEVELS.length }; }
  function catchFish(fish, specimen) {
    const points = FishMetrics.scoreFor(fish, specimen); sessionScore += points; levelScore += points;
    const bossCaught = !!fish.freeBoss; let advanced = false;
    if (bossCaught) { advanced = true; bossPending = false; if (level < LEVELS.length) { level++; levelScore = 0; } else { completed = true; levelScore = 0; } }
    else if (levelScore >= levelData().target) bossPending = true;
    saveBest(); return state({ points, advanced, bossCaught });
  }
  function bossFailed() { const lost = levelScore; sessionScore = Math.max(0, sessionScore - lost); levelScore = 0; bossPending = false; return state({ failed: true, lost }); }
  return { start, pickFish, catchFish, bossFailed, getState: state, levels: LEVELS };
})();
