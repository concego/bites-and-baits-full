/** shop-buy-view.js — presentation and actions for the shop buy panel. */
const ShopBuyView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, getEquip, getOwnedEquip, coins, catalog, defaults, handleBuy, equipItem, rerender }) {
    const t = translate;
    const typeToTab = { bait:'baits', basket:'baskets', rod:'rods', line:'lines', hook:'hooks', float:'floats' };
    const equip = getEquip();
    const ownedEquip = getOwnedEquip();
    Object.values(typeToTab).forEach(tab => {
      const el = $('buy-tab-' + tab);
      if (el) el.innerHTML = '';
    });
    catalog.forEach(item => {
      const tab = typeToTab[item.type];
      if (!tab) return;
      const container = $('buy-tab-' + tab);
      if (!container) return;
      const isBait = item.type === 'bait';
      const equipped = !isBait && Object.values(equip).includes(item.id);
      const owned = !isBait && (ownedEquip.includes(item.id) || defaults.includes(item.id));
      const unitPrice = isBait ? Math.round(item.price / (item.qty || 1)) : item.price;
      const canAfford = coins() >= item.price;
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.setAttribute('role', 'article');
      const tierBadge = item.tier ? '<span class="shop-tier-badge">' + t('shop_tier', item.tier) + '</span>' : '';
      let actionArea = '';
      if (!isBait && equipped) {
        actionArea = '<div class="shop-card-buy-row">' + '<button class="btn-equipped" disabled>' + t('shop_equipped') + '</button>' + '</div>';
      } else if (!isBait && owned) {
        actionArea = '<div class="shop-card-buy-row">' + '<button class="btn-shop-equip btn-secondary"' + ' data-item-id="' + item.id + '" data-item-type="' + item.type + '">' + t('shop_equip') + '</button>' + '</div>';
      } else {
        const unitLabel = isBait ? t('shop_buy_unit_price', unitPrice) : t('shop_price', item.price);
        const qtyBlock = isBait
          ? '<label class="shop-qty-label"><span>' + t('shop_buy_qty_label') + '</span>' +
            '<input class="shop-qty-input" type="number" min="1" max="99" value="1"' +
            ' data-item-id="' + item.id + '"' +
            ' aria-label="Quantidade de ' + (t(item.nameKey) || item.id) + '">' +
            '</label><div class="shop-total-preview">' + t('shop_buy_total_price', 1, unitPrice, unitPrice) + '</div>'
          : '';
        actionArea = '<div class="shop-card-buy-row">' + '<span class="shop-unit-price">' + unitLabel + '</span>' + qtyBlock + '<button class="btn-shop-buy btn-primary"' + ' data-item-id="' + item.id + '" data-item-type="' + item.type + '"' + ' data-unit-price="' + unitPrice + '" data-pack-qty="' + (item.qty || 1) + '"' + (canAfford ? '' : ' disabled') + '>' + t('shop_buy') + (!isBait ? ' · ' + t('shop_price', item.price) : '') + '</button></div>';
      }
      card.innerHTML = '<div class="shop-card-header">' + '<span class="shop-item-visual" aria-hidden="true">' + (item.sprite ? Visuals.iconMarkup(item.sprite, 'bb-svg-icon bb-svg-icon--shop') : item.emoji) + '</span>' + '<div class="shop-item-meta">' + '<span class="shop-item-name">' + (t(item.nameKey) || item.id) + ' ' + tierBadge + '</span>' + '<span class="shop-item-desc">' + (t(item.descKey) || '') + '</span>' + '</div></div>' + actionArea;
      const qtyInput = card.querySelector('.shop-qty-input');
      if (qtyInput) {
        qtyInput.addEventListener('input', function() {
          const qty = Math.max(1, parseInt(this.value) || 1);
          const total = qty * unitPrice;
          const prev = card.querySelector('.shop-total-preview');
          if (prev) prev.textContent = t('shop_buy_total_price', qty, unitPrice, total);
          const btn = card.querySelector('.btn-shop-buy');
          if (btn) btn.disabled = coins() < total;
        });
      }
      const buyBtn = card.querySelector('.btn-shop-buy');
      if (buyBtn) {
        buyBtn.addEventListener('click', function() {
          const input = card.querySelector('.shop-qty-input');
          const userQty = input ? (parseInt(input.value) || 1) : 1;
          handleBuy(item.id, item.type, userQty, item.qty || 1, unitPrice, $('shop-feedback'));
        });
      }
      const equipBtn = card.querySelector('.btn-shop-equip');
      if (equipBtn) equipBtn.addEventListener('click', function() {
        equipItem(this.dataset.itemId, this.dataset.itemType);
        rerender();
      });
      container.appendChild(card);
    });
  }

  return { render };
})();
