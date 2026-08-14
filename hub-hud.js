/**
 * hub-hud.js — Bites & Baits
 *
 * Atualiza apenas as informações exibidas no cabeçalho da Cidade.
 */

const HubHUD = (() => {
  function refresh() {
    const coinsEl = document.getElementById('hub-coins');
    if (coinsEl) coinsEl.textContent = Inventory.coins();

    if (typeof GameTime !== 'undefined') {
      const hud = GameTime.formatHUD();
      const dateEl = document.getElementById('hub-date');
      const clockEl = document.getElementById('hub-clock');
      if (dateEl) dateEl.textContent = hud.date;
      if (clockEl) clockEl.textContent = hud.time;
    }
  }

  return { refresh };
})();
