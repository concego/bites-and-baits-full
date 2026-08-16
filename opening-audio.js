/* opening-audio.js — Bites & Baits
 * Camada sonora da abertura narrativa.
 * Os sons complementam o texto e o TalkBack; não são feedback de gameplay.
 */
const OpeningAudio = (() => {
  const CUES = Object.freeze({
    paper: 'opening_paper',
    envelopeClose: 'opening_envelope_close',
    transition: 'zone_transition',
    motorboat: 'opening_motorboat',
    woodStep01: 'opening_wood_step_01',
    woodStep02: 'opening_wood_step_02',
    woodStep03: 'opening_wood_step_03',
    marginStep01: 'opening_margin_step_01',
    marginStep02: 'opening_margin_step_02',
  });

  let readyPromise = null;
  let travelLoops = [];
  let travelRequest = 0;
  let arrivalStepTimers = [];
  let woodIndex = 0;
  let marginIndex = 0;

  function soundEnabled() {
    return typeof A11y === 'undefined' || A11y.get('sound');
  }

  function init() {
    if (!readyPromise) {
      readyPromise = Audio.init().catch(() => {});
    }
    return readyPromise;
  }

  function playCue(cue, volume = 0.22) {
    const key = CUES[cue];
    if (!key || !soundEnabled()) return Promise.resolve(null);
    return init().then(() => {
      if (!soundEnabled()) return null;
      return Audio.play(key, { volume });
    });
  }

  function startTravel() {
    const request = ++travelRequest;
    if (!soundEnabled()) return Promise.resolve();
    stopTravel();
    // stopTravel increments travelRequest; preserve this request as current.
    travelRequest = request + 1;
    const activeRequest = travelRequest;
    return init().then(() => {
      if (activeRequest !== travelRequest || !soundEnabled()) return;
      const river = Audio.play('ambient_river_strong', { volume: 0.04, loop: true });
      const motorboat = Audio.play(CUES.motorboat, { volume: 0.14, loop: true });
      travelLoops = [river, motorboat].filter(Boolean);
    });
  }

  function stopTravel() {
    travelRequest += 1;
    travelLoops.forEach(node => Audio.stop(node));
    travelLoops = [];
  }

  function playPaper() {
    return playCue('paper', 0.18);
  }

  function closeEnvelope() {
    return playCue('envelopeClose', 0.22);
  }

  function playTransition() {
    return playCue('transition', 0.28);
  }

  function playWoodStep() {
    const cue = ['woodStep01', 'woodStep02', 'woodStep03'][woodIndex % 3];
    woodIndex += 1;
    return playCue(cue, 0.22);
  }

  function playMarginStep() {
    const cue = ['marginStep01', 'marginStep02'][marginIndex % 2];
    marginIndex += 1;
    return playCue(cue, 0.2);
  }

  function clearArrivalStepTimers() {
    arrivalStepTimers.forEach(timer => clearTimeout(timer));
    arrivalStepTimers = [];
  }

  function playArrivalSteps() {
    clearArrivalStepTimers();
    playWoodStep();
    arrivalStepTimers.push(setTimeout(() => playWoodStep(), 420));
    arrivalStepTimers.push(setTimeout(() => playWoodStep(), 840));
    arrivalStepTimers.push(setTimeout(() => playMarginStep(), 1450));
    arrivalStepTimers.push(setTimeout(() => playMarginStep(), 2050));
  }

  function stopAll() {
    stopTravel();
    clearArrivalStepTimers();
  }

  return {
    init,
    playPaper,
    closeEnvelope,
    playTransition,
    startTravel,
    stopTravel,
    playWoodStep,
    playMarginStep,
    playArrivalSteps,
    stopAll,
  };
})();
