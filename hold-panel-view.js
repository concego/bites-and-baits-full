/**
 * hold-panel-view.js — Bites & Baits
 *
 * Renderiza a carga durante a pesca. O Game fornece os dados de contexto e
 * as ações que precisam permanecer ligadas à máquina de estados.
 */

const HoldPanelView = (() => {
  const $ = id => document.getElementById(id);

  function render({ used, cap, containerName, refreshHud, rerender, announce }) {
    const list = $('hold-fish-list');
    const summary = $('hold-panel-summary');
    if (!list || !summary) return;

    summary.textContent = `${I18n.t('hold_title') || 'Carga'}: ${used} de ${cap} peixes — ${containerName}.`;
    list.innerHTML = '';

    const fishes = Inventory.getAll();
    if (fishes.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'inv-item hold-empty';
      empty.textContent = I18n.t('hold_empty') || 'Nenhum peixe na carga.';
      list.appendChild(empty);
      return;
    }

    fishes.forEach(fish => {
      const name = I18n.t(fish.nameKey) || fish.nameKey || fish.fishId;
      const protectedFish = Inventory.isProtected(fish.id);
      const li = document.createElement('li');
      li.className = 'inv-item hold-fish-item';

      const info = document.createElement('div');
      info.className = 'inv-item-info';
      const nameEl = document.createElement('span');
      nameEl.className = 'inv-item-name';
      nameEl.textContent = name;
      const detail = document.createElement('span');
      detail.className = 'inv-item-detail';
      detail.textContent = I18n.t('hold_fish_detail', fish.weight.toFixed(2), fish.value);
      info.append(nameEl, detail);

      const actions = document.createElement('div');
      actions.className = 'inv-item-actions';
      const button = document.createElement('button');
      button.className = 'btn-secondary hold-release-btn';
      button.textContent = protectedFish
        ? (I18n.t('hold_protected') || '🔒 Protegido')
        : (I18n.t('hold_release') || 'Soltar');
      button.setAttribute('aria-label', protectedFish
        ? `${name}, ${I18n.t('hold_protected') || 'protegido'}`
        : `${I18n.t('hold_release') || 'Soltar'} ${name}`);
      button.disabled = protectedFish;
      button.addEventListener('click', () => {
        if (protectedFish) return;
        const prompt = I18n.t('hold_release_confirm', name) || `Soltar ${name}?`;
        if (!window.confirm(prompt)) return;
        if (!Inventory.removeItem(fish.id)) {
          announce(I18n.t('hold_release_failed') || 'Não foi possível soltar este peixe.');
          return;
        }
        const nextUsed = Inventory.holdUsed();
        refreshHud();
        rerender();
        const status = I18n.t('hold_release_done', name, nextUsed, cap)
          || `${name} solto. Carga: ${nextUsed} de ${cap}.`;
        announce(status);
        $('hold-panel-summary')?.setAttribute('aria-label', status);
      });
      actions.appendChild(button);
      li.append(info, actions);
      list.appendChild(li);
    });
  }

  return { render };
})();
