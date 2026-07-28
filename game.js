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
  const t = (key, ...args) => I18n.t(key, ...args);

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
  let activeZone       = null;   // zona ativa no mapa atual
  let _lastCaughtItem  = null;   // último item adicionado ao inventário
  let tension          = 0;      // 0..100
  let fishPull         = 0;
  let _fishStrengthMult = 1.0;  // multiplicador gradual de força (1.0 = 100%, 0.3 = cansado)
  let fishTired        = false;
  let tiredTimer       = null;
  let recoveryTimer    = null;   // timer de recuperação do fôlego do peixe
  let tensionLoop      = null;
  let _lastTensionWarn = null;
  let waitTimer        = null;
  let biteTimer        = null;
  let fishEls          = [];     // peixes decorativos de fundo
  let _pulling         = false;  // sinalizado por pullFish(), lido pelo tensionLoop
  let _pullGraceTicks  = 0;      // janela de tolerância após último pull
  let _staticTicks     = 0;      // ticks consecutivos sem o jogador puxar
  let _fishFatigue     = 0;      // acúmulo de cansaço por inércia do jogador
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
    // ── Parâmetros de teste (só ativo em dev/preview) ─────────────────────
    const _qp = new URLSearchParams(location.search);
    if (_qp.has('testcoins')) {
      const amt = parseInt(_qp.get('testcoins')) || 500;
      if (Inventory.coins() < amt) Inventory.addCoins(amt - Inventory.coins());
    }
    if (_qp.has('testboat')) {
      const boatId = _qp.get('testboat') || 'canoe';
      Inventory.addEquip(boatId);
      Inventory.setActiveBoat(boatId);   // equipa automaticamente no QA
    }
    if (_qp.has('testlang')) {
      const langCode = _qp.get('testlang');
      if (langCode) { I18n.setLang(langCode); }
    }
    if (_qp.has('testlang') || _qp.has('clearlang')) {
      if (_qp.has('clearlang')) localStorage.removeItem('bb_lang');
    }
    if (_qp.has('testzone')) {
      // ex: ?testzone=lago_central:raso,meio
      const [mapId, zonesStr] = _qp.get('testzone').split(':');
      if (mapId && zonesStr) {
        zonesStr.split(',').forEach(z => Inventory.knowZone(mapId, z.trim()));
      }
    }
    // ─────────────────────────────────────────────────────────────────────

        screens = {
      lang:         $('screen-lang'),
      start:        $('screen-start'),
      storyHub:     $('screen-story-hub'),
      game:         $('screen-game'),
      result:       $('screen-result'),
      instructions: $('screen-instructions'),
      options:      $('screen-options'),
      inventory:    $('screen-inventory'),
      shop:         $('screen-shop'),
      travel:       $('screen-travel'),
      vessel:       $('screen-vessel'),
      house:        $('screen-house'),
    };

    // Garante que só screen-lang está ativa no carregamento inicial
    Object.entries(screens).forEach(([key, s]) => {
      if (key !== 'lang' && s) {
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
    // Garantir que o lago_margem já começa com zona 'margem' conhecida
    if (activeMap.zones && activeMap.zones.length) {
      Inventory.knowZone(activeMap.id, activeMap.zones[0].id);
    }
    activeZone = Inventory.getActiveZone(activeMap.id) || (activeMap.zones && activeMap.zones[0].id) || null;

    // Preferências de acessibilidade — carrega antes de tudo
    A11y.init();

    // Idioma salvo
    if (I18n.getLang()) {
      applyI18n();   // atualiza aria-labels dos toggles com idioma correto
      showScreen('start');
    }

    $('btn-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-lang-hu').addEventListener('click', () => selectLang('hu'));

    // ── Menu Principal ─────────────────────────────────────────────────────
    $('btn-story').addEventListener('click', () => { gameMode = 'normal'; showStoryHub(); });
    $('btn-free').addEventListener('click',  () => startGame('free'));
    $('btn-instructions').addEventListener('click', () => showScreen('instructions'));
    $('btn-back').addEventListener('click',  () => showScreen('start'));
    $('btn-options').addEventListener('click', () => { _syncToggles(); showScreen('options'); });
    $('btn-options-back').addEventListener('click', () => showScreen('start'));

    // ── Hub da História ────────────────────────────────────────────────────
    // Hub da cidade
    $('btn-hub-shop').addEventListener('click',   () => { renderShop(); showScreen('shop'); });
    $('btn-hub-inv').addEventListener('click',    () => { renderInventory(); showScreen('inventory'); });
    $('btn-hub-travel').addEventListener('click', () => { renderTravel(); showScreen('travel'); });
    $('btn-hub-vessel').addEventListener('click', () => { renderVessel(); showScreen('vessel'); });
    $('btn-hub-home').addEventListener('click',   () => { renderHouse();  showScreen('house');  });
    $('btn-house-back').addEventListener('click', () => showStoryHub());
    $('btn-hub-back').addEventListener('click',   () => showScreen('start'));
    // Tela de viagem
    $('btn-travel-back').addEventListener('click',() => showStoryHub());
    // Estaleiro
    $('btn-vessel-back').addEventListener('click',() => showStoryHub());

    // ── Loja (acesso via hub) ──────────────────────────────────────────────
    $('btn-shop-back').addEventListener('click', () => showStoryHub());

    // Mode-tabs Comprar / Vender
    document.querySelectorAll('.shop-mode-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shop-mode-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const mode = btn.dataset.mode;
        $('shop-panel-buy').classList.toggle('hidden',  mode !== 'buy');
        $('shop-panel-sell').classList.toggle('hidden', mode !== 'sell');
      });
    });

    // Sub-guias dentro de cada painel
    document.querySelectorAll('#shop-panel-buy .shop-tab').forEach(tab => {
      tab.addEventListener('click', () => _switchPanelTab('shop-panel-buy', tab.dataset.tab, 'buy'));
    });
    document.querySelectorAll('#shop-panel-sell .shop-tab').forEach(tab => {
      tab.addEventListener('click', () => _switchPanelTab('shop-panel-sell', tab.dataset.tab, 'sell'));
    });

    // ── Inventário (acesso via hub) ────────────────────────────────────────
    $('btn-inv-back').addEventListener('click', () => showStoryHub());
    document.querySelectorAll('#screen-inventory .shop-tab').forEach(tab => {
      tab.addEventListener('click', () => _switchPanelTab('screen-inventory', tab.dataset.tab, 'inv'));
    });
    $('btn-opt-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-opt-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-opt-lang-hu')?.addEventListener('click', () => selectLang('hu'));
    $('btn-menu').addEventListener('click',  () => goToMenu());
    $('btn-menu2').addEventListener('click', () => goToMenu());
    $('btn-continue').addEventListener('click', () => {
      startGame(gameMode);
    });

    // ── Barra inferior (modo história) ────────────────────────────────────
    $('btn-bar-equip').addEventListener('click', () => openEquipPanel());
    $('btn-bar-zone')?.addEventListener('click', () => openZoneModal());
    $('btn-zone-modal-back')?.addEventListener('click', () => closeZoneModal());
    $('btn-bar-hub').addEventListener('click', () => {
      Sensors.stop();
      goToMenu();
    });

    // Painel de equipamento
    $('btn-equip-close').addEventListener('click', () => closeEquipPanel());

    // Navegação interna do painel
    $('btn-cat-baits').addEventListener('click', () => {
      _renderBaitList();
      _showEquipView('baits');
      const firstBtn = ui.baitList.querySelector('button:not([disabled])') ||
                       ui.baitList.querySelector('button') ||
                       $('btn-equip-back');
      firstBtn.focus();
    });
    $('btn-equip-back').addEventListener('click', () => {
      _showEquipView('categories');
      $('btn-cat-baits').focus();
    });

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
    try {
      gameMode = mode;

      // 1. Troca de tela PRIMEIRO — imediato, sem await
      showScreen('game');

      // 2. Sensores e áudio: fire-and-forget, nunca bloqueiam
      Sensors.requestPermission().then(ok => {
        if (!ok) Sensors.enableDesktopFallback();
      }).catch(() => Sensors.enableDesktopFallback());
      Audio.init().catch(() => {});

      // 3. HUDs
      const scoreHud = $('score-hud');
      if (scoreHud) scoreHud.classList.toggle('hidden', gameMode !== 'free');
      if (ui.normalHud) ui.normalHud.classList.toggle('hidden', gameMode !== 'normal');

      // "Pescar de novo" só no modo normal
      const btnContinue = $('btn-continue');
      if (btnContinue) btnContinue.classList.toggle('hidden', gameMode === 'free');

      // Indicador de isca
      if (gameMode === 'normal') refreshBaitHud();

      // Texto do botão voltar — depende do modo
      const btnMenuEl = $('btn-menu');
      if (btnMenuEl) {
        const _bk = gameMode === 'free' ? 'btn_back_main' : 'btn_back_hub';
        btnMenuEl.setAttribute('data-i18n', _bk);
        btnMenuEl.textContent = I18n.t(_bk);
      }

      score = 0;
      updateScore();
      fishEls = [];
      spawnBackgroundFish();
      _updateZoneHud();
      Sensors.start();
      Audio.startAmbient();
      enterState('IDLE');
    } catch (err) {
      console.error('[startGame]', err);
      if (ui && ui.announcer) speak(String(err && err.message ? err.message : err));
    }
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
        // Só narra "pronto" se a tela de jogo estiver ativa
        if (screens.game && screens.game.classList.contains('active')) {
          sayKey('ready');
        }
        // Barra inferior: visível só no modo história
        { const bar = $('game-bottom-bar'); if (bar) bar.classList.toggle('hidden', gameMode !== 'normal'); }
        { const btnM = $('btn-menu'); if (btnM) btnM.classList.toggle('hidden', gameMode === 'normal'); }
        break;

      case 'CASTING':
        // Modo normal: verifica slots e consome 1 isca
        if (gameMode === 'normal') {
          // Verificar slots obrigatórios
          const _equip  = Inventory.getEquip();
          const _slots  = ['rod','line','hook','float'];
          const _missing = _slots.find(s => !_equip[s]);
          if (_missing) {
            speak(I18n.t('inv_slot_empty_' + _missing) || `Sem ${_missing} equipado.`);
            enterState('IDLE');
            break;
          }
          const result = Inventory.consumeBait();
          if (!result.ok) {
            speak(I18n.t('bait_no_stock'));
            enterState('IDLE');
            break;
          }
          refreshBaitHud();
        }

        // Esconde barra inferior durante o cast/combate
        { const bar = $('game-bottom-bar'); if (bar) bar.classList.add('hidden'); }

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
        currentFish = pickFishFromMap(activeMap, activeZone);
        fishPull    = currentFish.pull;
        fishTired   = false;
        _fishStrengthMult = 1.0;
        clearTimeout(recoveryTimer);
        recoveryTimer = null;
        _pulling        = false;
        _pullGraceTicks = 0;
        _staticTicks    = 0;
        _fishFatigue    = 0;

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

        // Modo normal: registra no inventário e calcula moedas
        // Modo livre: não registra moedas nem inventário
        const caughtItem = (gameMode !== 'free') ? Inventory.addFish(currentFish) : null;
        _lastCaughtItem = caughtItem;

        setLabel(I18n.t('state_caught', fishName(currentFish)));
        {
          const sizeDesc = currentFish.size <= 1 ? I18n.t('size_tiny')
                         : currentFish.size <= 2 ? I18n.t('size_small')
                         : currentFish.size <= 3 ? I18n.t('size_medium')
                         :                         I18n.t('size_large');
          const kg    = caughtItem ? caughtItem.weight.toFixed(2) : null;
          const coins = caughtItem ? caughtItem.value : null;
          if (currentFish.special) {
            sayKey(gameMode === 'free' ? 'caught_special' : 'caught_special_noscore',
                   fishName(currentFish), gameMode === 'free' ? score : kg, gameMode === 'free' ? undefined : coins);
          } else {
            sayKey(gameMode === 'free' ? 'caught' : 'caught_noscore',
                   fishName(currentFish), sizeDesc, gameMode === 'free' ? score : kg, gameMode === 'free' ? undefined : coins);
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

      case 'ESCAPED':
        Audio.stopReel();
        clearTimeout(recoveryTimer);
        recoveryTimer = null;
        _vibrate([100, 80, 100]);
        ui.tensionCont.classList.add('hidden');
        tension = 0;
        ui.lure.style.display = 'none';
        _hideLinePath();
        _destroyActiveFish();
        setLabel(I18n.t('state_escaped_reel', fishName(currentFish)));
        sayKey('escaped_reel');
        // Pequeno delay para garantir que o stopReel finalizou antes de tocar
        setTimeout(() => Audio.fishEscaped(), 120);
        // Ambos os modos: volta ao IDLE
        setTimeout(() => { if (state === 'ESCAPED') enterState('IDLE'); }, 2500);
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
    _pullProgress    = 0;
    let _resistCooldown  = 0;
    _staticTicks     = 0;
    _fishFatigue     = 0;
    _pulling         = false;
    _pullGraceTicks  = 0;

    tensionLoop = setInterval(() => {
      if (state !== 'REELING') { clearInterval(tensionLoop); return; }

      // ── Força do peixe ─────────────────────────────────────────────────
      // fishTired → mult cai para 0.3; ao recuperar, sobe gradualmente de volta a 1.0
      if (fishTired) {
        _fishStrengthMult = Math.max(0.3, _fishStrengthMult - 0.04);
      } else {
        _fishStrengthMult = Math.min(1.0, _fishStrengthMult + 0.015); // ramp-up lento
      }
      const fishForce = fishPull * _fishStrengthMult;
      const delta = fishForce * 0.05;
      tension = Math.min(100, tension + delta);

      if (fishPull >= 5 && delta > 0.2 && _resistCooldown <= 0 && _fishStrengthMult > 0.8) {
        Audio.fishResist();
        Audio.setReelMode('neutral');
        _resistCooldown = 8;
      }
      if (_resistCooldown > 0) _resistCooldown--;

      // ── Cansaço por inércia (linha estática com peixe lutando) ─────────
      if (_pulling) {
        // Jogador está puxando — zera inércia e não acumula cansaço
        _staticTicks = 0;
        _fishFatigue = 0;
        _pulling = false; // reset até próximo pullFish()
        _pullGraceTicks = 4; // janela de tolerância: 4 ticks (~480ms) após último pull
      } else if (_pullGraceTicks > 0) {
        // Ainda dentro da janela de graça — não penaliza
        _pullGraceTicks--;
      } else {
        _staticTicks++;

        // Peixe se debatendo e jogador parado → acumula fadiga
        if (!fishTired && fishPull > 0) {
          _fishFatigue++;
          const stamina = currentFish.stamina ?? 15;
          if (_fishFatigue >= stamina) {
            _fishFatigue = 0;
            fishTired = true;
            Audio.fishTiredSound();
            sayKey('tired');
            setLabel(I18n.t('state_tired', fishName(currentFish)));

            // Timer de recuperação — se o jogador não aproveitar a janela
            clearTimeout(recoveryTimer);
            const recovMs = (currentFish.recovery ?? 5000) * A11y.timeScale();
            recoveryTimer = setTimeout(() => {
              if (state === 'REELING' && fishTired) {
                fishTired = false;
                Audio.fishRecoveredSound();
                sayKey('recovered');
                setLabel(I18n.t('state_reeling', fishName(currentFish)));
              }
            }, recovMs);
          }
        }

        // Punição por inércia total — peixe perde a paciência e escapa
        const patience = currentFish.escapePatience ?? 50;
        if (_staticTicks >= patience) {
          clearInterval(tensionLoop);
          enterState('ESCAPED');
          return;
        }
      }

      // ── Níveis de tensão ───────────────────────────────────────────────
      if (tension > 85) {
        _vibrate(30);
        setTensionClass('tension-danger');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 3000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();
          sayKey('danger');
        }
      } else if (tension > 65) {
        setTensionClass('tension-high');
        if (!_lastTensionWarn || Date.now() - _lastTensionWarn > 5000) {
          _lastTensionWarn = Date.now();
          Audio.tensionAlert();
          sayKey('tension');
        }
      } else if (tension > 40) {
        setTensionClass('tension-medium');
      } else {
        setTensionClass('tension-low');
      }

      if (tension >= 100) { clearInterval(tensionLoop); enterState('SNAPPED'); return; }
      _updateLinePath();
      updateTensionBar();
    }, 120);
  }

  function pullFish(amount) {
    if (state !== 'REELING') return;
    Audio.setReelMode('pulling');
    _pullProgress += amount;
    _pulling = true; // sinaliza ao tensionLoop que houve ação neste tick
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
    const base = currentFish.tiredBase ?? 5000;
    const ms = base * (1 + jitter) * A11y.timeScale();
    tiredTimer = setTimeout(() => {
      if (state === 'REELING') {
        fishTired = true;
        Audio.fishTiredSound();
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
    _showEquipView('categories');
    ui.equipPanel.classList.remove('hidden');
    $('btn-cat-baits').focus();
  }

  function closeEquipPanel() {
    ui.equipPanel.classList.add('hidden');
    // Retorna foco ao botão de equipamento na barra inferior
    const target = $('btn-bar-equip') || $('btn-menu');
    if (target) target.focus();
  }

  /** Alterna entre a vista de categorias e a de iscas */
  function _showEquipView(view) {
    $('equip-categories').classList.toggle('hidden', view !== 'categories');
    $('equip-baits-view').classList.toggle('hidden', view !== 'baits');
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
    } else {
      $('result-fish-svg').style.display = 'none';
      ui.resultIcon.innerHTML    = '<span style="font-size:80px">💔</span>';
      ui.resultTitle.textContent = I18n.t('result_snapped');
      ui.resultDesc.textContent  = I18n.t('result_snapped_desc');
    }
    if (typeof GameTime !== 'undefined' && gameMode === 'normal') {
      GameTime.advance('fish');
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
    setLabel('');
    const ann = $('announcer');
    if (ann) ann.textContent = '';
    // Esconde a barra inferior ao sair do jogo
    const bar = $('game-bottom-bar');
    if (bar) bar.classList.add('hidden');
    // Se veio do modo história, volta pro hub; pesca livre volta pro menu principal
    if (gameMode === 'normal') {
      showStoryHub();
    } else {
      showScreen('start');
    }
  }

  /** Atualiza o HUD de moedas + tempo no hub da cidade */
  function _refreshHubHUD() {
    const coinsEl = $('hub-coins');
    if (coinsEl) coinsEl.textContent = Inventory.coins();
    if (typeof GameTime !== 'undefined') {
      const hud = GameTime.formatHUD();
      const dateEl  = $('hub-date');
      const clockEl = $('hub-clock');
      if (dateEl)  dateEl.textContent  = hud.date;
      if (clockEl) clockEl.textContent = hud.time;
    }
  }

  /** Exibe o hub da cidade */
  function showStoryHub() {
    _refreshHubHUD();
    showScreen('storyHub');
  }

  /** Salva o mapa ativo e atualiza o estado interno */
  function setActiveMap(mapId) {
    const map = MAP_CATALOG[mapId];
    if (!map) return;
    localStorage.setItem('bb_map', mapId);
    // Atualiza cena visual
    if (activeMap) ui.scene.classList.remove(activeMap.sceneClass);
    activeMap = map;
    ui.scene.classList.add(activeMap.sceneClass);
    // Revelar primeira zona se nunca visitado
    if (activeMap.zones && activeMap.zones.length) {
      const firstPublic = activeMap.zones.find(z => !z.hidden);
      if (firstPublic) Inventory.knowZone(activeMap.id, firstPublic.id);
    }
    // Restaurar zona ativa
    activeZone = Inventory.getActiveZone(activeMap.id)
              || (activeMap.zones && activeMap.zones.find(z => !z.hidden)?.id)
              || null;
  }

  // ── Casa ───────────────────────────────────────────────────────────────────

  /** Renderiza a tela da casa com nível atual e próximo upgrade. */
  function renderHouse() {
    const levelIdx  = Inventory.getHouseLevel();
    const current   = getHouseLevel(levelIdx);
    const next      = getNextHouseLevel(levelIdx);
    const coins     = Inventory.coins();

    const currentCard  = $('house-current-card');
    const upgradeCard  = $('house-upgrade-card');
    const upgradeSec   = $('house-upgrade-section');
    const maxedMsg     = $('house-maxed-msg');

    // Monta card do nível atual
    const ownedBoats = Inventory.getOwnedEquip();
    const storedDesc = current.boatTypes.length === 0
      ? I18n.t('house_storage_none') || 'Sem armazenamento para barcos'
      : `${I18n.t('house_storage_boats') || 'Barcos guardados'}: ${current.boatSlots === 99
          ? I18n.t('house_storage_unlimited') || 'Ilimitado'
          : current.boatSlots} · ${current.boatTypes.map(t => I18n.t('boat_cat_' + t) || t).join(', ')}`;

    currentCard.innerHTML =
      `<div class="house-card-info">
         <span class="house-card-icon">${current.emoji}</span>
         <div>
           <span class="house-card-name">${I18n.t(current.nameKey) || current.id}</span>
           <span class="house-card-desc">${I18n.t(current.descKey) || ''}</span>
           <span class="house-card-storage">${storedDesc}</span>
         </div>
       </div>`;

    // Upgrade disponível?
    if (next) {
      maxedMsg.hidden   = true;
      upgradeSec.hidden = false;

      const canAfford   = coins >= next.price;
      const nextStorage = next.boatTypes.length === 0
        ? I18n.t('house_storage_none') || 'Sem armazenamento'
        : `${I18n.t('house_storage_boats') || 'Barcos'}: ${next.boatSlots === 99
            ? I18n.t('house_storage_unlimited') || 'Ilimitado'
            : next.boatSlots} · ${next.boatTypes.map(t => I18n.t('boat_cat_' + t) || t).join(', ')}`;

      upgradeCard.innerHTML =
        `<div class="house-card-info">
           <span class="house-card-icon">${next.emoji}</span>
           <div>
             <span class="house-card-name">${I18n.t(next.nameKey) || next.id}</span>
             <span class="house-card-desc">${I18n.t(next.descKey) || ''}</span>
             <span class="house-card-storage">${nextStorage}</span>
             <span class="house-card-price">${next.price} 🪙</span>
           </div>
         </div>
         <button id="btn-house-upgrade" class="btn-primary"
                 ${canAfford ? '' : 'disabled'}
                 aria-label="${I18n.t('house_btn_upgrade') || 'Melhorar'} — ${I18n.t(next.nameKey) || next.id}">
           ${canAfford
             ? (I18n.t('house_btn_upgrade') || 'Melhorar')
             : (I18n.t('vessel_no_coins')   || 'Moedas insuficientes')}
         </button>`;

      $('btn-house-upgrade').onclick = () => {
        if (!Inventory.spendCoins(next.price)) return;
        Inventory.upgradeHouse();
        renderHouse();
      };
    } else {
      upgradeSec.hidden = true;
      maxedMsg.hidden   = false;
    }
  }

  // ── Estaleiro ─────────────────────────────────────────────────────────────

  /** Renderiza a tela do estaleiro com embarcações para comprar e possuídas. */
  function renderVessel() {
    const owned      = Inventory.getOwnedEquip();
    const activeBoat = Inventory.getActiveBoat();
    const coins      = Inventory.coins();
    const buyList    = $('vessel-buy-list');
    const ownedList  = $('vessel-owned-list');
    const ownedSec   = $('vessel-owned-section');

    buyList.innerHTML   = '';
    ownedList.innerHTML = '';

    const toBuy  = VESSELS_CATALOG.filter(v => !owned.includes(v.id));
    const toShow = VESSELS_CATALOG.filter(v =>  owned.includes(v.id));

    // ── Disponíveis para compra ──────────────────────────────────────────
    toBuy.forEach(v => {
      const canAfford = coins >= v.price;
      const li = document.createElement('li');
      li.className = 'vessel-card';
      li.setAttribute('role', 'listitem');
      li.innerHTML =
        `<div class="vessel-card-info">
           <span class="vessel-card-name">${I18n.t('boat_' + v.id) || v.id}</span>
           <span class="vessel-card-desc">${I18n.t(v.descKey) || ''}</span>
           <span class="vessel-card-price">${v.price} 🪙 · Porão: ${v.holdCap} peixes</span>
         </div>
         <div class="vessel-card-actions">
           <button class="btn-primary btn-buy-vessel"
                   data-vessel-id="${v.id}"
                   ${canAfford ? '' : 'disabled'}
                   aria-label="${I18n.t('vessel_btn_buy') || 'Comprar'} ${I18n.t('boat_' + v.id) || v.id}">
             ${canAfford ? I18n.t('vessel_btn_buy') || 'Comprar' : I18n.t('vessel_no_coins') || 'Sem moedas'}
           </button>
         </div>`;
      buyList.appendChild(li);
    });

    if (toBuy.length === 0) {
      const li = document.createElement('li');
      li.textContent = I18n.t('vessel_owned_title') || '';
      buyList.appendChild(li);
    }

    // ── Possuídas ────────────────────────────────────────────────────────
    if (toShow.length > 0) {
      ownedSec.hidden = false;
      toShow.forEach(v => {
        const isActive = v.id === activeBoat;
        const li = document.createElement('li');
        li.className = 'vessel-card';
        li.setAttribute('role', 'listitem');
        li.innerHTML =
          `<div class="vessel-card-info">
             <span class="vessel-card-name">${I18n.t('boat_' + v.id) || v.id}</span>
             <span class="vessel-card-desc">${I18n.t(v.descKey) || ''}</span>
             <span class="vessel-card-price">Porão: ${v.holdCap} peixes</span>
           </div>
           <div class="vessel-card-actions">
             ${isActive
               ? `<span class="vessel-equipped-badge">${I18n.t('vessel_equipped_label') || '✅ Em uso'}</span>`
               : `<button class="btn-secondary btn-equip-vessel"
                          data-vessel-id="${v.id}"
                          aria-label="${I18n.t('vessel_equip') || 'Usar'} ${I18n.t('boat_' + v.id) || v.id}">
                    ${I18n.t('vessel_equip') || 'Usar este barco'}
                  </button>`}
           </div>`;
        ownedList.appendChild(li);
      });
    } else {
      ownedSec.hidden = true;
    }

    // ── Delegação de eventos ─────────────────────────────────────────────
    buyList.onclick = e => {
      const btn = e.target.closest('.btn-buy-vessel');
      if (!btn || btn.disabled) return;
      const vid = btn.dataset.vesselId;
      const v   = getVessel(vid);
      if (!v) return;
      if (!Inventory.spendCoins(v.price)) return;
      Inventory.addEquip(v.id);
      // Equipa automaticamente se for o primeiro barco
      if (!Inventory.getActiveBoat()) Inventory.setActiveBoat(v.id);
      renderVessel();
    };

    ownedList.onclick = e => {
      const btn = e.target.closest('.btn-equip-vessel');
      if (!btn) return;
      Inventory.setActiveBoat(btn.dataset.vesselId);
      renderVessel();
    };
  }

  /** Renderiza a tela de seleção de destino */
  function renderTravel() {
    const map     = getActiveMap();
    const nameEl  = $('travel-current-name');
    const emojiEl = $('travel-current-emoji');
    if (nameEl)  nameEl.textContent  = I18n.t(map.nameKey) || map.id;
    if (emojiEl) emojiEl.textContent = map.emoji || '🏞️';

    const list = $('travel-dest-list');
    if (!list) return;
    list.innerHTML = '';

    // Barcos que o jogador possui (via bb_owned_equip)
    const ownedEquip = Inventory.getOwnedEquip();

    MAPS.forEach(m => {
      const isActive  = m.id === map.id;
      const hasBoat   = !m.requiredBoat || ownedEquip.includes(m.requiredBoat);
      const li = document.createElement('li');
      li.className = 'travel-item' + (isActive ? ' travel-item--active' : '');

      let actionsHtml;
      if (isActive) {
        actionsHtml = `<button class="btn-primary btn-sm travel-btn-fish"
                               data-map-id="${m.id}"
                               aria-label="${I18n.t('travel_fish_here')} — ${I18n.t(m.nameKey) || m.id}">
                         ${I18n.t('travel_fish_here')}
                       </button>`;
      } else if (hasBoat) {
        actionsHtml = `<button class="btn-secondary btn-sm travel-btn-go"
                               data-map-id="${m.id}"
                               aria-label="${I18n.t('travel_go_to') || 'Ir para'} ${I18n.t(m.nameKey) || m.id}">
                         🗺️ ${I18n.t('travel_go') || 'Ir'}
                       </button>`;
      } else {
        const lockMsg = m.requiredBoat
          ? `🚣 ${I18n.t('travel_need_boat') || 'Precisa de barco'}: ${I18n.t('boat_' + m.requiredBoat) || m.requiredBoat}`
          : I18n.t('travel_locked') || '🔒';
        actionsHtml = `<span class="travel-locked" aria-label="${lockMsg}">${lockMsg}</span>`;
      }

      li.innerHTML = `
        <span class="travel-item-emoji" aria-hidden="true">${m.emoji || '🏞️'}</span>
        <div class="travel-item-info">
          <span class="travel-item-name">${I18n.t(m.nameKey) || m.id}</span>
          ${m.requiredBoat ? `<span class="travel-item-vessel" aria-hidden="true">🚣</span>` : ''}
        </div>
        <div class="travel-item-actions">${actionsHtml}</div>`;

      // Pescar no mapa atual
      li.querySelector('.travel-btn-fish')?.addEventListener('click', () => {
        startGame('normal');
      });

      // Viajar para outro mapa — cobrar taxa de estaleiro se necessário
      li.querySelector('.travel-btn-go')?.addEventListener('click', e => {
        const destId    = e.currentTarget.dataset.mapId;
        const boatId    = Inventory.getActiveBoat();
        const fee       = Inventory.calcBoatFee(boatId);

        if (fee > 0) {
          // Verificar se tem moedas suficientes
          if (Inventory.coins() < fee) {
            const vessel = VESSELS_CATALOG.find(v => v.id === boatId);
            const name   = vessel ? (I18n.t(vessel.nameKey) || vessel.id) : boatId;
            announce(`${I18n.t('vessel_no_coins') || 'Moedas insuficientes'} — ${I18n.t('house_dock_fee') || 'Taxa'}: ${fee} 🪙`);
            return;
          }
          // Cobrar taxa e anunciar
          Inventory.spendCoins(fee);
          const vessel = VESSELS_CATALOG.find(v => v.id === boatId);
          const name   = vessel ? (I18n.t(vessel.nameKey) || vessel.id) : boatId;
          announce(`${I18n.t('house_fee_paid') || 'Taxa paga'}: ${fee} 🪙`);
        }

        setActiveMap(destId);
        showScreen('game');
        startGame('normal');
      });

      list.appendChild(li);
    });
  }

  // ── Modal de Zonas de Pesca ──────────────────────────────────────────────

  function openZoneModal() {
    const modal = $('zone-modal');
    const list  = $('zone-modal-list');
    if (!modal || !list) return;

    const map = activeMap;
    if (!map || !map.zones) return;

    list.innerHTML = '';
    const known = Inventory.getKnownZones(map.id);

    map.zones.forEach(zone => {
      if (zone.hidden && !known.includes(zone.id)) return; // oculta e desconhecida
      if (!known.includes(zone.id)) return;                // não revelada

      const isCurrent = zone.id === activeZone;
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      const btn = document.createElement('button');
      btn.className = 'btn-zone-select' + (isCurrent ? ' btn-zone-select--active' : '');
      btn.setAttribute('aria-pressed', String(isCurrent));
      if (isCurrent) btn.setAttribute('disabled', '');
      btn.innerHTML = `<span aria-hidden="true">${zone.emoji || '🎣'}</span> ${I18n.t(zone.nameKey) || zone.id}`;
      btn.addEventListener('click', () => {
        activeZone = zone.id;
        Inventory.setActiveZone(map.id, zone.id);
        closeZoneModal();
        // Anunciar a mudança para leitores de tela
        const ann = $('announcer');
        if (ann) ann.textContent = (I18n.t('zone_changed') || 'Zona alterada para') + ': ' + (I18n.t(zone.nameKey) || zone.id);
        // Atualizar label de zona no HUD
        _updateZoneHud();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });

    modal.classList.remove('hidden');
    modal.removeAttribute('inert');
    list.querySelector('button:not([disabled])')?.focus();
  }

  function closeZoneModal() {
    const modal = $('zone-modal');
    if (modal) { modal.classList.add('hidden'); modal.setAttribute('inert', ''); }
    $('btn-bar-zone')?.focus();
  }

  function _updateZoneHud() {
    if (!activeMap) return;
    const knownZones = Inventory.getKnownZones(activeMap.id);
    // Apenas zonas visíveis (não hidden ou já conhecidas) contam para o UI
    const visibleZones = (activeMap.zones || []).filter(z => !z.hidden || knownZones.includes(z.id));
    const hasMultiZone = visibleZones.length >= 2;

    // HUD de zona
    const hudZone = $('zone-hud');
    if (hudZone) hudZone.classList.toggle('hidden', !hasMultiZone);
    const nameEl = $('hud-zone-name');
    if (nameEl && activeZone) {
      const zone = activeMap.zones && activeMap.zones.find(z => z.id === activeZone);
      nameEl.textContent = zone ? (I18n.t(zone.nameKey) || zone.id) : '';
    }

    // Botão de zona na bottom bar
    const btnZone = $('btn-bar-zone');
    if (btnZone) btnZone.classList.toggle('hidden', !hasMultiZone);
  }

  // ── Loja / Inventário ─────────────────────────────────────────────────────

  function switchTab(screenId, tabName) {
    const screen = document.getElementById(screenId);
    screen.querySelectorAll('.shop-tab').forEach(btn => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active);
    });
    screen.querySelectorAll('.shop-tab-content').forEach(pane => {
      pane.classList.add('hidden');
    });
    const target = screen.querySelector(`#${screenId.replace('screen-','')==='inventory'?'inv':'shop'}-tab-${tabName}`);
    if (target) target.classList.remove('hidden');
  }

  function _switchPanelTab(panelId, tabName, prefix) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.querySelectorAll('.shop-tab').forEach(btn => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active);
    });
    panel.querySelectorAll('.shop-tab-content').forEach(pane => pane.classList.add('hidden'));
    const target = document.getElementById(`${prefix}-tab-${tabName}`);
    if (target) target.classList.remove('hidden');
  }

  function _shopFeedback(el, msg, ok = true) {
    el.textContent = msg;
    el.classList.remove('hidden', 'feedback-ok', 'feedback-err');
    el.classList.add(ok ? 'feedback-ok' : 'feedback-err');
    clearTimeout(el._feedbackTimer);
    el._feedbackTimer = setTimeout(() => el.classList.add('hidden'), 2500);
  }

  /* ── INVENTÁRIO ──────────────────────────────────────────────────────── */
  function renderInventory() {
    // Controla elementos que só existem no modo história
    const isStory = (gameMode === 'normal');
    const sellAllBar = document.querySelector('.inv-sell-all-bar');
    if (sellAllBar) sellAllBar.classList.add('hidden'); // Oculto permanentemente: venda agora é na loja
    const invBack = $('btn-inv-back');
    if (invBack) {
      invBack.classList.toggle('hidden', !isStory);

    }

    $('inv-coins').textContent = Inventory.coins();
    const fbEl   = $('inv-feedback');
    const equip  = Inventory.getEquip();

    // ── Aba Peixes ──────────────────────────────────────────────────────────
    const fishes    = Inventory.getAll();
    const fishList  = $('inv-fish-list');
    const fishEmpty = $('inv-fish-empty');
    fishList.innerHTML = '';

    if (fishes.length === 0) {
      fishEmpty.classList.remove('hidden');
    } else {
      fishEmpty.classList.add('hidden');
      fishes.forEach(fish => {
        const prot = Inventory.isProtected(fish.id);
        const li = document.createElement('li');
        li.className = 'inv-item';
        li.setAttribute('role', 'listitem');
        li.innerHTML = `
          <div class="inv-item-info">
            <span class="inv-item-name">${t(fish.nameKey) || fish.nameKey}
              ${prot ? `<span class="inv-badge-protect" aria-label="${t('inv_protected_badge')}">${t('inv_protected_badge')}</span>` : ''}
            </span>
            <span class="inv-item-detail">${fish.weight.toFixed(2)} kg · ${fish.value} 🪙</span>
          </div>
          <div class="inv-item-actions">
            <button class="btn-inv-examine-fish btn-secondary"
                    data-item-id="${fish.id}"
                    aria-label="${t('inv_examine')} ${t(fish.nameKey) || fish.nameKey}">
              ${t('inv_examine')}
            </button>
            <button class="btn-inv-protect btn-secondary"
                    data-item-id="${fish.id}"
                    aria-pressed="${prot}">
              ${prot ? t('inv_unprotect') : t('inv_protect')}
            </button>
            <button class="btn-inv-discard btn-danger"
                    data-item-id="${fish.id}"
                    data-item-name="${t(fish.nameKey) || fish.nameKey}"
                    aria-label="${t('inv_discard')} ${t(fish.nameKey) || fish.nameKey}">
              ${t('inv_discard')}
            </button>
          </div>`;
        li.querySelector('.btn-inv-examine-fish').addEventListener('click', e => {
          const id   = e.currentTarget.dataset.itemId;
          const fish = Inventory.getAll().find(f => f.id === id);
          if (!fish) return;
          const def  = FISH_CATALOG[fish.fishId];
          const rarityMap = {
            lambari:'common', tilapia:'common', cara:'common', piau:'common',
            traira:'uncommon', curimbata:'uncommon', truta:'uncommon',
            dourado:'rare', tucunare:'rare',
            pirarucu:'legendary', peixe_dourado_ornamental:'legendary'
          };
          const rarity = t('inv_rarity_' + (rarityMap[fish.fishId] || 'common'));
          const habitat = t('inv_habitat_' + (def?.habitat || 'freshwater'));
          _invFeedback(fbEl, t('inv_examine_fish', t(fish.nameKey) || fish.fishId, rarity, habitat), true);
        });
        li.querySelector('.btn-inv-protect').addEventListener('click', e => {
          const id = e.currentTarget.dataset.itemId;
          Inventory.toggleProtect(id);
          renderInventory();
        });
        li.querySelector('.btn-inv-discard').addEventListener('click', e => {
          const id   = e.currentTarget.dataset.itemId;
          const name = e.currentTarget.dataset.itemName;
          if (confirm(t('inv_confirm_discard') ? (typeof t('inv_confirm_discard') === 'function'
            ? t('inv_confirm_discard', name) : t('inv_confirm_discard')) : `Descartar ${name}?`)) {
            Inventory.removeItem(id);
            renderInventory();
          }
        });
        fishList.appendChild(li);
      });
    }

    // ── Aba Iscas ───────────────────────────────────────────────────────────
    const baits     = Inventory.getBaits();
    const baitList  = $('inv-baits-list');
    const baitEmpty = $('inv-baits-empty');
    baitList.innerHTML = '';
    const baitEntries = Object.entries(baits).filter(([,qty]) => qty > 0);

    if (baitEntries.length === 0) {
      baitEmpty.classList.remove('hidden');
    } else {
      baitEmpty.classList.add('hidden');
      baitEntries.forEach(([baitId, qty]) => {
        const def       = BAIT_CATALOG[baitId] || { emoji: '?', nameKey: baitId };
        const isEquipped = equip.bait === baitId;
        const li = document.createElement('li');
        li.className = 'inv-item inv-bait-item';
        li.innerHTML = `
          <span class="inv-item-icon" aria-hidden="true">${def.emoji}</span>
          <div class="inv-item-info">
            <span class="inv-item-name">${t(def.nameKey) || def.nameKey}
              ${isEquipped ? `<span class="inv-badge-equip">${t('inv_equipped_badge')}</span>` : ''}
            </span>
            <span class="inv-item-detail">${t('shop_stock_label', qty)}</span>
          </div>
          <div class="inv-item-actions">
            <button class="btn-equip-bait ${isEquipped ? 'btn-equipped' : 'btn-secondary'}"
                    data-bait-id="${baitId}"
                    aria-pressed="${isEquipped}"
                    ${isEquipped ? 'disabled' : ''}>
              ${isEquipped ? t('shop_equipped') : t('shop_equip')}
            </button>
          </div>`;
        li.querySelector('.btn-inv-examine-bait').addEventListener('click', e => {
          const bid  = e.currentTarget.dataset.baitId;
          const name = t(BAIT_CATALOG[bid]?.nameKey || bid);
          const desc = t('shop_desc_' + bid) || '';
          _invFeedback(fbEl, t('inv_examine_bait', name, desc), true);
        });
        if (!isEquipped) {
          li.querySelector('.btn-equip-bait').addEventListener('click', e => {
            Inventory.equipBait(e.currentTarget.dataset.baitId);
            renderInventory();
          });
        }
        baitList.appendChild(li);
      });
    }

    // ── Aba Equipamentos ────────────────────────────────────────────────────
    const owned      = Inventory.getOwnedEquip();
    const equipList  = $('inv-equip-list');
    const equipEmpty = $('inv-equip-empty');
    equipList.innerHTML = '';

    const defaults = ['rod_basic','line_mono','hook_basic','float_basic'];
    const allOwned = [...new Set([...defaults, ...owned])];

    // Agrupar por slot para exibir o item equipado por slot
    const SLOT_MAP = { rod:'rod', line:'line', hook:'hook', float:'float' };

    if (allOwned.length === 0) {
      equipEmpty.classList.remove('hidden');
    } else {
      equipEmpty.classList.add('hidden');
      allOwned.forEach(itemId => {
        const shopItem = (typeof SHOP_CATALOG !== 'undefined')
          ? SHOP_CATALOG.find(i => i.id === itemId) : null;
        if (!shopItem) return;
        const slot       = shopItem.type; // 'rod' | 'line' | 'hook' | 'float'
        const isEquipped = equip[slot] === itemId;
        const li = document.createElement('li');
        li.className = 'inv-item inv-equip-item';
        li.innerHTML = `
          <span class="inv-item-icon" aria-hidden="true">${shopItem.emoji}</span>
          <div class="inv-item-info">
            <span class="inv-item-name">${t(shopItem.nameKey) || shopItem.id}
              ${isEquipped ? `<span class="inv-badge-equip">${t('inv_equipped_badge')}</span>` : ''}
            </span>
            <span class="inv-item-detail">${t(shopItem.descKey) || ''}</span>
            ${shopItem.tier ? `<span class="shop-tier-badge">${t('shop_tier', shopItem.tier)}</span>` : ''}
          </div>
          <div class="inv-item-actions">
            <button class="btn-inv-protect btn-secondary"
                    data-item-id="${itemId}"
                    aria-pressed="${Inventory.isProtected(itemId)}">
              ${Inventory.isProtected(itemId) ? t('inv_unprotect') : t('inv_protect')}
            </button>
            <button class="btn-inv-examine btn-secondary"
                    data-item-id="${itemId}"
                    aria-label="${t('inv_examine')} ${t(shopItem.nameKey) || itemId}">
              ${t('inv_examine')}
            </button>
            ${isEquipped
              ? `<button class="btn-inv-unequip btn-danger"
                         data-item-id="${itemId}" data-slot="${slot}"
                         aria-label="${t('inv_unequip_btn')} ${t(shopItem.nameKey) || itemId}">
                   ${t('inv_unequip_btn')}
                 </button>`
              : `<button class="btn-inv-equip btn-secondary"
                         data-item-id="${itemId}" data-slot="${slot}"
                         aria-label="${t('inv_equip_btn')} ${t(shopItem.nameKey) || itemId}">
                   ${t('inv_equip_btn')}
                 </button>`
            }
          </div>`;

        li.querySelector('.btn-inv-protect')?.addEventListener('click', e => {
          const id = e.currentTarget.dataset.itemId;
          Inventory.toggleProtect(id);
          renderInventory();
        });
        li.querySelector('.btn-inv-examine')?.addEventListener('click', e => {
          const id   = e.currentTarget.dataset.itemId;
          const item = SHOP_CATALOG.find(i => i.id === id);
          if (!item) return;
          const mods = Object.entries(item.modifiers || {})
            .map(([k,v]) => `${k}: ${v}`).join(' | ');
          _invFeedback(fbEl, `${t(item.nameKey) || id} — Tier ${item.tier || '—'} | ${mods || '—'}`, true);
        });

        li.querySelector('.btn-inv-equip')?.addEventListener('click', e => {
          const id   = e.currentTarget.dataset.itemId;
          const slot = e.currentTarget.dataset.slot;
          _equipItem(id, slot);
          Inventory.addEquip(id);
          renderInventory();
        });

        li.querySelector('.btn-inv-unequip')?.addEventListener('click', e => {
          const slot = e.currentTarget.dataset.slot;
          Inventory.unequipSlot(slot);
          _recalcGearMods();
          renderInventory();
        });

        equipList.appendChild(li);
      });
    }
  }

  function _invFeedback(el, msg, ok = true) {
    el.textContent = msg;
    el.classList.remove('hidden', 'feedback-ok', 'feedback-err');
    el.classList.add(ok ? 'feedback-ok' : 'feedback-err');
    clearTimeout(el._feedbackTimer);
    el._feedbackTimer = setTimeout(() => el.classList.add('hidden'), 3000);
  }


  /* ── LOJA ────────────────────────────────────────────────────────────── */
  function renderShop() {
    $('shop-coins').textContent = Inventory.coins();
    $('shop-feedback').classList.add('hidden');
    _renderShopBuy();
    _renderShopSell();
  }

  // ── Painel COMPRAR ────────────────────────────────────────────────────────
  function _renderShopBuy() {
    const typeToTab  = { bait:'baits', rod:'rods', line:'lines', hook:'hooks', float:'floats' };
    const equip      = Inventory.getEquip();
    const ownedEquip = Inventory.getOwnedEquip();
    const defaults   = ['rod_basic','line_mono','hook_basic','float_basic'];

    Object.values(typeToTab).forEach(tab => {
      const el = $('buy-tab-' + tab);
      if (el) el.innerHTML = '';
    });

    SHOP_CATALOG.forEach(item => {
      const tab = typeToTab[item.type];
      if (!tab) return;
      const container = $('buy-tab-' + tab);
      if (!container) return;

      const isBait    = item.type === 'bait';
      const equipped  = !isBait && Object.values(equip).includes(item.id);
      const owned     = !isBait && (ownedEquip.includes(item.id) || defaults.includes(item.id));
      const unitPrice = isBait ? Math.round(item.price / (item.qty || 1)) : item.price;
      const canAfford = Inventory.coins() >= item.price;

      const card = document.createElement('div');
      card.className = 'shop-card';
      card.setAttribute('role', 'article');

      const tierBadge = item.tier
        ? '<span class="shop-tier-badge">' + t('shop_tier', item.tier) + '</span>' : '';

      let actionArea = '';
      if (!isBait && equipped) {
        actionArea =
          '<div class="shop-card-buy-row">' +
          '<button class="btn-equipped" disabled>' + t('shop_equipped') + '</button>' +
          '</div>';
      } else if (!isBait && owned) {
        actionArea =
          '<div class="shop-card-buy-row">' +
          '<button class="btn-shop-equip btn-secondary"' +
          ' data-item-id="' + item.id + '" data-item-type="' + item.type + '">' +
          t('shop_equip') + '</button>' +
          '</div>';
      } else {
        const unitLabel = isBait
          ? t('shop_buy_unit_price', unitPrice)
          : t('shop_price', item.price);
        const qtyBlock = isBait
          ? '<label class="shop-qty-label"><span>' + t('shop_buy_qty_label') + '</span>' +
            '<input class="shop-qty-input" type="number" min="1" max="99" value="1"' +
            ' data-item-id="' + item.id + '"' +
            ' aria-label="Quantidade de ' + (t(item.nameKey) || item.id) + '">' +
            '</label><div class="shop-total-preview">' + t('shop_buy_total_price', 1, unitPrice, unitPrice) + '</div>'
          : '';
        actionArea =
          '<div class="shop-card-buy-row">' +
          '<span class="shop-unit-price">' + unitLabel + '</span>' +
          qtyBlock +
          '<button class="btn-shop-buy btn-primary"' +
          ' data-item-id="' + item.id + '" data-item-type="' + item.type + '"' +
          ' data-unit-price="' + unitPrice + '" data-pack-qty="' + (item.qty || 1) + '"' +
          (canAfford ? '' : ' disabled') + '>' +
          t('shop_buy') + (!isBait ? ' · ' + t('shop_price', item.price) : '') +
          '</button></div>';
      }

      card.innerHTML =
        '<div class="shop-card-header">' +
        '<span class="shop-item-emoji" aria-hidden="true">' + item.emoji + '</span>' +
        '<div class="shop-item-meta">' +
        '<span class="shop-item-name">' + (t(item.nameKey) || item.id) + ' ' + tierBadge + '</span>' +
        '<span class="shop-item-desc">' + (t(item.descKey) || '') + '</span>' +
        '</div></div>' + actionArea;

      const qtyInput = card.querySelector('.shop-qty-input');
      if (qtyInput) {
        qtyInput.addEventListener('input', function() {
          const qty   = Math.max(1, parseInt(this.value) || 1);
          const total = qty * unitPrice;
          const prev  = card.querySelector('.shop-total-preview');
          if (prev) prev.textContent = t('shop_buy_total_price', qty, unitPrice, total);
          const btn = card.querySelector('.btn-shop-buy');
          if (btn) btn.disabled = Inventory.coins() < total;
        });
      }

      const buyBtn = card.querySelector('.btn-shop-buy');
      if (buyBtn) {
        buyBtn.addEventListener('click', function() {
          const input   = card.querySelector('.shop-qty-input');
          const userQty = input ? (parseInt(input.value) || 1) : 1;
          _handleShopBuy(item.id, item.type, userQty, item.qty || 1, unitPrice, $('shop-feedback'));
        });
      }

      const equipBtn = card.querySelector('.btn-shop-equip');
      if (equipBtn) {
        equipBtn.addEventListener('click', function() {
          _equipItem(this.dataset.itemId, this.dataset.itemType);
          renderShop();
        });
      }

      container.appendChild(card);
    });
  }

  // ── Painel VENDER ─────────────────────────────────────────────────────────
  function _renderShopSell() {
    const fbEl   = $('shop-feedback');
    const equip  = Inventory.getEquip();
    const owned  = Inventory.getOwnedEquip();
    const defaults = ['rod_basic','line_mono','hook_basic','float_basic'];

    // ── Peixes (excluir protegidos) ─────────────────────────────────────────
    const fishes    = Inventory.getAll().filter(function(f) { return !Inventory.isProtected(f.id); });
    const fishList  = $('sell-fish-list');
    const fishEmpty = $('sell-fish-empty');
    fishList.innerHTML = '';

    if (fishes.length === 0) {
      fishEmpty.classList.remove('hidden');
    } else {
      fishEmpty.classList.add('hidden');

      const sellAllBtn = document.createElement('button');
      sellAllBtn.className = 'btn-primary shop-sell-all-btn';
      sellAllBtn.textContent = t('shop_sell_all_fish');
      sellAllBtn.addEventListener('click', function() {
        const res = Inventory.sellAll();
        if (res.ok) {
          $('shop-coins').textContent = Inventory.coins();
          _shopFeedback(fbEl, t('shop_sold', t('inv_tab_fish'), res.count, res.earned), true);
          _renderShopSell();
        }
      });
      fishList.appendChild(sellAllBtn);

      // Agrupar por espécie (fishId) para input de quantidade
      const bySpecies = {};
      fishes.forEach(function(fish) {
        if (!bySpecies[fish.fishId]) {
          bySpecies[fish.fishId] = { nameKey: fish.nameKey, items: [] };
        }
        bySpecies[fish.fishId].items.push(fish);
      });

      Object.values(bySpecies).forEach(function(group) {
        const fishName  = t(group.nameKey) || group.nameKey;
        const count     = group.items.length;
        const avgValue  = Math.round(group.items.reduce(function(s,i){ return s + i.value; }, 0) / count);
        const li = document.createElement('li');
        li.className = 'inv-item';
        li.innerHTML =
          '<div class="inv-item-info">' +
          '<span class="inv-item-name">' + fishName + '</span>' +
          '<span class="inv-item-detail">' +
            t('shop_sell_in_stock', count) + ' · ' + t('shop_sell_unit', avgValue) +
          '</span>' +
          '</div>' +
          '<div class="inv-item-actions sell-row">' +
          '<label class="shop-qty-label"><span>' + t('shop_sell_qty_label') + '</span>' +
          '<input class="shop-qty-input" type="number" min="1" max="' + count + '" value="1"' +
          ' aria-label="Qtd de ' + fishName + ' para vender"></label>' +
          '<div class="shop-total-preview">' + t('shop_sell_total_fish', 1, avgValue, avgValue) + '</div>' +
          '<button class="btn-sell-fish-qty btn-secondary">' + t('shop_sell_confirm') + '</button>' +
          '</div>';

        const input   = li.querySelector('.shop-qty-input');
        const preview = li.querySelector('.shop-total-preview');
        const sellBtn = li.querySelector('.btn-sell-fish-qty');

        // Valor real: soma dos N peixes que serão vendidos (pelo valor individual)
        function calcTotal(n) {
          return group.items.slice(0, n).reduce(function(s,i){ return s + i.value; }, 0);
        }

        input.addEventListener('input', function() {
          const n     = Math.min(Math.max(1, parseInt(this.value) || 1), count);
          const total = calcTotal(n);
          preview.textContent = t('shop_sell_total_fish', n, avgValue, total);
        });

        sellBtn.addEventListener('click', function() {
          const n     = Math.min(Math.max(1, parseInt(input.value) || 1), count);
          const res   = Inventory.sellFishQty(group.items[0].fishId, n);
          if (res.ok) {
            $('shop-coins').textContent = Inventory.coins();
            _shopFeedback(fbEl, t('shop_sold', fishName, res.sold, res.earned), true);
            _renderShopSell();
          }
        });

        fishList.appendChild(li);
      });
    }

    // ── Iscas ────────────────────────────────────────────────────────────────
    const baits      = Inventory.getBaits();
    const baitList   = $('sell-baits-list');
    const baitEmpty  = $('sell-baits-empty');
    baitList.innerHTML = '';
    const baitEntries = Object.entries(baits).filter(function(e) { return e[1] > 0; });

    if (baitEntries.length === 0) {
      baitEmpty.classList.remove('hidden');
    } else {
      baitEmpty.classList.add('hidden');
      baitEntries.forEach(function(entry) {
        const baitId   = entry[0];
        const qty      = entry[1];
        const def      = BAIT_CATALOG[baitId] || { emoji: '?', nameKey: baitId };
        const shopItem = SHOP_CATALOG.find(function(i) { return i.type === 'bait' && i.id === baitId; });
        const unitSell = shopItem
          ? Math.max(1, Math.floor((shopItem.price / (shopItem.qty || 1)) * 0.5)) : 1;
        const baitName = t(def.nameKey) || baitId;

        const li = document.createElement('li');
        li.className = 'inv-item';
        li.innerHTML =
          '<span class="inv-item-icon" aria-hidden="true">' + def.emoji + '</span>' +
          '<div class="inv-item-info">' +
          '<span class="inv-item-name">' + baitName + '</span>' +
          '<span class="inv-item-detail">' + t('shop_sell_in_stock', qty) + ' · ' + t('shop_sell_unit', unitSell) + '</span>' +
          '</div>' +
          '<div class="inv-item-actions sell-row">' +
          '<label class="shop-qty-label"><span>' + t('shop_sell_qty_label') + '</span>' +
          '<input class="shop-qty-input" type="number" min="1" max="' + qty + '" value="1"' +
          ' aria-label="Qtd de ' + baitName + ' para vender"></label>' +
          '<div class="shop-total-preview">' + t('shop_sell_total_fish', 1, unitSell, unitSell) + '</div>' +
          '<button class="btn-sell-bait btn-secondary"' +
          ' data-bait-id="' + baitId + '" data-unit-sell="' + unitSell + '" data-max="' + qty + '">' +
          t('shop_sell_confirm') + '</button>' +
          '</div>';

        const input   = li.querySelector('.shop-qty-input');
        const preview = li.querySelector('.shop-total-preview');
        const sellBtn = li.querySelector('.btn-sell-bait');
        input.addEventListener('input', function() {
          const n     = Math.min(Math.max(1, parseInt(this.value) || 1), qty);
          const total = n * unitSell;
          preview.textContent = t('shop_sell_total_fish', n, unitSell, total);
        });
        sellBtn.addEventListener('click', function() {
          const n   = Math.min(parseInt(input.value) || 1, qty);
          const res = Inventory.sellBaits(baitId, n);
          if (res.ok) {
            $('shop-coins').textContent = Inventory.coins();
            _shopFeedback(fbEl, t('shop_sold', baitName, res.sold, res.earned), true);
            _renderShopSell();
          }
        });
        baitList.appendChild(li);
      });
    }

    // ── Equipamentos (excluir equipados e defaults) ──────────────────────────
    const equipList  = $('sell-equip-list');
    const equipEmpty = $('sell-equip-empty');
    equipList.innerHTML = '';
    const sellable = owned.filter(function(id) {
      return !defaults.includes(id) && !Object.values(equip).includes(id) && !Inventory.isProtected(id);
    });

    if (sellable.length === 0) {
      equipEmpty.classList.remove('hidden');
    } else {
      equipEmpty.classList.add('hidden');
      sellable.forEach(function(itemId) {
        const shopItem  = SHOP_CATALOG.find(function(i) { return i.id === itemId; });
        if (!shopItem) return;
        const sellPrice = Math.max(1, Math.floor(shopItem.price * 0.5));
        const equipName = t(shopItem.nameKey) || itemId;
        const li = document.createElement('li');
        li.className = 'inv-item';
        li.innerHTML =
          '<span class="inv-item-icon" aria-hidden="true">' + shopItem.emoji + '</span>' +
          '<div class="inv-item-info">' +
          '<span class="inv-item-name">' + equipName + '</span>' +
          '<span class="inv-item-detail">' + t('shop_sell_unit', sellPrice) + '</span>' +
          '</div>' +
          '<div class="inv-item-actions">' +
          '<button class="btn-sell-equip btn-secondary"' +
          ' data-item-id="' + itemId + '" data-sell-price="' + sellPrice + '">' +
          t('shop_sell_confirm') + ' · ' + sellPrice + ' \uD83E\uDE99</button>' +
          '</div>';
        li.querySelector('.btn-sell-equip').addEventListener('click', function() {
          const id  = this.dataset.itemId;
          const val = parseInt(this.dataset.sellPrice);
          const res = Inventory.sellEquip(id);
          if (res.ok) {
            $('shop-coins').textContent = Inventory.coins();
            _shopFeedback(fbEl, t('shop_sold', equipName, 1, res.earned), true);
            _renderShopSell();
          }
        });
        equipList.appendChild(li);
      });
    }
  }


  function _handleShopBuy(itemId, itemType, userQty, packQty, unitPrice, fbEl) {
    userQty  = Math.max(1, parseInt(userQty) || 1);
    packQty  = packQty || 1;

    const item = getShopItem(itemId);
    if (!item) return;

    const isBait = itemType === 'bait';
    // Para iscas: custo = userQty * unitPrice (por unidade individual)
    // Para equipamentos: custo = item.price (sempre 1 unidade)
    const totalCost = isBait ? userQty * unitPrice : item.price;

    if (!Inventory.spendCoins(totalCost)) {
      _shopFeedback(fbEl, t('shop_no_coins'), false);
      $('shop-coins').textContent = Inventory.coins();
      return;
    }

    if (isBait) {
      const baitId = itemId.replace('bait_', '');
      // userQty unidades individuais = floor(userQty / packQty) pacotes completos + resto
      Inventory.addBaits(baitId, userQty);
    } else {
      _equipItem(itemId, itemType);
      Inventory.addEquip(itemId);
    }

    $('shop-coins').textContent = Inventory.coins();
    const itemName = t(item.nameKey) || item.nameKey;
    const msg = isBait
      ? t('shop_sold', itemName, userQty, -totalCost).replace('+(-', '-(')  // reuse sold key or use bought
      : null;
    _shopFeedback(fbEl, t('shop_bought', itemName + (isBait ? ' ×' + userQty : '')), true);
    renderShop();
  }

  function _equipItem(itemId, itemType) {
    const equip = Inventory.getEquip();
    equip[itemType] = itemId;
    localStorage.setItem('bb_equip', JSON.stringify(equip));
    _recalcGearMods();
  }

  /** Reconstrói bb_gear_mods a partir dos slots atualmente equipados. */
  function _recalcGearMods() {
    const equip = Inventory.getEquip();
    const mods  = {};
    Object.values(equip).forEach(itemId => {
      if (!itemId) return;
      const shopItem = getShopItem(itemId);
      if (shopItem) Object.assign(mods, shopItem.modifiers || {});
    });
    localStorage.setItem('bb_gear_mods', JSON.stringify(mods));
  }


  // ── UI helpers ────────────────────────────────────────────────────────────
  function showScreen(name) {
    console.log('[BB] showScreen:', name);
    // Desativa e bloqueia TODAS as telas conhecidas
    Object.entries(screens).forEach(([, s]) => {
      if (!s) return;
      s.classList.remove('active');
      s.setAttribute('inert', '');
    });

    // Barra inferior só fica visível dentro da tela de jogo (modo normal)
    // Fora do jogo, garante que não intercepta cliques em nenhuma outra tela
    if (name !== 'game') {
      const bar = $('game-bottom-bar');
      if (bar) bar.classList.add('hidden');
    }

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

  function setLabel(text)  { if (ui.stateLabel) ui.stateLabel.textContent = text; }

  /** Vibra apenas se háptica estiver ativada nas preferências */
  function _vibrate(pattern) { if (A11y.get('haptic')) Audio.vibrate(pattern); }

  /** Toca som apenas se som estiver ativado nas preferências */
  function _play(id) { if (A11y.get('sound')) Audio.play(id); }

  function speak(text) {
    if (!ui.announcer) return;
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
    clearTimeout(recoveryTimer);
    clearInterval(tensionLoop);
    Audio.stopReel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  return {
    state:       () => state,
    startNormal: () => startGame('normal'),
  };
})();
