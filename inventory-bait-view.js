/**
 * inventory-bait-view.js — Bites & Baits
 *
 * Renderiza a aba de iscas do Inventário e mantém as ações ligadas ao
 * Inventory por callbacks do Game.
 */

const InventoryBaitView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, equippedBait, feedback, rerender }) {
    const t = translate;
    const baits = Inventory.getBaits();
    const baitList = $('inv-baits-list');
    const baitEmpty = $('inv-baits-empty');
    baitList.innerHTML = '';

    const baitEntries = Object.entries(baits).filter(([, quantity]) => quantity > 0);
    if (baitEntries.length === 0) {
      baitEmpty.classList.remove('hidden');
      return;
    }

    baitEmpty.classList.add('hidden');
    baitEntries.forEach(([baitId, quantity]) => {
      const def = BAIT_CATALOG[baitId] || { emoji: '?', nameKey: baitId };
      const isEquipped = equippedBait === baitId;
      const li = document.createElement('li');
      li.className = 'inv-item inv-bait-item';
      li.innerHTML = `
        <span class="inv-item-icon" aria-hidden="true">${def.sprite ? Visuals.iconMarkup(def.sprite, 'bb-svg-icon bb-svg-icon--small') : def.emoji}</span>
        <div class="inv-item-info">
          <span class="inv-item-name">${t(def.nameKey) || def.nameKey}
            ${isEquipped ? `<span class="inv-badge-equip">${t('inv_equipped_badge')}</span>` : ''}
          </span>
          <span class="inv-item-detail">${t('shop_stock_label', quantity)}</span>
        </div>
        <div class="inv-item-actions">
          <button class="btn-inv-examine-bait btn-secondary"
                  data-bait-id="${baitId}"
                  aria-label="${t('inv_examine')} ${t(def.nameKey) || baitId}">
            ${t('inv_examine')}
          </button>
          <button class="btn-equip-bait ${isEquipped ? 'btn-equipped' : 'btn-secondary'}"
                  data-bait-id="${baitId}"
                  aria-pressed="${isEquipped}"
                  ${isEquipped ? 'disabled' : ''}>
            ${isEquipped ? t('shop_equipped') : t('shop_equip')}
          </button>
        </div>`;

      li.querySelector('.btn-inv-examine-bait').addEventListener('click', event => {
        const id = event.currentTarget.dataset.baitId;
        const name = t(BAIT_CATALOG[id]?.nameKey || id);
        const desc = t('shop_desc_' + id) || '';
        feedback(t('inv_examine_bait', name, desc), true);
      });

      if (!isEquipped) {
        li.querySelector('.btn-equip-bait').addEventListener('click', event => {
          Inventory.equipBait(event.currentTarget.dataset.baitId);
          rerender();
        });
      }

      baitList.appendChild(li);
    });
  }

  return { render };
})();
