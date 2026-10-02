/** inventory-decoration-view.js — decorations owned for the future house system. */
const InventoryDecorationView = (() => {
  function render({ translate }) {
    const list = document.getElementById('inv-decor-list');
    const empty = document.getElementById('inv-decor-empty');
    if (!list || !empty) return;

    const items = Inventory.getDecorations()
      .map(getHomeDecorationItem)
      .filter(Boolean);
    list.innerHTML = '';
    empty.classList.toggle('hidden', items.length > 0);

    items.forEach(item => {
      const row = document.createElement('li');
      row.className = 'inv-item inv-decoration-item';

      const icon = document.createElement('span');
      icon.className = 'inv-item-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.emoji;

      const info = document.createElement('div');
      info.className = 'inv-item-info';
      const name = document.createElement('h3');
      name.className = 'inv-item-name';
      name.textContent = translate(item.nameKey);
      const description = document.createElement('p');
      description.className = 'inv-item-detail';
      description.textContent = translate(item.descriptionKey);
      info.append(name, description);
      row.append(icon, info);
      list.appendChild(row);
    });
  }

  return { render };
})();
