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
  const { speak, sayKey, sayCatchKey } = A11yAnnouncer;

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
    const holdButton = $('btn-bar-hold');
    if (holdButton) holdButton.setAttribute('aria-label', I18n.t('bar_hold'));
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
  let _lastCatchInfo   = null;   // dados persistidos da última captura
  let tension          = 0;      // 0..100
  let fishPull         = 0;
  let _fishStrengthMult = 1.0;  // multiplicador gradual de força (1.0 = 100%, 0.3 = cansado)
  let fishTired        = false;
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
  let _fishPullImpulse = 0;      // reação visual acumulada aos puxões do jogador
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
    if (_qp.has('testhour') && typeof GameTime !== 'undefined') {
      // QA: ?testhour=22 força o horário sem alterar o fluxo normal do jogo.
      const t = GameTime.load();
      const hour = Number.parseInt(_qp.get('testhour'), 10);
      const minute = Number.parseInt(_qp.get('testminute') || '0', 10);
      if (Number.isFinite(hour)) {
        t.hour = Math.max(0, Math.min(23, hour));
        t.minute = minute >= 30 ? 30 : 0;
        GameTime.save(t);
      }
    }
    // ─────────────────────────────────────────────────────────────────────

        screens = {
      lang:         $('screen-lang'),
      start:        $('screen-start'),
      characterCreate: $('screen-character-create'),
      characterVisual: $('screen-character-visual'),
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
      characterForm:  $('character-form'),
      characterName:  $('character-name'),
      characterGender: $('character-gender'),
      characterFormError: $('character-form-error'),
      characterFormStatus: $('character-form-status'),
      characterVisualFields: $('character-visual-fields'),
      characterVisualSummary: $('character-visual-summary'),
      characterAvatarPreview: $('character-avatar-preview'),
      characterAvatar: $('character-avatar'),
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
      boatVisual:     $('boat-visual'),
      boatVisualIcon: $('boat-visual-icon'),
      boatContext:    $('boat-context'),
      baitEmoji:      $('bait-active-emoji'),
      baitName:       $('bait-active-name'),
      baitQty:        $('bait-active-qty'),
      holdCount:      $('hold-active-count'),
      equipPanel:     $('equip-panel'),
      baitList:       $('bait-list'),
      lastCatchSummary: $('last-catch-summary'),
      lastCatchReadout: $('last-catch-readout'),
      lastCatchFish:  $('last-catch-fish'),
      lastCatchSize:  $('last-catch-size'),
      lastCatchWeight: $('last-catch-weight'),
      lastCatchValue: $('last-catch-value'),
      lastCatchLocation: $('last-catch-location'),
      lastCatchScore: $('last-catch-score'),
    };

    ui.best.textContent = best;

    // Constrói a linha SVG dinâmica
    _buildLineSvg();

    // Mapa inicial
    activeMap = getActiveMap();
    ui.scene.classList.add(activeMap.sceneClass);
    // Revela as zonas iniciais do mapa; zonas condicionadas permanecem ocultas.
    const initialZones = activeMap.initialZones ||
      (activeMap.zones && activeMap.zones.find(z => !z.hidden)
        ? [activeMap.zones.find(z => !z.hidden).id] : []);
    initialZones.forEach(zoneId => Inventory.knowZone(activeMap.id, zoneId));
    activeZone = Inventory.getActiveZone(activeMap.id) ||
      (activeMap.zones && activeMap.zones.find(z => !z.hidden)?.id) || null;

    // Preferências de acessibilidade — carrega antes de tudo
    A11y.init();

    // Idioma salvo
    if (I18n.getLang()) {
      applyI18n();   // atualiza aria-labels dos toggles com idioma correto
      showScreen('start');
    }
    _lastCatchInfo = LastCatchStorage.load();
    _refreshLastCatchSummary();

    $('btn-lang-pt').addEventListener('click', () => selectLang('pt'));
    $('btn-lang-en').addEventListener('click', () => selectLang('en'));
    $('btn-lang-hu').addEventListener('click', () => selectLang('hu'));

    // ── Menu Principal ─────────────────────────────────────────────────────
    $('btn-story').addEventListener('click', () => {
      gameMode = 'normal';
      const profile = Character.load().genderProfile;
      const visualCategories = getCharacterVisualCategories(profile);
      if (!Character.isConfirmed()) openCharacterCreate();
      else if (!Character.isComplete(visualCategories.map(category => category.key), profile)) openCharacterVisual();
      else showStoryHub();
    });
    // Navegação essencial vem antes dos controles opcionais de personagem, para
    // que uma ausência isolada não impeça o registro do restante do menu.
    $('btn-free')?.addEventListener('click',  () => startGame('free'));
    $('btn-instructions')?.addEventListener('click', () => showScreen('instructions'));
    $('btn-back')?.addEventListener('click',  () => showScreen('start'));
    $('btn-options')?.addEventListener('click', () => { _syncToggles(); showScreen('options'); });
    $('btn-options-back')?.addEventListener('click', () => showScreen('start'));
    $('btn-hub-shop')?.addEventListener('click',   () => { renderShop(); showScreen('shop');  _startCityScreenMusic('shop'); });
    $('btn-hub-inv')?.addEventListener('click',    () => { renderInventory(); showScreen('inventory'); _startCityScreenMusic('city'); });
    $('btn-hub-travel')?.addEventListener('click', () => { renderTravel(); showScreen('travel'); _startCityScreenMusic('travel'); });
    $('btn-hub-vessel')?.addEventListener('click', () => { renderVessel(); showScreen('vessel'); _startCityScreenMusic('vessel'); });
    $('btn-hub-home')?.addEventListener('click',   () => { renderHouse();  showScreen('house');  _startCityScreenMusic('house');  });
    $('btn-house-back')?.addEventListener('click', () => showStoryHub());
    $('btn-hub-back')?.addEventListener('click',   () => showScreen('start'));
    $('btn-travel-back')?.addEventListener('click',() => showStoryHub());
    $('btn-vessel-back')?.addEventListener('click',() => showStoryHub());
    $('btn-shop-back')?.addEventListener('click', () => showStoryHub());

    // Controles essenciais da pesca são registrados junto da navegação, antes
    // de qualquer painel opcional.
    $('btn-menu')?.addEventListener('click', () => goToMenu());
    $('btn-menu2')?.addEventListener('click', () => goToMenu());
    if (typeof Sensors !== 'undefined' && typeof Sensors.on === 'function') {
      Sensors.on('onTilt', handleTilt);
      Sensors.on('onShake', handleShake);
    }
    // A barra inferior é essencial no modo História: equipamento, carga,
    // isca e retorno ao hub precisam continuar disponíveis durante a pesca.
    $('btn-bar-equip')?.addEventListener('click', () => openEquipPanel());
    $('btn-bar-hold')?.addEventListener('click', () => openHoldPanel());
    $('btn-hold-close')?.addEventListener('click', () => closeHoldPanel());
    $('btn-bar-zone')?.addEventListener('click', () => openZoneModal());
    $('btn-zone-modal-back')?.addEventListener('click', () => closeZoneModal());
    $('btn-bar-hub')?.addEventListener('click', () => {
      if (typeof Sensors !== 'undefined' && typeof Sensors.stop === 'function') Sensors.stop();
      goToMenu();
    });
    $('btn-equip-close')?.addEventListener('click', () => closeEquipPanel());
    // Delegação de emergência para os menus internos: garante que os tabs
    // continuem operacionais mesmo quando a tela é re-renderizada.
    document.addEventListener('click', _handleInternalMenuClick, true);

    ui.characterForm?.addEventListener('submit', _handleCharacterSubmit);
    $('btn-character-back')?.addEventListener('click', () => showScreen('start'));
    $('btn-character-visual-back')?.addEventListener('click', openCharacterCreate);
    $('btn-character-visual-confirm')?.addEventListener('click', _confirmCharacterVisual);

    // Os menus podem ser renderizados novamente ao entrar neles; os binds
    // idempotentes são chamados também por renderShop/renderInventory.
    _bindShopNavigation();
    _bindInventoryNavigation();

    // ── Inventário (acesso via hub) ────────────────────────────────────────
    $('btn-inv-back')?.addEventListener('click', () => showStoryHub());
    $('btn-opt-lang-pt')?.addEventListener('click', () => selectLang('pt'));
    $('btn-opt-lang-en')?.addEventListener('click', () => selectLang('en'));
    $('btn-opt-lang-hu')?.addEventListener('click', () => selectLang('hu'));
    // F leva o foco aos dados da última captura sem interferir nas setas ou no Espaço.
    document.addEventListener('keydown', _handleLastCatchKey, true);
    $('btn-continue')?.addEventListener('click', () => {
      startGame(gameMode);
    });

    // Navegação interna do painel
    $('btn-cat-baits')?.addEventListener('click', () => {
      _renderBaitList();
      _showEquipView('baits');
      const firstBtn = ui.baitList.querySelector('button:not([disabled])') ||
                       ui.baitList.querySelector('button') ||
                       $('btn-equip-back');
      firstBtn?.focus();
    });
    $('btn-equip-back')?.addEventListener('click', () => {
      _showEquipView('categories');
      $('btn-cat-baits')?.focus();
    });

    // Listeners dos toggles de acessibilidade
    document.querySelectorAll('.toggle-btn[data-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pref = btn.dataset.pref;
        A11y.toggle(pref);
        _updateToggleBtn(btn, A11y.get(pref));
      });
    });

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

  // ── Criação visual da personagem ─────────────────────────────────────────
  function _visualCategories() {
    return getCharacterVisualCategories(Character.load().genderProfile);
  }

  function _readVisualAppearance() {
    return CharacterVisualView.readAppearance({
      categories: _visualCategories(),
      getElement: id => $(id),
    });
  }

  function _renderCharacterAvatar(target, appearanceOverride) {
    CharacterVisualView.renderAvatar({
      target,
      character: Character.load(),
      appearanceOverride,
    });
  }

  function _updateVisualSummary() {
    CharacterVisualView.updateSummary({
      summary: ui.characterVisualSummary,
      categories: _visualCategories(),
      appearance: _readVisualAppearance(),
      lang: I18n.getLang() || 'pt',
      translate: t,
    });
  }

  function openCharacterVisual() {
    if (!ui.characterVisualFields) return;
    const current = Character.load();
    CharacterVisualView.open({
      fields: ui.characterVisualFields,
      summary: ui.characterVisualSummary,
      preview: ui.characterAvatarPreview,
      character: current,
      categories: getCharacterVisualCategories(current.genderProfile),
      lang: I18n.getLang() || 'pt',
      translate: t,
      getElement: id => $(id),
    });
    showScreen('characterVisual');
    ui.characterVisualFields.querySelector('select')?.focus();
  }

  // ── Criação inicial da personagem ───────────────────────────────────────
  function openCharacterCreate() {
    const current = Character.load();
    if (ui.characterName) ui.characterName.value = current.name || '';
    if (ui.characterGender) ui.characterGender.value = current.genderProfile || '';
    if (ui.characterFormError) ui.characterFormError.textContent = '';
    if (ui.characterFormStatus) ui.characterFormStatus.textContent = '';
    showScreen('characterCreate');
    ui.characterName?.focus();
  }

  function _handleCharacterSubmit(event) {
    event.preventDefault();
    if (ui.characterFormError) ui.characterFormError.textContent = '';
    if (ui.characterFormStatus) ui.characterFormStatus.textContent = '';

    const name = ui.characterName?.value || '';
    const gender = ui.characterGender?.value || '';
    if (!String(name).trim()) {
      if (ui.characterFormError) ui.characterFormError.textContent = I18n.t('character_error_name');
      ui.characterName?.focus();
      return;
    }
    if (!gender) {
      if (ui.characterFormError) ui.characterFormError.textContent = I18n.t('character_error_gender');
      ui.characterGender?.focus();
      return;
    }

    const saved = Character.confirmIdentity(name, gender);
    if (!saved) return;
    if (ui.characterFormStatus) ui.characterFormStatus.textContent = I18n.t('character_saved');
    speak(I18n.t('character_saved'));

    openCharacterVisual();
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

          // Acompanha parcialmente a isca, mas continua resistindo ao jogador.
          _activeFishX = _activeFishX * 0.97 + _lureX * 0.03;
          _activeFishY = _activeFishY * 0.97 + _lureY * 0.03;

          // Cada puxão gera uma reação visual: o peixe se afasta da isca
          // e o impulso desaparece gradualmente, sem alterar a física da tensão.
          if (_fishPullImpulse > 0) {
            const awayX = Math.abs(_activeFishX - _lureX) > 0.5
              ? Math.sign(_activeFishX - _lureX) : fightDir;
            const awayY = Math.abs(_activeFishY - _lureY) > 0.5
              ? Math.sign(_activeFishY - _lureY) : 1;
            _activeFishX += awayX * _fishPullImpulse * 0.08;
            _activeFishY += awayY * _fishPullImpulse * 0.06;
            _fishPullImpulse = Math.max(0, _fishPullImpulse - 0.12);
          }

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

  function _ambientProfileKey() {
    if (!activeMap) return 'lago_margem';
    if (activeMap.id === 'lago_central' && activeZone === 'fundo') {
      return 'lago_central_fundo';
    }
    if (activeMap.id === 'lago_central' && activeZone === 'baia_isolada') {
      return 'lago_central_baia_isolada';
    }
    return activeMap.id;
  }

  // ── Inicia jogo ───────────────────────────────────────────────────────────
  async function startGame(mode = 'normal') {
    try {
      gameMode = mode;
      // Pesca Livre é independente da posição salva na História: usa sempre
      // a margem do Lago, sem barco e sem herdar a zona da última viagem.
      if (gameMode === 'free') {
        if (activeMap?.sceneClass) ui.scene.classList.remove(activeMap.sceneClass);
        activeMap = MAP_CATALOG.lago_margem;
        activeZone = 'margem';
        ui.scene.classList.add(activeMap.sceneClass);
      } else {
        // Ao voltar para a História, restaura o mapa/zona persistidos.
        if (activeMap?.sceneClass) ui.scene.classList.remove(activeMap.sceneClass);
        activeMap = getActiveMap();
        activeZone = Inventory.getActiveZone(activeMap.id)
          || activeMap.initialZones?.[0]
          || activeMap.zones?.find(z => !z.hidden)?.id
          || null;
        ui.scene.classList.add(activeMap.sceneClass);
      }
      // Cada modo mantém seu próprio histórico de última captura.
      _lastCatchInfo = LastCatchStorage.load(gameMode);

      // 1. Troca de tela PRIMEIRO — imediato, sem await
      showScreen('game');
      _renderCharacterAvatar(ui.characterAvatar, null);

      // 2. Sensores e áudio: fire-and-forget, nunca bloqueiam
      Sensors.requestPermission().then(ok => {
        if (!ok) Sensors.enableDesktopFallback();
      }).catch(() => Sensors.enableDesktopFallback());
      Audio.stopCityMusic();
      const soundEnabled = A11y.get('sound');
      Audio.init().then(() => {
        if (soundEnabled) Audio.startAmbient(_ambientProfileKey());
      }).catch(() => {});

      // 3. HUDs
      const gameScreen = $('screen-game');
      if (gameScreen) gameScreen.classList.toggle('free-mode', gameMode === 'free');
      const scoreHud = $('score-hud');
      if (scoreHud) scoreHud.classList.toggle('hidden', gameMode !== 'free');
      if (ui.normalHud) ui.normalHud.classList.toggle('hidden', gameMode !== 'normal');

      // "Pescar de novo" só no modo normal
      const btnContinue = $('btn-continue');
      if (btnContinue) btnContinue.classList.toggle('hidden', gameMode === 'free');

      // Indicadores de isca e capacidade da embarcação
      _renderFishingGearVisuals();
      if (gameMode === 'normal') {
        refreshBaitHud();
        refreshHoldHud();
      }

      // Texto do botão voltar — depende do modo
      const btnMenuEl = $('btn-menu');
      if (btnMenuEl) {
        const _bk = gameMode === 'free' ? 'btn_back_main' : 'btn_back_hub';
        btnMenuEl.setAttribute('data-i18n', _bk);
        btnMenuEl.textContent = I18n.t(_bk);
        // O botão deve nascer visível na Pesca Livre; o estado normal o oculta.
        btnMenuEl.classList.toggle('hidden', gameMode === 'normal');
      }

      score = 0;
      updateScore();
      fishEls = [];
      spawnBackgroundFish();
      _updateZoneHud();
      _renderBoatVisual();
      Sensors.start();
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
    _refreshLastCatchSummary();

    switch (state) {

      case 'IDLE':
        tension = 0;
        currentFish      = null;
        fishTired        = false;
        _fishPullImpulse = 0;
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
        // Modo normal: a capacidade impede iniciar uma pescaria que não poderá ser armazenada.
        if (gameMode === 'normal' && !Inventory.hasHoldSpace(_holdCapacityBoat())) {
          enterState('IDLE');
          _announceHoldFull();
          break;
        }
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
          if (!_hasRequiredRod(activeMap, _equip)) {
            speak(I18n.t('travel_need_rod'));
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
        currentFish      = pickFishFromMap(activeMap, activeZone);
        fishPull         = currentFish.pull;
        fishTired        = false;
        _fishPullImpulse = 0;
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
        if (gameMode !== 'free') refreshHoldHud();
        _lastCatchInfo = {
          fishId: currentFish.id,
          fishName: fishName(currentFish),
          size: currentFish.size,
          weight: caughtItem ? caughtItem.weight.toFixed(2) : null,
          value: caughtItem ? caughtItem.value : null,
          mapId: activeMap?.id || null,
          zoneId: activeZone || null,
          mode: gameMode,
          score,
        };
        LastCatchStorage.save(_lastCatchInfo);
        _refreshLastCatchSummary();

        setLabel(I18n.t('state_caught', fishName(currentFish)));
        {
          const sizeDesc = currentFish.size <= 1 ? I18n.t('size_tiny')
                         : currentFish.size <= 2 ? I18n.t('size_small')
                         : currentFish.size <= 3 ? I18n.t('size_medium')
                         :                         I18n.t('size_large');
          const kg    = caughtItem ? caughtItem.weight.toFixed(2) : null;
          const coins = caughtItem ? caughtItem.value : null;
          if (currentFish.special) {
            sayCatchKey(gameMode === 'free' ? 'caught_special' : 'caught_special_noscore',
                        fishName(currentFish), gameMode === 'free' ? score : kg, gameMode === 'free' ? undefined : coins);
          } else {
            sayCatchKey(gameMode === 'free' ? 'caught' : 'caught_noscore',
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
    _fishPullImpulse = Math.min(12, _fishPullImpulse + amount * 2.5);
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

  /** Atualiza os modelos visuais da vara e da isca na cena de pesca. */
  function _renderFishingGearVisuals() {
    FishingHudView.renderGearVisuals();
  }

  /** Atualiza o indicador de isca no HUD do modo normal */
  function refreshBaitHud() {
    FishingHudView.refreshBait({ mode: gameMode });
  }

  /**
   * Define qual carga vale para a pescaria atual.
   * Mapas de margem usam o cesto, mesmo que o jogador ainda tenha um barco
   * ativo de uma viagem anterior. Só mapas com barcos permitidos usam o porão.
   */
  function _holdCapacityBoat() {
    if (!activeMap || !Array.isArray(activeMap.allowedBoats) || activeMap.allowedBoats.length === 0) {
      return null;
    }
    return Inventory.getActiveBoat();
  }

  function _holdContainerName(boat = _holdCapacityBoat()) {
    if (boat) return I18n.t('boat_' + boat) || boat;
    const basketId = Inventory.getEquip().basket || 'basket_basic';
    const basket = (typeof SHOP_CATALOG !== 'undefined')
      ? SHOP_CATALOG.find(i => i.id === basketId && i.type === 'basket') : null;
    return basket ? I18n.t(basket.nameKey) : I18n.t('shop_name_basket_basic');
  }

  /** Atualiza o indicador acessível de carga do barco ou do cesto. */
  function refreshHoldHud() {
    FishingHudView.refreshHold({
      mode: gameMode,
      getCapacityBoat: _holdCapacityBoat,
      getContainerName: _holdContainerName,
    });
  }

  function _announceHoldFull() {
    refreshHoldHud();
    const full = I18n.t('hold_full') || 'Carga cheia!';
    const hintKey = _holdCapacityBoat() ? 'hold_full_hint' : 'hold_full_hint_basket';
    const hint = I18n.t(hintKey) || 'Venda peixes ou melhore o cesto.';
    speak(`${full} ${hint}`);
  }

  // ── Última captura ───────────────────────────────────────────────────────
  function _refreshLastCatchSummary() {
    const summary = ui.lastCatchSummary;
    if (!summary) return;
    const available = !!_lastCatchInfo && state === 'IDLE' &&
      screens.game && screens.game.classList.contains('active');
    if (available) _renderLastCatchSummary();
    summary.classList.toggle('hidden', !available);
    summary.setAttribute('aria-hidden', available ? 'false' : 'true');
  }

  function _renderLastCatchSummary() {
    LastCatchView.render(_lastCatchInfo);
  }

  function _lastCatchSummaryText() {
    return LastCatchView.summaryText();
  }

  function focusLastCatchSummary() {
    if (!_lastCatchInfo || state !== 'IDLE') return;
    _renderLastCatchSummary();
    const readout = ui.lastCatchReadout;
    if (!readout) {
      ui.lastCatchSummary?.focus();
      return;
    }
    // Troca o conteúdo para disparar o aria-live e focaliza o texto completo.
    readout.textContent = '';
    requestAnimationFrame(() => {
      readout.textContent = _lastCatchSummaryText();
      readout.focus();
    });
  }

  function _handleLastCatchKey(e) {
    if (!screens.game || !screens.game.classList.contains('active')) return;
    if (e.repeat || state !== 'IDLE') return;
    if (e.key?.toLowerCase() === 'f' || e.code === 'KeyF') {
      e.preventDefault();
      focusLastCatchSummary();
    }
  }

  /** Abre o painel de equipamento — só disponível no IDLE */
  function openEquipPanel() {
    const panel = ui.equipPanel || $('equip-panel');
    if (!panel) return;
    _showEquipView('categories');
    panel.classList.remove('hidden');
    $('btn-cat-baits')?.focus();
  }

  function closeEquipPanel() {
    const panel = ui.equipPanel || $('equip-panel');
    panel?.classList.add('hidden');
    ($('btn-bar-equip') || $('btn-menu'))?.focus();
  }

  /** Abre a carga durante a pescaria, sem sair da tela de jogo. */
  function openHoldPanel() {
    if (gameMode !== 'normal' || !['IDLE', 'CAUGHT'].includes(state)) return;
    renderHoldPanel();
    const panel = $('hold-panel');
    panel?.classList.remove('hidden');
    (panel?.querySelector('.hold-release-btn:not([disabled])') || $('btn-hold-close'))?.focus();
  }

  function closeHoldPanel() {
    $('hold-panel')?.classList.add('hidden');
    ($('btn-bar-hold') || $('btn-bar-equip') || $('btn-menu'))?.focus();
  }

  /** Renderiza a carga ativa e permite liberar peixes não protegidos. */
  function renderHoldPanel() {
    const boat = _holdCapacityBoat();
    HoldPanelView.render({
      used: Inventory.holdUsed(),
      cap: Inventory.holdCapacity(boat),
      containerName: _holdContainerName(boat),
      refreshHud: refreshHoldHud,
      rerender: renderHoldPanel,
      announce: speak,
    });
  }

  /** Alterna entre a vista de categorias e a de iscas */
  function _showEquipView(view) {
    $('equip-categories').classList.toggle('hidden', view !== 'categories');
    $('equip-baits-view').classList.toggle('hidden', view !== 'baits');
  }

  /** Renderiza a lista de iscas disponíveis no painel */
  function _renderBaitList() {
    BaitPanelView.render({
      announce: speak,
      refreshHud: refreshBaitHud,
      closePanel: closeEquipPanel,
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
    ResultView.render({
      caught,
      currentFish,
      lastCaughtItem: _lastCaughtItem,
      score,
      best,
      translate: t,
      fishName,
      coins: () => Inventory.coins(),
    });
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
    HubHUD.refresh();
  }

  /** Inicia a trilha correspondente à tela da cidade. */
  function _startCityScreenMusic(screen) {
    CityMusic.start(screen);
  }

  /** Exibe o hub da cidade */
  function showStoryHub() {
    _refreshHubHUD();
    Audio.stopAmbient();
    showScreen('storyHub');
    _startCityScreenMusic('city');
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
    // Revela as zonas iniciais; zonas condicionadas ficam para a progressão.
    const initialZones = activeMap.initialZones ||
      (activeMap.zones && activeMap.zones.find(z => !z.hidden)
        ? [activeMap.zones.find(z => !z.hidden).id] : []);
    initialZones.forEach(zoneId => Inventory.knowZone(activeMap.id, zoneId));
    // Restaurar zona ativa
    activeZone = Inventory.getActiveZone(activeMap.id)
              || (activeMap.zones && activeMap.zones.find(z => !z.hidden)?.id)
              || null;
    _renderBoatVisual();
  }

  // ── Casa ───────────────────────────────────────────────────────────────────

  /** Renderiza a tela da casa com nível atual e próximo upgrade. */
  function renderHouse() {
    HouseView.render({
      translate: t,
      getHouseLevel: getHouseLevel,
      getNextHouseLevel: getNextHouseLevel,
      getLevel: () => Inventory.getHouseLevel(),
      coins: () => Inventory.coins(),
      getOwnedEquip: () => Inventory.getOwnedEquip(),
      spendCoins: price => Inventory.spendCoins(price),
      upgradeHouse: () => Inventory.upgradeHouse(),
      rerender: renderHouse,
    });
  }

  // ── Estaleiro ─────────────────────────────────────────────────────────────

  /** Renderiza a tela do estaleiro com embarcações para comprar e possuídas. */
  function renderVessel() {
    VesselView.render({
      translate: t,
      ownedEquip: () => Inventory.getOwnedEquip(),
      activeBoat: () => Inventory.getActiveBoat(),
      coins: () => Inventory.coins(),
      vessels: VESSELS_CATALOG,
      getVessel,
      spendCoins: price => Inventory.spendCoins(price),
      addEquip: id => Inventory.addEquip(id),
      getActiveBoat: () => Inventory.getActiveBoat(),
      setActiveBoat: id => Inventory.setActiveBoat(id),
      refreshHubHUD: _refreshHubHUD,
      rerender: renderVessel,
    });
  }

  function _hasRequiredRod(map, equip = Inventory.getEquip()) {
    if (!map?.requiredRod) return true;
    const required = SHOP_CATALOG.find(item => item.id === map.requiredRod);
    const equipped = SHOP_CATALOG.find(item => item.id === equip?.rod);
    return !!required && !!equipped && (equipped.tier || 0) >= (required.tier || 0);
  }

  function _mapAllowedBoats(map) {
    return Array.isArray(map?.allowedBoats) ? map.allowedBoats : [];
  }

  function _mapBoatId(map, owned = Inventory.getOwnedEquip()) {
    const allowed = _mapAllowedBoats(map);
    if (!allowed.length) return null;
    const active = Inventory.getActiveBoat();
    return allowed.includes(active) ? active : allowed.find(id => owned.includes(id)) || null;
  }

  function _hasMapBoatAccess(map, owned = Inventory.getOwnedEquip()) {
    return !_mapAllowedBoats(map).length || !!_mapBoatId(map, owned);
  }

  function _mapBoatLabel(map) {
    const allowed = _mapAllowedBoats(map);
    return allowed.map(id => I18n.t('boat_' + id) || id).join(' / ');
  }

  function _renderBoatVisual() {
    const map = activeMap;
    const allowed = _mapAllowedBoats(map);
    // Pesca Livre é independente da progressão e sempre acontece da margem;
    // barcos só participam das pescarias do modo História.
    const needsBoat = gameMode !== 'free' && allowed.length > 0;
    const boatId = needsBoat ? (_mapBoatId(map) || allowed[0] || null) : null;
    const vessel = boatId ? VESSELS_CATALOG.find(v => v.id === boatId) : null;
    const icon = vessel?.emoji || (needsBoat ? '🚣' : '');
    ui.boatVisual?.classList.toggle('hidden', !needsBoat);
    if (ui.boatVisualIcon) ui.boatVisualIcon.innerHTML = vessel?.sprite ? Visuals.boatMarkup(vessel.sprite, 'boat-visual-svg') : icon;
    if (ui.boatContext) {
      ui.boatContext.textContent = needsBoat
        ? `${I18n.t(map.nameKey)} — ${I18n.t('boat_context_in')} ${I18n.t(vessel?.nameKey || ('boat_' + (allowed[0] || 'canoe')))}.`
        : `${I18n.t(map.nameKey)} — ${I18n.t('boat_context_shore')}.`;
    }
  }

  /** Renderiza a tela de seleção de destino */
  function renderTravel() {
    TravelView.render({
      translate: t,
      getActiveMap,
      ownedEquip: () => Inventory.getOwnedEquip(),
      equipped: () => Inventory.getEquip(),
      maps: MAPS,
      vesselCatalog: VESSELS_CATALOG,
      hasMapBoatAccess: _hasMapBoatAccess,
      mapBoatId: _mapBoatId,
      mapAllowedBoats: _mapAllowedBoats,
      mapBoatLabel: _mapBoatLabel,
      speak,
      startGame,
      setActiveMap,
      showScreen,
      calcBoatFee: boatId => Inventory.calcBoatFee(boatId),
      getActiveBoat: () => Inventory.getActiveBoat(),
      setActiveBoat: id => Inventory.setActiveBoat(id),
      coins: () => Inventory.coins(),
      spendCoins: fee => Inventory.spendCoins(fee),
      refreshHubHUD: _refreshHubHUD,
    });
  }

  // ── Modal de Zonas de Pesca ──────────────────────────────────────────────

  function openZoneModal() {
    ZoneView.open({
      activeMap: () => activeMap,
      activeZone: () => activeZone,
      getKnownZones: mapId => Inventory.getKnownZones(mapId),
      setActiveZone: zoneId => {
        activeZone = zoneId;
        Inventory.setActiveZone(activeMap.id, zoneId);
      },
      getSound: () => A11y.get('sound'),
      playTransition: () => Audio.playZoneTransition(),
      initAudio: () => Audio.init(),
      startAmbient: key => Audio.startAmbient(key),
      ambientProfileKey: _ambientProfileKey,
      close: closeZoneModal,
      updateHud: _updateZoneHud,
    });
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

  function _handleInternalMenuClick(event) {
    const target = event.target.closest?.('button');
    if (!target) return;
    if (target.classList.contains('shop-mode-tab')) {
      event.stopPropagation();
      document.querySelectorAll('.shop-mode-tab').forEach(btn => {
        const active = btn === target;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('shop-panel-buy')?.classList.toggle('hidden', target.dataset.mode !== 'buy');
      $('shop-panel-sell')?.classList.toggle('hidden', target.dataset.mode !== 'sell');
      return;
    }
    if (target.classList.contains('shop-tab')) {
      const panel = target.closest('#shop-panel-buy, #shop-panel-sell, #screen-inventory');
      if (!panel) return;
      event.stopPropagation();
      const prefix = panel.id === 'screen-inventory'
        ? 'inv' : (panel.id === 'shop-panel-buy' ? 'buy' : 'sell');
      _switchPanelTab(panel.id, target.dataset.tab, prefix);
    }
  }

  function _bindShopNavigation() {
    document.querySelectorAll('.shop-mode-tab').forEach(btn => {
      if (btn.dataset.bbNavBound) return;
      btn.dataset.bbNavBound = 'true';
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shop-mode-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const mode = btn.dataset.mode;
        $('shop-panel-buy')?.classList.toggle('hidden', mode !== 'buy');
        $('shop-panel-sell')?.classList.toggle('hidden', mode !== 'sell');
      });
    });
    document.querySelectorAll('#shop-panel-buy .shop-tab').forEach(tab => {
      if (tab.dataset.bbNavBound) return;
      tab.dataset.bbNavBound = 'true';
      tab.addEventListener('click', () => _switchPanelTab('shop-panel-buy', tab.dataset.tab, 'buy'));
    });
    document.querySelectorAll('#shop-panel-sell .shop-tab').forEach(tab => {
      if (tab.dataset.bbNavBound) return;
      tab.dataset.bbNavBound = 'true';
      tab.addEventListener('click', () => _switchPanelTab('shop-panel-sell', tab.dataset.tab, 'sell'));
    });
  }

  function _bindInventoryNavigation() {
    document.querySelectorAll('#screen-inventory .shop-tab').forEach(tab => {
      if (tab.dataset.bbNavBound) return;
      tab.dataset.bbNavBound = 'true';
      tab.addEventListener('click', () => _switchPanelTab('screen-inventory', tab.dataset.tab, 'inv'));
    });
  }

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
    _bindInventoryNavigation();
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
    InventoryFishView.render({
      translate: t,
      feedback: _invFeedback.bind(null, fbEl),
      rerender: renderInventory,
    });

    // ── Aba Iscas ───────────────────────────────────────────────────────────
    InventoryBaitView.render({
      translate: t,
      equippedBait: equip.bait,
      feedback: _invFeedback.bind(null, fbEl),
      rerender: renderInventory,
    });

    // ── Aba Equipamentos ────────────────────────────────────────────────────
    const owned      = Inventory.getOwnedEquip();
    const equipList  = $('inv-equip-list');
    const equipEmpty = $('inv-equip-empty');
    equipList.innerHTML = '';

    const defaults = ['rod_basic','line_mono','hook_basic','float_basic','basket_basic'];
    const allOwned = [...new Set([...defaults, ...owned])];

    // Agrupar por slot para exibir o item equipado por slot
    const SLOT_MAP = { rod:'rod', line:'line', hook:'hook', float:'float', basket:'basket' };

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
          <span class="inv-item-icon" aria-hidden="true">${shopItem.sprite ? Visuals.iconMarkup(shopItem.sprite, 'bb-svg-icon bb-svg-icon--small') : shopItem.emoji}</span>
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
    _bindShopNavigation();
    $('shop-coins').textContent = Inventory.coins();
    $('shop-feedback').classList.add('hidden');
    _renderShopBuy();
    _renderShopSell();
  }

  // ── Painéis da Loja ───────────────────────────────────────────────────────
  function _renderShopBuy() {
    ShopBuyView.render({
      translate: t,
      getEquip: () => Inventory.getEquip(),
      getOwnedEquip: () => Inventory.getOwnedEquip(),
      coins: () => Inventory.coins(),
      catalog: SHOP_CATALOG,
      defaults: ['rod_basic','line_mono','hook_basic','float_basic','basket_basic'],
      handleBuy: _handleShopBuy,
      equipItem: _equipItem,
      rerender: renderShop,
    });
  }

  function _renderShopSell() {
    ShopSellView.render({
      translate: t,
      getInventory: () => Inventory.getAll(),
      isProtected: id => Inventory.isProtected(id),
      getBaits: () => Inventory.getBaits(),
      getEquip: () => Inventory.getEquip(),
      getOwnedEquip: () => Inventory.getOwnedEquip(),
      catalog: SHOP_CATALOG,
      baitCatalog: BAIT_CATALOG,
      defaults: ['rod_basic','line_mono','hook_basic','float_basic','basket_basic'],
      sellAll: () => Inventory.sellAll(),
      sellFishQty: (fishId, qty) => Inventory.sellFishQty(fishId, qty),
      sellBaits: (baitId, qty) => Inventory.sellBaits(baitId, qty),
      sellEquip: id => Inventory.sellEquip(id),
      coins: () => Inventory.coins(),
      feedback: _shopFeedback,
    });
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
    _renderFishingGearVisuals();
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
    ScreenNavigation.show(screens, name);
  }

  function setLabel(text)  { if (ui.stateLabel) ui.stateLabel.textContent = text; }

  /** Vibra apenas se háptica estiver ativada nas preferências */
  function _vibrate(pattern) { if (A11y.get('haptic')) Audio.vibrate(pattern); }

  /** Toca som apenas se som estiver ativado nas preferências */
  function _play(id) { if (A11y.get('sound')) Audio.play(id); }

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
