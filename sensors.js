/**
 * sensors.js — Bites & Baits
 * Gerencia DeviceOrientation (inclinação) e DeviceMotion (shake)
 *
 * Eixos usados (portrait/retrato):
 *   beta  → inclinação frente/trás  (-180 a 180)
 *           beta < 0  → inclinado para frente (lançar / aliviar)
 *           beta > 15 → inclinado para trás  (puxar)
 *           -15..15   → neutro
 *
 * Shake → magnitude de aceleração > threshold
 */

const Sensors = (() => {
  // Callbacks registrados pelo game.js
  const _callbacks = {
    onTilt: null,   // (direction: 'forward'|'neutral'|'back', beta: number) => void
    onShake: null,  // () => void
  };

  // Configurações
  const FORWARD_THRESHOLD  = -18;  // beta abaixo disto = inclinar para frente
  const BACK_THRESHOLD     =  18;  // beta acima disto  = inclinar para trás
  const SHAKE_THRESHOLD    =  22;  // m/s² para detectar shake
  const SHAKE_COOLDOWN_MS  = 600;  // ms entre shakes

  let _lastTilt          = 'neutral';
  let _lastShakeAt       = 0;
  let _permitted         = false;
  let _keyTilt           = 'neutral';
  let _keyboardListeners = false;

  // ── Solicita permissão (iOS 13+) ─────────────────────────────────────────
  async function requestPermission() {
    // iOS precisa de permissão explícita
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const r1 = await DeviceOrientationEvent.requestPermission();
        const r2 = await DeviceMotionEvent.requestPermission();
        _permitted = (r1 === 'granted' && r2 === 'granted');
      } catch (e) {
        _permitted = false;
      }
    } else {
      // Android / desktop — sem necessidade de permissão explícita
      // Verifica se os sensores realmente disparam dados (PC não tem sensor físico)
      _permitted = await _probesensors();
    }
    return _permitted;
  }

  // Testa se o dispositivo realmente envia eventos de sensor num intervalo curto
  function _probesensors() {
    return new Promise(resolve => {
      let fired = false;
      const handler = () => { fired = true; };
      window.addEventListener('deviceorientation', handler, { once: true });
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handler);
        resolve(fired);
      }, 400);
    });
  }

  // ── Inicializa listeners ──────────────────────────────────────────────────
  function start() {
    window.addEventListener('deviceorientation', _handleOrientation, true);
    window.addEventListener('devicemotion',      _handleMotion,      true);
    // O teclado também funciona em celulares com sensores, inclusive via OTG.
    // O registro é idempotente e os handlers só atuam na tela de jogo.
    enableDesktopFallback();
  }

  function stop() {
    window.removeEventListener('deviceorientation', _handleOrientation, true);
    window.removeEventListener('devicemotion',      _handleMotion,      true);
    _lastTilt = 'neutral';
    _keyTilt  = 'neutral';
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function _handleOrientation(e) {
    const beta = e.beta ?? 0;  // -180..180

    let dir;
    if (beta < FORWARD_THRESHOLD)      dir = 'forward';
    else if (beta > BACK_THRESHOLD)    dir = 'back';
    else                               dir = 'neutral';

    // Normaliza valor para UI (-1 = full forward, 0 = neutral, 1 = full back)
    const norm = Math.max(-1, Math.min(1, beta / 60));

    if (_callbacks.onTilt) _callbacks.onTilt(dir, beta, norm);
    _lastTilt = dir;
  }

  function _handleMotion(e) {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const magnitude = Math.sqrt(
      (acc.x ?? 0) ** 2 +
      (acc.y ?? 0) ** 2 +
      (acc.z ?? 0) ** 2
    );
    const now = Date.now();
    if (magnitude > SHAKE_THRESHOLD && (now - _lastShakeAt) > SHAKE_COOLDOWN_MS) {
      _lastShakeAt = now;
      if (_callbacks.onShake) _callbacks.onShake();
    }
  }

  // ── Teclado físico — PC, Android com teclado OTG e outros dispositivos ───
  function _gameScreenActive() {
    const screen = document.getElementById('screen-game');
    return !!screen && screen.classList.contains('active');
  }

  function _fireKey() {
    const beta = _keyTilt === 'forward' ? -30 : _keyTilt === 'back' ? 30 : 0;
    const norm = _keyTilt === 'forward' ? -0.5 : _keyTilt === 'back' ? 0.5 : 0;
    if (_callbacks.onTilt) _callbacks.onTilt(_keyTilt, beta, norm);
  }

  function _isKey(e, key, code = key) {
    // e.code mantém a identificação física da tecla no PC mesmo quando o
    // layout/idioma altera e.key. O fallback legado cobre navegadores antigos.
    return e.key === key || e.code === code || e.key === key.replace('Arrow', '');
  }

  function _handleKeyDown(e) {
    if (!_gameScreenActive()) return;
    if (_isKey(e, 'ArrowUp')) {
      e.preventDefault();
      _keyTilt = 'forward';
      _fireKey();
    } else if (_isKey(e, 'ArrowDown')) {
      e.preventDefault();
      _keyTilt = 'back';
      _fireKey();
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
      e.preventDefault();
      // Evita vários disparos quando o teclado mantém a tecla pressionada.
      if (!e.repeat && _callbacks.onShake) _callbacks.onShake();
    }
  }

  function _handleKeyUp(e) {
    if (!_gameScreenActive()) return;
    if (_isKey(e, 'ArrowUp') || _isKey(e, 'ArrowDown')) {
      e.preventDefault();
      _keyTilt = 'neutral';
      _fireKey();
    }
  }

  function enableDesktopFallback() {
    // Captura no window evita que controles focados ou outros listeners
    // interrompam as setas antes de o jogo receber o evento.
    // Pode ser chamado pelo start() e pela resposta da permissão sem duplicar listeners.
    if (_keyboardListeners) return;
    window.addEventListener('keydown', _handleKeyDown, true);
    window.addEventListener('keyup',   _handleKeyUp,   true);
    _keyboardListeners = true;
    console.info('[Sensors] Teclado ativo: ↑=lançar ↓=puxar Espaço=shake');
  }

  function on(event, cb) {
    _callbacks[event] = cb;
  }

  return { requestPermission, start, stop, on, enableDesktopFallback };
})();
