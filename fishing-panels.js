/**
 * fishing-panels.js — Bites & Baits
 *
 * Abre e fecha os painéis usados durante a pesca. A renderização do conteúdo
 * e as regras do jogo continuam no Game.
 */

const FishingPanels = (() => {
  const $ = id => document.getElementById(id);

  function openEquip(panel, showView) {
    showView('categories');
    panel.classList.remove('hidden');
    $('btn-cat-baits').focus();
  }

  function closeEquip(panel) {
    panel.classList.add('hidden');
    // Retorna foco ao botão de equipamento na barra inferior.
    const target = $('btn-bar-equip') || $('btn-menu');
    if (target) target.focus();
  }

  function openHold(gameMode, state, render) {
    if (gameMode !== 'normal' || !['IDLE', 'CAUGHT'].includes(state)) return;
    render();
    const panel = $('hold-panel');
    panel?.classList.remove('hidden');
    const firstAction = panel?.querySelector('.hold-release-btn:not([disabled])')
      || $('btn-hold-close');
    if (firstAction) firstAction.focus();
  }

  function closeHold() {
    $('hold-panel')?.classList.add('hidden');
    const target = $('btn-bar-hold') || $('btn-bar-equip') || $('btn-menu');
    if (target) target.focus();
  }

  return { openEquip, closeEquip, openHold, closeHold };
})();
