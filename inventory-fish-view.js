/**
 * inventory-fish-view.js — Bites & Baits
 *
 * Renderiza a aba de peixes do Inventário. As mudanças de estado continuam
 * no Game/Inventory; este módulo apenas mantém a apresentação e as ações da
 * lista.
 */

const InventoryFishView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, feedback, rerender }) {
    const t = translate;
    const fishList = $('inv-fish-list');
    const fishEmpty = $('inv-fish-empty');
    const fishes = Inventory.getAll();
    fishList.innerHTML = '';

    if (fishes.length === 0) {
      fishEmpty.classList.remove('hidden');
      return;
    }

    fishEmpty.classList.add('hidden');
    fishes.forEach(fish => {
      const prot = Inventory.isProtected(fish.id);
      const fishName = t(fish.nameKey) || fish.nameKey;
      const li = document.createElement('li');
      li.className = 'inv-item';
      li.setAttribute('role', 'listitem');
      li.innerHTML = `
        <div class="inv-item-info">
          <span class="inv-item-name">${fishName}
            ${prot ? `<span class="inv-badge-protect" aria-label="${t('inv_protected_badge')}">${t('inv_protected_badge')}</span>` : ''}
          </span>
          <span class="inv-item-detail">${fish.weight.toFixed(2)} kg · ${fish.value} 🪙</span>
        </div>
        <div class="inv-item-actions">
          <button class="btn-inv-examine-fish btn-secondary"
                  data-item-id="${fish.id}"
                  aria-label="${t('inv_examine')} ${fishName}">
            ${t('inv_examine')}
          </button>
          <button class="btn-inv-protect btn-secondary"
                  data-item-id="${fish.id}"
                  aria-pressed="${prot}">
            ${prot ? t('inv_unprotect') : t('inv_protect')}
          </button>
          <button class="btn-inv-discard btn-danger"
                  data-item-id="${fish.id}"
                  data-item-name="${fishName}"
                  aria-label="${t('inv_discard')} ${fishName}">
            ${t('inv_discard')}
          </button>
        </div>`;

      li.querySelector('.btn-inv-examine-fish').addEventListener('click', event => {
        const id = event.currentTarget.dataset.itemId;
        const currentFish = Inventory.getAll().find(item => item.id === id);
        if (!currentFish) return;
        const def = FISH_CATALOG[currentFish.fishId];
        const rarityMap = {
          lambari: 'common', tilapia: 'common', cara: 'common', piau: 'common',
          traira: 'uncommon', curimbata: 'uncommon', truta: 'uncommon',
          dourado: 'rare', tucunare: 'rare',
          pirarucu: 'legendary', peixe_dourado_ornamental: 'legendary'
        };
        const rarity = t('inv_rarity_' + (currentFish.rarity || rarityMap[currentFish.fishId] || 'common'));
        const habitat = t('inv_habitat_' + (def?.habitat || 'freshwater'));
        feedback(t('inv_examine_fish', t(currentFish.nameKey) || currentFish.fishId, rarity, habitat), true);
      });

      li.querySelector('.btn-inv-protect').addEventListener('click', event => {
        Inventory.toggleProtect(event.currentTarget.dataset.itemId);
        rerender();
      });

      li.querySelector('.btn-inv-discard').addEventListener('click', event => {
        const id = event.currentTarget.dataset.itemId;
        const name = event.currentTarget.dataset.itemName;
        if (confirm(t('inv_confirm_discard') ? (typeof t('inv_confirm_discard') === 'function'
          ? t('inv_confirm_discard', name) : t('inv_confirm_discard')) : `Descartar ${name}?`)) {
          Inventory.removeItem(id);
          rerender();
        }
      });

      fishList.appendChild(li);
    });
  }

  return { render };
})();
