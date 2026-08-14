/**
 * bait-panel-view.js — Bites & Baits
 *
 * Renderiza as iscas disponíveis no painel de equipamento. A ação de equipar
 * continua usando callbacks fornecidos pelo Game.
 */

const BaitPanelView = (() => {
  function render({ announce, refreshHud, closePanel }) {
    const baits = Inventory.getBaits();
    const equip = Inventory.getEquip();
    const list = document.getElementById('bait-list');
    list.innerHTML = '';

    const ids = Object.keys(BAIT_CATALOG);
    if (ids.every(id => (baits[id] ?? 0) === 0)) {
      const li = document.createElement('li');
      li.className = 'bait-item bait-empty';
      li.textContent = I18n.t('equip_no_bait');
      list.appendChild(li);
      return;
    }

    ids.forEach(id => {
      const qty = baits[id] ?? 0;
      const bait = BAIT_CATALOG[id];
      const isEq = equip.bait === id;

      const li = document.createElement('li');
      li.className = `bait-item${isEq ? ' bait-equipped' : ''}${qty === 0 ? ' bait-out' : ''}`;

      const label = document.createElement('span');
      label.className = 'bait-item-label';
      label.innerHTML = `${bait.sprite ? Visuals.iconMarkup(bait.sprite, 'bb-svg-icon bb-svg-icon--small') : bait.emoji} ${I18n.t(bait.nameKey)}`;

      const qtyEl = document.createElement('span');
      qtyEl.className = 'bait-item-qty';
      qtyEl.textContent = I18n.t('equip_qty', qty);

      const button = document.createElement('button');
      button.className = 'btn-bait-select';
      button.textContent = isEq ? I18n.t('equip_selected') : I18n.t('equip_select');
      button.disabled = qty === 0 || isEq;
      button.setAttribute('aria-pressed', isEq ? 'true' : 'false');
      button.addEventListener('click', () => {
        if (Inventory.equipBait(id)) {
          announce(I18n.t('equip_consume_ok', I18n.t(bait.nameKey), Inventory.baitCount(id)));
          refreshHud();
          closePanel();
        }
      });

      li.append(label, qtyEl, button);
      list.appendChild(li);
    });
  }

  return { render };
})();
