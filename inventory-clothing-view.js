/** inventory-clothing-view.js — clothing owned by the player and equipped from inventory. */
const InventoryClothingView = (() => {
  function render({ translate, mode, onModeChange, onEquip }) {
    const t = translate;
    const list = document.getElementById('inv-clothing-list');
    const empty = document.getElementById('inv-clothing-empty');
    const modeSelect = document.getElementById('inv-clothing-mode');
    if (!list || !empty) return;

    if (modeSelect) {
      modeSelect.value = mode;
      modeSelect.onchange = () => onModeChange(modeSelect.value);
    }

    const lang = typeof I18n !== 'undefined' && I18n.getLang ? I18n.getLang() : 'pt';
    const items = Inventory.getClothing()
      .map(id => getClothingItem(id))
      .filter(item => item && item.modes.includes(mode));
    const equipped = Wardrobe.getEquipped(mode);
    list.innerHTML = '';
    empty.classList.toggle('hidden', items.length > 0);
    if (!items.length) return;

    items.forEach(item => {
      const row = document.createElement('li');
      row.className = 'inv-item inv-clothing-item';
      const swatch = document.createElement('span');
      swatch.className = 'clothing-swatch inv-clothing-swatch';
      swatch.style.backgroundColor = item.color;
      swatch.setAttribute('aria-hidden', 'true');

      const info = document.createElement('div');
      info.className = 'inv-item-info';
      const name = document.createElement('h3');
      name.className = 'inv-item-name';
      name.textContent = `${item.name[lang]} — ${item.colorName[lang]}`;
      const description = document.createElement('p');
      description.className = 'inv-item-detail';
      description.textContent = item.description[lang];
      const slot = document.createElement('p');
      slot.className = 'inv-item-detail';
      slot.textContent = t(`inv_clothing_slot_${item.slot}`);
      info.append(name, description, slot);

      const actions = document.createElement('div');
      actions.className = 'inv-item-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.clothingId = item.id;
      const isEquipped = equipped[item.slot]?.id === item.id;
      if (isEquipped) {
        button.className = 'btn-equipped';
        button.disabled = true;
        button.textContent = t('inv_clothing_equipped');
        button.setAttribute('aria-label', `${name.textContent} — ${t('inv_clothing_equipped')}`);
      } else {
        button.className = 'btn-secondary';
        button.textContent = t('inv_equip_btn');
        button.setAttribute('aria-label', `${t(mode === 'fishing' ? 'inv_clothing_equip_fishing' : 'inv_clothing_equip_arrival')}: ${name.textContent}`);
        button.addEventListener('click', () => onEquip(item.id, item, mode));
      }
      actions.appendChild(button);
      row.dataset.clothingId = item.id;
      row.append(swatch, info, actions);
      list.appendChild(row);
    });
  }

  function focusItem(id) {
    const row = Array.from(document.querySelectorAll('#inv-clothing-list .inv-clothing-item'))
      .find(node => node.dataset.clothingId === id);
    const heading = row?.querySelector('h3');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }

  return { render, focusItem };
})();
