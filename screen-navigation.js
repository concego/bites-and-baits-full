/**
 * screen-navigation.js — Bites & Baits
 *
 * Controla a ativação, o bloqueio e o foco inicial das telas. Decisões de
 * negócio — como qual tela abrir — continuam no Game.
 */

const ScreenNavigation = (() => {
  const CITY_MUSIC_SCREENS = [
    'storyHub', 'house', 'shop', 'travel', 'inventory', 'vessel',
  ];

  function show(screens, name) {
    console.log('[BB] showScreen:', name);

    // Desativa e bloqueia todas as telas conhecidas.
    Object.entries(screens).forEach(([, screen]) => {
      if (!screen) return;
      screen.classList.remove('active');
      screen.setAttribute('inert', '');
    });

    // A música de menu só existe nas telas da cidade.
    if (!CITY_MUSIC_SCREENS.includes(name)) Audio.stopCityMusic();

    // Fora do jogo, a barra inferior não pode interceptar outras telas.
    if (name !== 'game') {
      const bar = document.getElementById('game-bottom-bar');
      if (bar) bar.classList.add('hidden');
    }

    const target = screens[name];
    if (!target) return;
    target.classList.add('active');
    target.removeAttribute('inert');

    // Move o foco para o título ou primeiro botão para o leitor anunciar a tela.
    requestAnimationFrame(() => {
      const heading = target.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
        return;
      }
      const button = target.querySelector('button:not([disabled])');
      if (button) button.focus();
    });
  }

  return { show };
})();
