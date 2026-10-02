/**
 * accessibility-announcer.js — Bites & Baits
 *
 * Atualiza a live region usada pelo leitor de tela. Este módulo não cria
 * áudio próprio e não conhece a máquina de estados da pescaria.
 */

const A11yAnnouncer = (() => {
  function _element() {
    return document.getElementById('announcer');
  }

  function speak(text) {
    const announcer = _element();
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      announcer.textContent = text;
    }));
  }

  function _messageKey(key, ...args) {
    const verbose = typeof A11y !== 'undefined' && A11y.get('verboseVoice');
    const fullKey = verbose ? `vspeak_${key}` : `speak_${key}`;
    return I18n.t(fullKey, ...args);
  }

  function sayKey(key, ...args) {
    speak(_messageKey(key, ...args));
  }

  // Capturas usam uma atualização separada para leitores como NVDA, que
  // podem ignorar a troca quando ela ocorre junto da transição visual.
  function _sayCatchMessage(message) {
    const announcer = _element();
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => {
      if (announcer) announcer.textContent = message;
    }, 80);
  }

  function sayCatchKey(key, ...args) {
    _sayCatchMessage(_messageKey(key, ...args));
  }

  // Keep a quest follow-up in the same live-region announcement as the catch,
  // so it neither interrupts the catch details nor disappears after navigation.
  function sayCatchKeyWithFollowup(key, followup, ...args) {
    _sayCatchMessage(`${_messageKey(key, ...args)} ${followup}`);
  }

  return { speak, sayKey, sayCatchKey, sayCatchKeyWithFollowup };
})();
