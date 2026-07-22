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
    // Atualiza aria-label dos toggles com o idioma atual (só se A11y disponível)
    if (typeof A11y !== 'undefined') {
      document.querySelectorAll('.toggle-btn[data-pref]').forEach(btn => {
        _updateToggleBtn(btn, A11y.get(btn.dataset.pref));
      });
    }
  }

  // ── Estado global ─────────────────────────────────────────────────────────
  let gameMode         = 'normal'; // 'normal' | 'free'
  let state            = 'IDLE';
  let score            = 0;
  let best             = parseInt(localStorage.getItem('bb_best') || '0');
  let currentFish      = null;   // espécie ativa (do FISH_CATALOG)
  let activeMap        = null;   // mapa ativo (do MAP_CATALOG)
  let _lastCaughtItem  = null;   // último item adicionado ao inventário
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
      options:      $('screen-options'),
    };

    // Garante que só screen-lang está ativa no carregamento inicial
    // (as outras já têm inert no HTML, mas blindagem extra aqui)
    Object.entries(screens).forEach(([key, s]) => {
      if (key !== 'lang') {
        s.classList.remove('active');
        s.setAttribute('inert', '');
      }
    });
    ui = {
      announcer:      $('announcer'),
      stateLabel:     $('state-label'),
      tensionCont:    $('tension-container'),
      tensionBar:     $('tension-bar'),
      tiltArrow:      $('tilt-arrow'),
      tiltText:       $('tilt-text'),
      score:          $('score'),
      best:           $('best'),
      rod:            $('rod'),
      line:           $('line'),
      lure:           $('lure'),
      fishContainer:  $('fish-container'),
      scene:          $('scene'),
      resultIcon:     $('result-icon'),
      resultTitle:    $('result-title'),
      resultDesc:     $('result-desc'),
      resultScore:    $('result-score'),
      resultBest:     $('result-best'),
      normalHud:      $('normal-hud'),
      baitEmoji:      $('bait-active-emoji'),
      baitName:       $('bait-active-name'),
      baitQty:        $('bait-active-qty'),
      equipPanel:     $('equip-panel'),
      baitList:       $('bait-list'),
    };

    ui.best.textContent = best;

    // Constrói a linha SVG dinâmica
    _buildLineSvg();

    // Mapa inicial
    activeMap = getActiveMap();
    ui.scene.classList.add(activeMap.sceneClass);

    // Preferências de acessibilidade — carrega antes de tudo
    A11y.init();

    // Idioma salvo
    if (I18n.getLang()) {
      applyI18n();   // atualiza aria-labels dos toggles com idioma correto
      showScreen('start');
    }

    $('btn-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-start').addEventListener('click', () => startGame('normal'));
    $('btn-free').addEventListener('click',  () => startGame('free'));
    $('btn-instructions').addEventListener('click', () => showScreen('instructions'));
    $('btn-back').addEventListener('click',  () => showScreen('start'));
    $('btn-options').addEventListener('click', () => { _syncToggles(); showScreen('options'); });
    $('btn-options-back').addEventListener('click', () => showScreen('start'));
    $('btn-opt-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-opt-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-menu').addEventListener('click',  () => goToMenu());
    $('btn-menu2').addEventListener('click', () => goToMenu());
    $('btn-continue').addEventListener('click', () => {
      // "Pescar de novo" — reinicia a sessão no mesmo modo
      startGame(gameMode);
    });

    // Painel de equipamento (modo normal)
    $('btn-equip').addEventListener('click', () => openEquipPanel());
    $('btn-equip-close').addEventListener('click', () => closeEquipPanel());

    // Listeners dos toggles de acessibilidade
    document.querySelectorAll('.toggle-btn[data-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pref = btn.dataset.pref;
        A11y.toggle(pref);
        _updateToggleBtn(btn, A11y.get(pref));
      });
    });

    Sensors.on('onTilt',  handleTilt);
    Sensors.on('onShake', handleShake);
  }

  /** Sincroniza o estado visual dos toggles com as preferências salvas */
  function _syncToggles() {
    document.querySelectorAll('.toggle-btn[data-pref]').forEach(btn => {
      _updateToggleBtn(btn, A11y.get(btn.dataset.pref));
    });
  }

  /**
   * Atualiza aria-checked + aria-label de um toggle.
   * Lê o nome do label visual (.a11y-toggle-label) que já foi traduzido pelo applyI18n.
   * ex: aria-label="Efeitos sonoros, Ativado"
   */
  function _updateToggleBtn(btn, value) {
    btn.setAttribute('aria-checked', value ? 'true' : 'false');
    // Busca o nome do toggle no item pai
    const item  = btn.closest('.a11y-toggle-item');
    const name  = item ? (item.querySelector('.a11y-toggle-label') || {}).textContent || '' : '';
    const state = I18n.t(value ? 'toggle_on' : 'toggle_off');
    btn.setAttribute('aria-label', name ? `${name}, ${state}` : state);
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
  async function startGame(mode = 'normal') {
    gameMode = mode;

    const ok = await Sensors.requestPermission();
    if (!ok) {
      speak(I18n.t('speak_no_sensor'));
      Sensors.enableDesktopFallback();
    }
    await Audio.init();
    showScreen('game');

    // HUDs: score só no Free Fishing; normal-hud só no modo normal
    const scoreHud = $('score-hud');
    if (scoreHud) scoreHud.classList.toggle('hidden', gameMode !== 'free');
    if (ui.normalHud) ui.normalHud.classList.toggle('hidden', gameMode !== 'normal');

    // Inicializa indicador de isca
    if (gameMode === 'normal') refreshBaitHud();

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
        sayKey('ready');
        // Botão de equipamento: visível só no IDLE e no modo normal
        { const be = $('btn-equip'); if (be) be.classList.toggle('hidden', gameMode !== 'normal'); }
        break;

      case 'CASTING':
        // Modo normal: verifica estoque e consome 1 isca
        if (gameMode === 'normal') {
          const result = Inventory.consumeBait();
          if (!result.ok) {
            speak(I18n.t('bait_no_stock'));
            enterState('IDLE');
            break;
          }
          refreshBaitHud();
        }

        // Esconde botão de equipamento fora do IDLE
        { const be = $('btn-equip'); if (be) be.classList.add('hidden'); }

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
          sayKey('waiting');
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
        _vibrate([80, 40, 80]);
        ui.scene.classList.add('bite-pulse');
        setTimeout(() => ui.scene.classList.remove('bite-pulse'), 1500);

        setLabel(I18n.t('state_biting', fishName(currentFish)));
        setTiltHint('📳', I18n.t('tilt_biting'));
        ui.tiltArrow.classList.add('shake-hint');
        sayKey('fish');

        biteTimer = setTimeout(() => {
          // Peixe perdeu interesse — começa a recuar
          _fishState = 'retreating';
          ui.tiltArrow.classList.remove('shake-hint');
          sayKey('escaped');
          setLabel(I18n.t('state_escaped'));
          setTimeout(() => {
            _destroyActiveFish();
            enterState('WAITING');
          }, 2000);
        }, currentFish.biteWindow * A11y.timeScale());
        break;

      case 'REELING':
        tension = 10;
        _fishState = 'fighting';
        ui.tensionCont.classList.remove('hidden');
        ui.rod.style.transform = 'translateX(-50%) rotate(-50deg)';
        setLabel(I18n.t('state_reeling', fishName(currentFish)));
        setTiltHint('↓', I18n.t('tilt_reeling'));
        _lastTensionWarn = null;
        sayKey('hooked');
        Audio.startReel('neutral');
        startTensionLoop();
        scheduleFishTired();
        break;

      case 'CAUGHT': {
        Audio.stopReel();
        Audio.play(currentFish.special ? 'point_special' : 'point_normal');
        _vibrate([100, 50, 100, 50, 200]);
        score++;
        if (score > best) { best = score; localStorage.setItem('bb_best', best); }
        updateScore();
        ui.tensionCont.classList.add('hidden');
        _hideLinePath();
        _destroyActiveFish();

        // Registra no inventário — sorteia peso e calcula valor
        const caughtItem = Inventory.addFish(currentFish);
        _lastCaughtItem = caughtItem;

        setLabel(I18n.t('state_caught', fishName(currentFish)));
        {
          const sizeDesc = currentFish.size <= 1 ? I18n.t('size_tiny')
                         : currentFish.size <= 2 ? I18n.t('size_small')
                         : currentFish.size <= 3 ? I18n.t('size_medium')
                         :                         I18n.t('size_large');
          if (currentFish.special) {
            sayKey(gameMode === 'free' ? 'caught_special' : 'caught_special_noscore',
                   fishName(currentFish), score);
          } else {
            sayKey(gameMode === 'free' ? 'caught' : 'caught_noscore',
                   fishName(currentFish), sizeDesc, score);
          }
        }

        // Ambos os modos voltam ao IDLE — Free Fishing mostra feedback no HUD
        // A tela de resultado só aparece ao sair (btn-menu) no Free Fishing
        setTimeout(() => {
          if (state === 'CAUGHT') enterState('IDLE');
        }, 2500);
        break;
      }

      case 'SNAPPED':
        Audio.stopReel();
        Audio.snap();
        _vibrate([200, 100, 400]);
        ui.tensionCont.classList.add('hidden');
        tension = 0;
        ui.lure.style.display = 'none';
        _hideLinePath();
        _destroyActiveFish();
        setLabel(I18n.t('state_snapped'));
        sayKey('snapped');
        // Ambos os modos: volta ao IDLE sem interromper o fluxo
        setTimeout(() => { if (state === 'SNAPPED') enterState('IDLE'); }, 2500);
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
          sayKey('pulled_out');
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
      setTimeout(() => _vibrate([300, 100, 400]), 30);
      sayKey('rehooked');
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
        _vibrate(30);
        setTensionClass('tension-danger');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 3000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();               // ← novo alerta sonoro
          sayKey('danger');
        }
      } else if (tension > 65) {
        setTensionClass('tension-high');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 5000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();               // ← novo alerta sonoro
          sayKey('tension');
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
    const ms = currentFish.tiredBase * (1 + jitter) * A11y.timeScale();
    tiredTimer = setTimeout(() => {
      if (state === 'REELING') {
        fishTired = true;
        sayKey('tired');
        setLabel(I18n.t('state_tired', fishName(currentFish)));
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
  // ── Equipamento / Iscas ───────────────────────────────────────────────────

  /** Atualiza o indicador de isca no HUD do modo normal */
  function refreshBaitHud() {
    if (gameMode !== 'normal') return;
    const equip  = Inventory.getEquip();
    const baitId = equip.bait;
    const bait   = BAIT_CATALOG[baitId];
    const qty    = Inventory.baitCount(baitId);
    if (ui.baitEmoji) ui.baitEmoji.textContent = bait ? bait.emoji : '?';
    if (ui.baitName)  ui.baitName.textContent  = bait ? I18n.t(bait.nameKey) : baitId;
    if (ui.baitQty)   ui.baitQty.textContent   = `×${qty}`;
  }

  /** Abre o painel de equipamento — só disponível no IDLE */
  function openEquipPanel() {
    _renderBaitList();
    ui.equipPanel.classList.remove('hidden');
    const firstBtn = ui.baitList.querySelector('button:not([disabled])') ||
                     ui.baitList.querySelector('button');
    if (firstBtn) firstBtn.focus();
    else $('btn-equip-close').focus();
  }

  function closeEquipPanel() {
    ui.equipPanel.classList.add('hidden');
    $('btn-equip').focus();
  }

  /** Renderiza a lista de iscas disponíveis no painel */
  function _renderBaitList() {
    const baits  = Inventory.getBaits();
    const equip  = Inventory.getEquip();
    ui.baitList.innerHTML = '';

    const ids = Object.keys(BAIT_CATALOG);
    if (ids.every(id => (baits[id] ?? 0) === 0)) {
      const li = document.createElement('li');
      li.className = 'bait-item bait-empty';
      li.textContent = I18n.t('equip_no_bait');
      ui.baitList.appendChild(li);
      return;
    }

    ids.forEach(id => {
      const qty  = baits[id] ?? 0;
      const bait = BAIT_CATALOG[id];
      const isEq = equip.bait === id;

      const li  = document.createElement('li');
      li.className = `bait-item${isEq ? ' bait-equipped' : ''}${qty === 0 ? ' bait-out' : ''}`;

      const label = document.createElement('span');
      label.className = 'bait-item-label';
      label.textContent = `${bait.emoji} ${I18n.t(bait.nameKey)}`;

      const qtyEl = document.createElement('span');
      qtyEl.className = 'bait-item-qty';
      qtyEl.textContent = I18n.t('equip_qty', qty);

      const btn = document.createElement('button');
      btn.className = 'btn-bait-select';
      btn.textContent = isEq ? I18n.t('equip_selected') : I18n.t('equip_select');
      btn.disabled = qty === 0 || isEq;
      btn.setAttribute('aria-pressed', isEq ? 'true' : 'false');
      btn.addEventListener('click', () => {
        if (Inventory.equipBait(id)) {
          speak(I18n.t('equip_consume_ok', I18n.t(bait.nameKey), Inventory.baitCount(id)));
          refreshBaitHud();
          closeEquipPanel();
        }
      });

      li.append(label, qtyEl, btn);
      ui.baitList.appendChild(li);
    });
  }

  // ── Mordida com influência de isca ────────────────────────────────────────

  function scheduleNextBite() {
    let ms = (3000 + Math.random() * 7000) * A11y.timeScale();

    // Modo normal: isca afeta o tempo de espera e a chance de o peixe ir embora
    if (gameMode === 'normal' && currentFish) {
      const equip  = Inventory.getEquip();
      const baitId = equip.bait;
      const liked  = currentFish.baits && currentFish.baits.includes(baitId);

      if (liked) {
        // Isca preferida: peixe morde 40% mais rápido
        ms *= 0.6;
      } else {
        // Isca errada: 35% de chance de o peixe ir embora sem morder
        ms *= 1.4;
        if (Math.random() < 0.35) {
          waitTimer = setTimeout(() => {
            if (state === 'WAITING') {
              speak(I18n.t('bait_wrong_fish_left'));
              enterState('IDLE');
            }
          }, ms);
          return;
        }
      }
    }

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
      // Captura individual (não usado no Free Fishing mais)
      const useEl = $('result-fish-use');
      if (useEl) useEl.setAttribute('href', `#${currentFish.sprite}`);
      $('result-fish-svg').style.display = '';
      ui.resultTitle.textContent = I18n.t('result_caught');
      if (_lastCaughtItem) {
        ui.resultDesc.textContent = I18n.t(
          'result_caught_weight',
          fishName(currentFish),
          _lastCaughtItem.weight,
          _lastCaughtItem.value,
          Inventory.coins()
        );
      } else {
        ui.resultDesc.textContent = I18n.t('result_caught_desc', fishName(currentFish));
      }
    } else if (gameMode === 'free' && score > 0) {
      // Free Fishing — resumo da sessão ao sair
      $('result-fish-svg').style.display = 'none';
      ui.resultIcon.innerHTML    = '<span style="font-size:80px">🎣</span>';
      ui.resultTitle.textContent = I18n.t('result_session_title');
      ui.resultDesc.textContent  = I18n.t('result_session_desc', score, Inventory.coins());
    } else {
      // Linha arrebentou ou saiu sem pescar nada
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

    // Free Fishing: exibe resumo da sessão ao sair (se pescou algo)
    if (gameMode === 'free' && score > 0) {
      showResultScreen(false); // false = não foi captura, é sumário de saída
      return;
    }

    state = 'IDLE';
    showScreen('start');
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showScreen(name) {
    // Desativa e bloqueia TODAS as telas conhecidas (incluindo lang)
    Object.entries(screens).forEach(([, s]) => {
      s.classList.remove('active');
      s.setAttribute('inert', '');
    });

    // Ativa só a tela pedida
    const target = screens[name];
    if (!target) return;
    target.classList.add('active');
    target.removeAttribute('inert');

    // Move foco para o h2 (ou primeiro botão) — leitor anuncia ao entrar
    requestAnimationFrame(() => {
      const heading = target.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
        return;
      }
      const btn = target.querySelector('button:not([disabled])');
      if (btn) btn.focus();
    });
  }

  function setLabel(text)  { ui.stateLabel.textContent = text; }

  /** Vibra apenas se háptica estiver ativada nas preferências */
  function _vibrate(pattern) { if (A11y.get('haptic')) Audio.vibrate(pattern); }

  /** Toca som apenas se som estiver ativado nas preferências */
  function _play(id) { if (A11y.get('sound')) Audio.play(id); }

  function speak(text) {
    ui.announcer.textContent = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ui.announcer.textContent = text;
    }));
  }

  /**
   * Fala uma chave i18n escolhendo automaticamente a versão detalhada
   * quando o toggle de narração está ativo.
   * Uso: sayKey('ready')  →  speak(I18n.t('speak_ready'))  ou  speak(I18n.t('vspeak_ready'))
   * Para strings com argumentos: sayKey('caught', fishName, sizeDesc, score)
   */
  function sayKey(key, ...args) {
    const verbose = typeof A11y !== 'undefined' && A11y.get('verboseVoice');
    const fullKey = verbose ? `vspeak_${key}` : `speak_${key}`;
    speak(I18n.t(fullKey, ...args));
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
