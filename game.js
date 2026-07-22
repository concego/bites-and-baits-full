/**
 * game.js — Bites & Baits (branch: full)
 * Máquina de estados principal
 *
 * Estados:
 *   IDLE       → aguardando lançamento (incline para frente)
 *   CASTING    → animação de lançamento em andamento
 *   WAITING    → isca na água, peixe ativo nadando / se aproximando
 *   BITING     → peixe mordeu! aguardando shake para fisgar
 *   REELING    → fisgado, puxando (incline para trás)
 *   CAUGHT     → peixe capturado!
 *   SNAPPED    → linha arrebentou
 */

const Game = (() => {

  const $ = id => document.getElementById(id);

  let screens = {};
  let ui      = {};

  // ── i18n ──────────────────────────────────────────────────────────────────
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = I18n.t(key);
      if (typeof val === 'string') el.textContent = val;
    });
    // Resolve nomes traduzidos em todas as espécies do catálogo
    Object.values(FISH_CATALOG).forEach(f => {
      f.name = I18n.t(f.nameKey);
    });
  }

  // ── Estado global ─────────────────────────────────────────────────────────
  let state            = 'IDLE';
  let score            = 0;
  let best             = parseInt(localStorage.getItem('bb_best') || '0');
  let currentFish      = null;   // espécie ativa (do FISH_CATALOG)
  let activeMap        = null;   // mapa ativo (do MAP_CATALOG)
  let tension          = 0;      // 0..100
  let fishPull         = 0;
  let fishTired        = false;
  let tiredTimer       = null;
  let tensionLoop      = null;
  let _lastTensionWarn = null;
  let waitTimer        = null;
  let biteTimer        = null;
  let fishEls          = [];     // peixes decorativos de fundo

  // ── Peixe ativo (física SVG) ───────────────────────────────────────────────
  let _activeFishEl    = null;   // elemento SVG do peixe ativo
  let _activeFishAnim  = null;   // requestAnimationFrame id
  let _activeFishX     = 0;      // posição X em % da cena
  let _activeFishY     = 0;      // posição Y em % da cena
  let _activeFishPhase = 0;      // fase da ondulação
  let _fishState       = 'idle'; // 'idle'|'approaching'|'retreating'|'biting'|'fighting'
  let _lureX           = 50;     // posição X da isca em % (referência para o peixe)
  let _lureY           = 20;     // posição Y da isca em % (referência)
  let _approachBeepCooldown = 0;
  let _retreatBeepCooldown  = 0;

  // ── Linha SVG dinâmica ────────────────────────────────────────────────────
  // A linha é um <path> SVG que curva conforme a tensão
  let _lineSvg  = null;
  let _linePath = null;

  // ── Inicialização ─────────────────────────────────────────────────────────
  function init() {
    screens = {
      lang:         $('screen-lang'),
      start:        $('screen-start'),
      game:         $('screen-game'),
      result:       $('screen-result'),
      instructions: $('screen-instructions'),
    };
    ui = {
      announcer:   $('announcer'),
      stateLabel:  $('state-label'),
      tensionCont: $('tension-container'),
      tensionBar:  $('tension-bar'),
      tiltArrow:   $('tilt-arrow'),
      tiltText:    $('tilt-text'),
      score:       $('score'),
      best:        $('best'),
      rod:         $('rod'),
      line:        $('line'),         // elemento legado (oculto quando usa SVG)
      lure:        $('lure'),
      fishContainer:$('fish-container'),
      scene:       $('scene'),
      resultIcon:  $('result-icon'),
      resultTitle: $('result-title'),
      resultDesc:  $('result-desc'),
      resultScore: $('result-score'),
      resultBest:  $('result-best'),
    };

    ui.best.textContent = best;

    // Constrói a linha SVG dinâmica
    _buildLineSvg();

    // Mapa inicial
    activeMap = getActiveMap();
    ui.scene.classList.add(activeMap.sceneClass);

    // Idioma salvo
    if (I18n.getLang()) {
      applyI18n();
      showScreen('start');
    }

    $('btn-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-start').addEventListener('click', startGame);
    $('btn-instructions').addEventListener('click', () => showScreen('instructions'));
    $('btn-back').addEventListener('click',  () => showScreen('start'));
    $('btn-menu').addEventListener('click',  () => goToMenu());
    $('btn-menu2').addEventListener('click', () => goToMenu());
    $('btn-continue').addEventListener('click', () => {
      showScreen('game');
      enterState('IDLE');
    });

    Sensors.on('onTilt',  handleTilt);
    Sensors.on('onShake', handleShake);
  }

  // ── Linha SVG dinâmica ────────────────────────────────────────────────────
  function _buildLineSvg() {
    // Substitui o #line (div legada) por um SVG overlay sobre a cena
    const existing = $('line-svg');
    if (existing) existing.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'line-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'pointer-events:none', 'overflow:visible',
      'z-index:5'
    ].join(';');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('id', 'line-path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#ccc');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.style.display = 'none';

    svg.appendChild(path);
    ui.scene.appendChild(svg);
    _lineSvg  = svg;
    _linePath = path;
  }

  // Atualiza o path da linha com base na posição da isca e tensão atual
  function _updateLinePath() {
    if (!_linePath) return;

    // Ponto de origem: ponta da vara (topo central, ajustado pela rotação da vara)
    const sceneRect = ui.scene.getBoundingClientRect();
    const W = sceneRect.width  || 360;
    const H = sceneRect.height || 500;

    // Ponta da vara: ~50% X, ~5% Y (fixo)
    const x1 = W * 0.50;
    const y1 = H * 0.05;

    // Isca: posição calculada em px
    const x2 = W * (_lureX / 100);
    const y2 = H * (_lureY / 100);

    // Curvatura inversamente proporcional à tensão:
    // tensão alta → linha quase reta; tensão baixa → curva suave
    const slack = 1 - (tension / 100);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + slack * 40;  // sag máximo de 40px

    _linePath.setAttribute('d', `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`);

    // Cor muda com tensão
    const color = tension > 85 ? '#e53935'
                : tension > 65 ? '#FF7043'
                : tension > 40 ? '#FDD835'
                : '#ccc';
    _linePath.setAttribute('stroke', color);
    _linePath.style.display = '';
  }

  function _hideLinePath() {
    if (_linePath) _linePath.style.display = 'none';
  }

  // ── Peixe ativo (física SVG) ───────────────────────────────────────────────

  function _spawnActiveFish(fishData) {
    _destroyActiveFish();

    const w = fishData.spriteW;
    const h = fishData.spriteH;

    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('width', w);
    el.setAttribute('height', h);
    el.setAttribute('aria-hidden', 'true');
    el.id = 'active-fish';
    el.style.cssText = [
      'position:absolute',
      'pointer-events:none',
      'z-index:10',
      'transition:opacity 0.3s',
    ].join(';');

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${fishData.sprite}`);
    el.appendChild(use);

    ui.fishContainer.appendChild(el);
    _activeFishEl = el;

    // Posição inicial: lado oposto da cena, na altura da isca ±15%
    _activeFishX = Math.random() > 0.5 ? 5 : 85;
    _activeFishY = 30 + Math.random() * 40;
    _activeFishPhase = 0;
    _fishState = 'approaching';

    _runFishPhysics(fishData);
  }

  function _destroyActiveFish() {
    if (_activeFishAnim) { cancelAnimationFrame(_activeFishAnim); _activeFishAnim = null; }
    if (_activeFishEl)   { _activeFishEl.remove(); _activeFishEl = null; }
    _fishState = 'idle';
  }

  function _runFishPhysics(fishData) {
    const p = fishData.physics;
    let lastApproachBeep = 0;
    let lastRetreatBeep  = 0;
    let fightDir = 1;          // direção de fuga no REELING
    let fightTimer = 0;

    function tick() {
      if (!_activeFishEl) return;

      _activeFishPhase += p.wobbleFreq;
      const wobbleY = Math.sin(_activeFishPhase) * p.wobble;

      switch (_fishState) {

        case 'approaching': {
          // Nada em direção à isca
          const dx = _lureX - _activeFishX;
          const dy = _lureY - _activeFishY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 8) {
            // Chegou perto — fica "interessado" perto da isca
            _fishState = 'curious';
          } else {
            const speed = p.approachSpeed * 0.15;
            _activeFishX += (dx / dist) * speed;
            _activeFishY += (dy / dist) * speed;
          }

          // Beep de aproximação: a cada 2s quando se aproximando
          const now = Date.now();
          if (now - lastApproachBeep > 2000) {
            Audio.fishApproach();
            lastApproachBeep = now;
          }

          // Espelha direção
          const moving = _lureX > _activeFishX ? 1 : -1;
          _activeFishEl.style.transform = moving < 0 ? 'scaleX(-1)' : 'scaleX(1)';
          break;
        }

        case 'curious': {
          // Fica orbitando próximo da isca com leve ondulação
          _activeFishX += (Math.random() - 0.5) * 0.4;
          _activeFishY += (Math.random() - 0.5) * 0.4;
          break;
        }

        case 'retreating': {
          // Nada para longe da isca
          const dx = _activeFishX - _lureX;
          const dy = _activeFishY - _lureY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          _activeFishX += (dx / dist) * p.swimSpeed * 0.2;
          _activeFishY += (dy / dist) * p.swimSpeed * 0.15;

          const now = Date.now();
          if (now - lastRetreatBeep > 2500) {
            Audio.fishRetreat();
            lastRetreatBeep = now;
          }

          // Espelha direção (afastando)
          const moving = _lureX > _activeFishX ? -1 : 1;
          _activeFishEl.style.transform = moving < 0 ? 'scaleX(-1)' : 'scaleX(1)';
          break;
        }

        case 'biting': {
          // Tremor rápido no lugar — peixe puxando a isca
          _activeFishX += (Math.random() - 0.5) * 1.5;
          _activeFishY += (Math.random() - 0.5) * 1.5;
          break;
        }

        case 'fighting': {
          // No REELING: peixe tenta fugir em zigue-zague
          fightTimer++;
          if (fightTimer % 40 === 0) fightDir *= -1;  // muda direção a cada ~2s

          const pullStrength = fishTired ? 0.3 : 1.0;
          _activeFishX += fightDir * p.swimSpeed * 0.25 * pullStrength;
          _activeFishY += Math.sin(_activeFishPhase * 2) * p.wobble * 0.08 * pullStrength;

          // Puxa em direção à isca conforme o puxão do jogador
          _activeFishX = _activeFishX * 0.97 + _lureX * 0.03;
          _activeFishY = _activeFishY * 0.97 + _lureY * 0.03;

          _activeFishEl.style.transform = fightDir < 0 ? 'scaleX(-1)' : 'scaleX(1)';
          break;
        }
      }

      // Clampa dentro da cena
      _activeFishX = Math.max(2,  Math.min(90, _activeFishX));
      _activeFishY = Math.max(20, Math.min(85, _activeFishY));

      // Aplica posição + ondulação vertical
      _activeFishEl.style.left = `${_activeFishX}%`;
      _activeFishEl.style.top  = `${_activeFishY + wobbleY * 0.1}%`;

      _activeFishAnim = requestAnimationFrame(tick);
    }

    _activeFishAnim = requestAnimationFrame(tick);
  }

  // ── Seleciona idioma ──────────────────────────────────────────────────────
  function selectLang(code) {
    I18n.setLang(code);
    applyI18n();
    showScreen('start');
  }

  // ── Inicia jogo ───────────────────────────────────────────────────────────
  async function startGame() {
    const ok = await Sensors.requestPermission();
    if (!ok) {
      speak(I18n.t('speak_no_sensor'));
      Sensors.enableDesktopFallback();
    }
    await Audio.init();
    showScreen('game');
    score = 0;
    updateScore();
    fishEls = [];
    spawnBackgroundFish();
    Sensors.start();
    Audio.startAmbient();
    enterState('IDLE');
  }

  // ── Silencia TalkBack via aria-hidden no screen-game ─────────────────────
  function setTalkbackSilent(silent) {
    const gs = $('screen-game');
    if (!gs) return;
    silent ? gs.setAttribute('aria-hidden', 'true')
           : gs.removeAttribute('aria-hidden');
  }

  // ── Máquina de estados ────────────────────────────────────────────────────
  function enterState(newState) {
    clearTimers();
    state = newState;

    switch (state) {

      case 'IDLE':
        tension = 0;
        currentFish = null;
        fishTired   = false;
        updateTensionBar();
        ui.tensionCont.classList.add('hidden');
        ui.lure.style.display  = 'none';
        ui.rod.style.transform = 'translateX(-50%) rotate(-30deg)';
        _hideLinePath();
        _destroyActiveFish();
        setTalkbackSilent(false);
        setLabel(I18n.t('state_idle'));
        setTiltHint('↕', I18n.t('tilt_idle'));
        speak(I18n.t('speak_ready'));
        break;

      case 'CASTING':
        setTalkbackSilent(true);
        setLabel(I18n.t('state_casting'));
        setTiltHint('↑', I18n.t('tilt_casting'));
        ui.rod.style.transform = 'translateX(-50%) rotate(10deg)';
        Audio.play('splash') || Audio.play('bloop');
        Audio.play('bloop');

        // Posição inicial da isca: centro, topo da área de água
        _lureX = 45 + Math.random() * 10;
        _lureY = 18;

        setTimeout(() => {
          ui.lure.style.display = 'block';
          ui.lure.style.top     = `${_lureY}%`;
          ui.lure.style.left    = `${_lureX}%`;
          _updateLinePath();
          speak(I18n.t('speak_waiting'));
          enterState('WAITING');
        }, 600);
        break;

      case 'WAITING': {
        setLabel(I18n.t('state_waiting'));
        setTiltHint('→', I18n.t('tilt_waiting'));
        ui.rod.style.transform = 'translateX(-50%) rotate(-10deg)';

        // Sorteia o peixe agora para que ele já apareça nadando
        currentFish = pickFishFromMap(activeMap);
        fishPull    = currentFish.pull;
        fishTired   = false;

        _spawnActiveFish(currentFish);
        scheduleNextBite();
        break;
      }

      case 'BITING':
        // Peixe já está próximo — muda para estado "mordendo"
        _fishState = 'biting';

        Audio.chomp();
        Audio.vibrate([80, 40, 80]);
        ui.scene.classList.add('bite-pulse');
        setTimeout(() => ui.scene.classList.remove('bite-pulse'), 1500);

        setLabel(I18n.t('state_biting', I18n.t(currentFish.nameKey)));
        setTiltHint('📳', I18n.t('tilt_biting'));
        ui.tiltArrow.classList.add('shake-hint');
        speak(I18n.t('speak_fish'));

        biteTimer = setTimeout(() => {
          // Peixe perdeu interesse — começa a recuar
          _fishState = 'retreating';
          ui.tiltArrow.classList.remove('shake-hint');
          speak(I18n.t('speak_escaped'));
          setLabel(I18n.t('state_escaped'));
          setTimeout(() => {
            _destroyActiveFish();
            enterState('WAITING');
          }, 2000);
        }, currentFish.biteWindow);
        break;

      case 'REELING':
        tension = 10;
        _fishState = 'fighting';
        ui.tensionCont.classList.remove('hidden');
        ui.rod.style.transform = 'translateX(-50%) rotate(-50deg)';
        setLabel(I18n.t('state_reeling', I18n.t(currentFish.nameKey)));
        setTiltHint('↓', I18n.t('tilt_reeling'));
        _lastTensionWarn = null;
        speak(I18n.t('speak_hooked'));
        Audio.startReel('neutral');
        startTensionLoop();
        scheduleFishTired();
        break;

      case 'CAUGHT':
        Audio.stopReel();
        Audio.play(currentFish.special ? 'point_special' : 'point_normal');
        Audio.vibrate([100, 50, 100, 50, 200]);
        score++;
        if (score > best) { best = score; localStorage.setItem('bb_best', best); }
        updateScore();
        ui.tensionCont.classList.add('hidden');
        _hideLinePath();
        _destroyActiveFish();
        setLabel(I18n.t('state_caught', I18n.t(currentFish.nameKey)));
        {
          const sizeDesc = currentFish.size <= 1 ? I18n.t('size_tiny')
                         : currentFish.size <= 2 ? I18n.t('size_small')
                         : currentFish.size <= 3 ? I18n.t('size_medium')
                         :                         I18n.t('size_large');
          const msg = currentFish.special
            ? I18n.t('speak_caught_special', I18n.t(currentFish.nameKey), score)
            : I18n.t('speak_caught', I18n.t(currentFish.nameKey), sizeDesc, score);
          speak(msg);
        }
        setTimeout(() => { if (state === 'CAUGHT') enterState('IDLE'); }, 3500);
        break;

      case 'SNAPPED':
        Audio.stopReel();
        Audio.snap();
        Audio.vibrate([200, 100, 400]);
        ui.tensionCont.classList.add('hidden');
        tension = 0;
        ui.lure.style.display = 'none';
        _hideLinePath();
        _destroyActiveFish();
        setLabel(I18n.t('state_snapped'));
        speak(I18n.t('speak_snapped'));
        setTimeout(() => {
          if (state === 'SNAPPED') {
            setTalkbackSilent(false);
            showResultScreen(false);
          }
        }, 2000);
        break;
    }
  }

  // ── Tilt ──────────────────────────────────────────────────────────────────
  function handleTilt(dir, beta, norm) {
    updateTiltIndicator(dir, norm);

    // Atualiza posição Y da isca com base na inclinação (visual)
    if (state === 'REELING' || state === 'WAITING' || state === 'BITING') {
      ui.lure.style.top  = `${_lureY}%`;
      ui.lure.style.left = `${_lureX}%`;
      _updateLinePath();
    }

    switch (state) {
      case 'IDLE':
        if (dir === 'forward') enterState('CASTING');
        break;

      case 'REELING':
        if (dir === 'back') {
          pullFish(0.8);
          // Isca sobe levemente ao puxar
          _lureY = Math.max(10, _lureY - 0.3);
        } else if (dir === 'forward') {
          releaseLine(1.2);
          _lureY = Math.min(80, _lureY + 0.2);
        } else {
          Audio.setReelMode('neutral');
        }
        _updateLinePath();
        break;

      case 'WAITING':
        if (dir === 'back') {
          speak(I18n.t('speak_pulled_out'));
          setLabel(I18n.t('state_pulled_out'));
          enterState('IDLE');
        }
        break;
    }
  }

  // ── Shake ─────────────────────────────────────────────────────────────────
  function handleShake() {
    if (state === 'BITING') {
      clearTimeout(biteTimer);
      ui.tiltArrow.classList.remove('shake-hint');
      navigator.vibrate && navigator.vibrate(0);
      setTimeout(() => Audio.vibrate([300, 100, 400]), 30);
      speak(I18n.t('speak_rehooked'));
      enterState('REELING');
    }
  }

  // ── Tensão ────────────────────────────────────────────────────────────────
  let _pullProgress = 0;

  function startTensionLoop() {
    _pullProgress = 0;
    let _resistCooldown = 0;

    tensionLoop = setInterval(() => {
      if (state !== 'REELING') { clearInterval(tensionLoop); return; }

      const fishForce = fishTired ? fishPull * 0.3 : fishPull;
      const delta = fishForce * 0.05;
      tension = Math.min(100, tension + delta);

      if (fishPull >= 5 && delta > 0.2 && _resistCooldown <= 0 && !fishTired) {
        Audio.fishResist();
        Audio.setReelMode('neutral');
        _resistCooldown = 8;
      }
      if (_resistCooldown > 0) _resistCooldown--;

      // Níveis de tensão
      if (tension > 85) {
        Audio.vibrate(30);
        setTensionClass('tension-danger');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 3000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();               // ← novo alerta sonoro
          speak(I18n.t('speak_danger'));
        }
      } else if (tension > 65) {
        setTensionClass('tension-high');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 5000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();               // ← novo alerta sonoro
          speak(I18n.t('speak_tension'));
        }
      } else if (tension > 40) {
        setTensionClass('tension-medium');
      } else {
        setTensionClass('tension-low');
      }

      if (tension >= 100) { clearInterval(tensionLoop); enterState('SNAPPED'); return; }
      _updateLinePath();  // ← atualiza linha a cada tick de tensão
      updateTensionBar();
    }, 120);
  }

  function pullFish(amount) {
    if (state !== 'REELING') return;
    Audio.setReelMode('pulling');
    _pullProgress += amount;
    tension = Math.min(100, tension + amount * 0.4);
    updateTensionBar();
    if (_pullProgress >= currentFish.pullNeeded) {
      clearInterval(tensionLoop);
      enterState('CAUGHT');
    }
  }

  function releaseLine(amount) {
    if (state !== 'REELING') return;
    Audio.setReelMode('releasing');
    tension = Math.max(0, tension - amount * 1.5);
    _pullProgress = Math.max(0, _pullProgress - amount * 0.3);
    updateTensionBar();
  }

  // ── Cansaço do peixe ──────────────────────────────────────────────────────
  function scheduleFishTired() {
    const jitter = Math.random() * 0.3 - 0.15;
    const ms = currentFish.tiredBase * (1 + jitter);
    tiredTimer = setTimeout(() => {
      if (state === 'REELING') {
        fishTired = true;
        speak(I18n.t('speak_tired'));
        setLabel(I18n.t('state_tired', I18n.t(currentFish.nameKey)));
      }
    }, ms);
  }

  // ── Peixes decorativos de fundo ───────────────────────────────────────────
  function spawnBackgroundFish() {
    ui.fishContainer.innerHTML = '';
    fishEls = [];
    const bgTypes = ['lambari', 'tilapia', 'truta'];

    for (let i = 0; i < 4; i++) {
      const key  = bgTypes[Math.floor(Math.random() * bgTypes.length)];
      const data = FISH_CATALOG[key];
      const w    = data.spriteW;
      const h    = data.spriteH;

      const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('width', w);
      el.setAttribute('height', h);
      el.setAttribute('aria-hidden', 'true');
      el.classList.add('fish');

      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `#${data.sprite}`);
      el.appendChild(use);

      el.style.top            = `${20 + Math.random() * 60}%`;
      el.style.left           = `${Math.random() * 80}%`;
      el.style.animationDelay = `${Math.random() * 2}s`;
      el.style.opacity        = '0.55';

      ui.fishContainer.appendChild(el);
      fishEls.push(el);

      let curLeft = parseFloat(el.style.left);
      setInterval(() => {
        if (state !== 'IDLE' && state !== 'WAITING') return;
        const newLeft = Math.random() * 80;
        el.style.left      = `${newLeft}%`;
        el.style.transform = newLeft < curLeft ? 'scaleX(-1)' : 'scaleX(1)';
        curLeft = newLeft;
      }, 3000 + Math.random() * 4000);
    }
  }

  // ── Mordida ───────────────────────────────────────────────────────────────
  function scheduleNextBite() {
    const ms = 3000 + Math.random() * 7000;
    waitTimer = setTimeout(() => {
      if (state === 'WAITING') enterState('BITING');
    }, ms);
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  function showResultScreen(caught) {
    Sensors.stop();
    Audio.stopAmbient();
    Audio.stopReel();
    setTalkbackSilent(false);
    ui.resultScore.textContent = score;
    ui.resultBest.textContent  = best;
    if (caught && currentFish) {
      const useEl = $('result-fish-use');
      if (useEl) useEl.setAttribute('href', `#${currentFish.sprite}`);
      $('result-fish-svg').style.display = '';
      ui.resultTitle.textContent = I18n.t('result_caught');
      ui.resultDesc.textContent  = I18n.t('result_caught_desc', I18n.t(currentFish.nameKey));
    } else {
      $('result-fish-svg').style.display = 'none';
      ui.resultIcon.innerHTML    = '<span style="font-size:80px">💔</span>';
      ui.resultTitle.textContent = I18n.t('result_snapped');
      ui.resultDesc.textContent  = I18n.t('result_snapped_desc');
    }
    showScreen('result');
  }

  function goToMenu() {
    clearTimers();
    Sensors.stop();
    Audio.stopAmbient();
    Audio.stopReel();
    _destroyActiveFish();
    _hideLinePath();
    setTalkbackSilent(false);
    state = 'IDLE';
    showScreen('start');
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function setLabel(text)  { ui.stateLabel.textContent = text; }

  function speak(text) {
    ui.announcer.textContent = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ui.announcer.textContent = text;
    }));
  }

  function setTiltHint(arrow, text) {
    ui.tiltArrow.textContent = arrow;
    ui.tiltText.textContent  = text;
    ui.tiltArrow.classList.remove('shake-hint');
  }

  function updateScore() {
    ui.score.textContent = score;
    ui.best.textContent  = best;
  }

  function updateTensionBar() { ui.tensionBar.style.width = `${tension}%`; }
  function setTensionClass(cls) { ui.tensionBar.className = cls; }

  function updateTiltIndicator(dir) {
    if (dir === 'forward')     ui.tiltArrow.textContent = '↑';
    else if (dir === 'back')   ui.tiltArrow.textContent = '↓';
    else                       ui.tiltArrow.textContent = '↕';
  }

  function clearTimers() {
    clearTimeout(waitTimer);
    clearTimeout(biteTimer);
    clearTimeout(tiredTimer);
    clearInterval(tensionLoop);
    Audio.stopReel();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { state: () => state };
})();
