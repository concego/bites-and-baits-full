/**
 * fishing-combat.js — Bites & Baits
 * Regras numéricas isoladas para tensão, progresso, fadiga e fuga do peixe.
 */
const FishingCombat = (() => {
  const MAX_TENSION = 100;

  function create(initialTension = 10) {
    return {
      action: 'neutral',
      tension: Math.max(0, Math.min(MAX_TENSION, Number(initialTension) || 0)),
      progress: 0,
      fatigue: 0,
      inactiveTicks: 0,
    };
  }

  function pull(state, amount) {
    const force = Math.max(0, Number(amount) || 0);
    state.action = 'pull';
    state.progress += force;
    state.tension = Math.min(MAX_TENSION, state.tension + force * 0.4);
    return state;
  }

  function release(state, amount, fishMovementMultiplier = 1) {
    const force = Math.max(0, Number(amount) || 0);
    const movement = Math.max(0, Math.min(1, Number(fishMovementMultiplier) || 0));
    state.action = 'release';
    // Aliviar a linha reduz a tensão pelo mesmo valor; um peixe cansado
    // ganha menos distância e, portanto, perde menos progresso.
    state.tension = Math.max(0, state.tension - force * 1.5);
    state.progress = Math.max(0, state.progress - force * 0.3 * movement);
    return state;
  }

  function neutral(state) {
    state.action = 'neutral';
    return state;
  }

  function step(state, { fishPull, strengthMultiplier = 1, stamina = 15,
                          escapePatience = 50, fishTired = false } = {}) {
    const action = state.action || 'neutral';
    state.action = 'neutral';
    let resistanceDelta = 0;
    let becameTired = false;

    if (action === 'pull') {
      // Puxar vence parte da resistência, mas cobra tensão da linha.
      state.inactiveTicks = 0;
      state.fatigue = 0;
      resistanceDelta = Math.max(0, Number(fishPull) || 0)
        * Math.max(0, Number(strengthMultiplier) || 0) * 0.05;
      state.tension = Math.min(MAX_TENSION, state.tension + resistanceDelta);
    } else {
      // Neutro e alívio dão espaço para o peixe se afastar; só o neutro o cansa.
      state.inactiveTicks++;
      if (action === 'neutral' && !fishTired && (Number(fishPull) || 0) > 0) {
        state.fatigue++;
        if (state.fatigue >= Math.max(1, Number(stamina) || 1)) {
          state.fatigue = 0;
          becameTired = true;
        }
      }
    }

    return {
      action,
      tension: state.tension,
      progress: state.progress,
      fatigue: state.fatigue,
      inactiveTicks: state.inactiveTicks,
      resistanceDelta,
      becameTired,
      snapped: state.tension >= MAX_TENSION,
      escaped: state.inactiveTicks >= Math.max(1, Number(escapePatience) || 1),
    };
  }

  function resetFatigue(state) {
    state.fatigue = 0;
  }

  return { create, pull, release, neutral, step, resetFatigue };
})();
