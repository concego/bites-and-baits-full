/**
 * inventory-equipment-view.js — Bites & Baits
 *
 * Renderiza a aba de equipamentos do Inventário; a aplicação dos itens e os
 * recálculos continuam sob responsabilidade do Game.
 */

const InventoryEquipmentView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, equipment, protect, feedback, equipItem, recalcGearMods, rerender }) {
    const t = translate;
    const owned = Inventory.getOwnedEquip();
    const list = $('inv-equip-list');
    const empty = $('inv-equip-empty');
    list.innerHTML = '';

    const defaults = typeof Inventory.hasInitialGear === 'function' && Inventory.hasInitialGear()
      ? ['rod_basic', 'line_mono', 'hook_basic', 'float_basic', 'basket_basic'] : [];
    const allOwned = [...new Set([...defaults, ...owned])];
    const slotMap = { rod: 'rod', line: 'line', hook: 'hook', float: 'float', basket: 'basket' };

    if (allOwned.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    allOwned.forEach(itemId => {
      const shopItem = typeof SHOP_CATALOG !== 'undefined'
        ? SHOP_CATALOG.find(item => item.id === itemId) : null;
      if (!shopItem) return;
      const slot = shopItem.type;
      const isEquipped = equipment[slot] === itemId;
      const itemName = t(shopItem.nameKey) || shopItem.id;
      const isProtected = Inventory.isProtected(itemId);
      const li = document.createElement('li');
      li.className = 'inv-item inv-equip-item';
      li.innerHTML = `
        <span class="inv-item-icon" aria-hidden="true">${shopItem.sprite ? Visuals.iconMarkup(shopItem.sprite, 'bb-svg-icon bb-svg-icon--small') : shopItem.emoji}</span>
        <div class="inv-item-info">
          <span class="inv-item-name">${itemName}
            ${isEquipped ? `<span class="inv-badge-equip">${t('inv_equipped_badge')}</span>` : ''}
          </span>
          <span class="inv-item-detail">${t(shopItem.descKey) || ''}</span>
          ${shopItem.tier ? `<span class="shop-tier-badge">${t('shop_tier', shopItem.tier)}</span>` : ''}
        </div>
        <div class="inv-item-actions">
          <button class="btn-inv-protect btn-secondary"
                  data-item-id="${itemId}"
                  aria-pressed="${isProtected}">
            ${isProtected ? t('inv_unprotect') : t('inv_protect')}
          </button>
          <button class="btn-inv-examine btn-secondary"
                  data-item-id="${itemId}"
                  aria-label="${t('inv_examine')} ${itemName}">
            ${t('inv_examine')}
          </button>
          ${isEquipped
            ? `<button class="btn-inv-unequip btn-danger"
                       data-item-id="${itemId}" data-slot="${slot}"
                       aria-label="${t('inv_unequip_btn')} ${itemName}">
                 ${t('inv_unequip_btn')}
               </button>`
            : `<button class="btn-inv-equip btn-secondary"
                       data-item-id="${itemId}" data-slot="${slot}"
                       aria-label="${t('inv_equip_btn')} ${itemName}">
                 ${t('inv_equip_btn')}
               </button>`}
        </div>`;

      li.querySelector('.btn-inv-protect')?.addEventListener('click', event => {
        Inventory.toggleProtect(event.currentTarget.dataset.itemId);
        rerender();
      });
      li.querySelector('.btn-inv-examine')?.addEventListener('click', event => {
        const item = SHOP_CATALOG.find(entry => entry.id === event.currentTarget.dataset.itemId);
        if (!item) return;
        const mods = Object.entries(item.modifiers || {}).map(([key, value]) => `${key}: ${value}`).join(' | ');
        feedback(`${t(item.nameKey) || item.id} — Tier ${item.tier || '—'} | ${mods || '—'}`, true);
      });
      li.querySelector('.btn-inv-equip')?.addEventListener('click', event => {
        const id = event.currentTarget.dataset.itemId;
        const slotName = event.currentTarget.dataset.slot;
        equipItem(id, slotName);
        Inventory.addEquip(id);
        rerender();
      });
      li.querySelector('.btn-inv-unequip')?.addEventListener('click', event => {
        Inventory.unequipSlot(event.currentTarget.dataset.slot);
        recalcGearMods();
        rerender();
      });
      list.appendChild(li);
    });
  }

  return { render };
})();
