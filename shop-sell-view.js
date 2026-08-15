/** shop-sell-view.js — presentation and actions for the shop sell panel. */
const ShopSellView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, getInventory, isProtected, getBaits, getEquip, getOwnedEquip, catalog, baitCatalog, defaults, sellAll, sellFishQty, sellBaits, sellEquip, coins, feedback }) {
    const t = translate;
    const fbEl = $('shop-feedback');
    const equip = getEquip();
    const owned = getOwnedEquip();
    const fishes = getInventory().filter(fish => !isProtected(fish.id));
    const fishList = $('sell-fish-list');
    const fishEmpty = $('sell-fish-empty');
    fishList.innerHTML = '';
    if (fishes.length === 0) {
      fishEmpty.classList.remove('hidden');
    } else {
      fishEmpty.classList.add('hidden');
      const sellAllBtn = document.createElement('button');
      sellAllBtn.className = 'btn-primary shop-sell-all-btn';
      sellAllBtn.textContent = t('shop_sell_all_fish');
      sellAllBtn.addEventListener('click', function() {
        const res = sellAll();
        if (res.ok) {
          $('shop-coins').textContent = coins();
          feedback(fbEl, t('shop_sold', t('inv_tab_fish'), res.count, res.earned), true);
          render({ translate, getInventory, isProtected, getBaits, getEquip, getOwnedEquip, catalog, baitCatalog, defaults, sellAll, sellFishQty, sellBaits, sellEquip, coins, feedback });
        }
      });
      fishList.appendChild(sellAllBtn);
      const bySpecies = {};
      fishes.forEach(function(fish) {
        if (!bySpecies[fish.fishId]) bySpecies[fish.fishId] = { nameKey: fish.nameKey, items: [] };
        bySpecies[fish.fishId].items.push(fish);
      });
      Object.values(bySpecies).forEach(function(group) {
        const fishName = t(group.nameKey) || group.nameKey;
        const count = group.items.length;
        const avgValue = Math.round(group.items.reduce(function(s, i) { return s + i.value; }, 0) / count);
        const li = document.createElement('li');
        li.className = 'inv-item';
        li.innerHTML = '<div class="inv-item-info">' + '<span class="inv-item-name">' + fishName + '</span>' + '<span class="inv-item-detail">' + t('shop_sell_in_stock', count) + ' · ' + t('shop_sell_unit', avgValue) + '</span>' + '</div>' + '<div class="inv-item-actions sell-row">' + '<label class="shop-qty-label"><span>' + t('shop_sell_qty_label') + '</span>' + '<input class="shop-qty-input" type="number" min="1" max="' + count + '" value="1" aria-label="Qtd de ' + fishName + ' para vender"></label>' + '<div class="shop-total-preview">' + t('shop_sell_total_fish', 1, avgValue, avgValue) + '</div>' + '<button class="btn-sell-fish-qty btn-secondary">' + t('shop_sell_confirm') + '</button>' + '</div>';
        const input = li.querySelector('.shop-qty-input');
        const preview = li.querySelector('.shop-total-preview');
        const sellBtn = li.querySelector('.btn-sell-fish-qty');
        function calcTotal(n) { return group.items.slice(0, n).reduce(function(s, i) { return s + i.value; }, 0); }
        input.addEventListener('input', function() {
          const n = Math.min(Math.max(1, parseInt(this.value) || 1), count);
          const total = calcTotal(n);
          preview.textContent = t('shop_sell_total_fish', n, avgValue, total);
        });
        sellBtn.addEventListener('click', function() {
          const n = Math.min(Math.max(1, parseInt(input.value) || 1), count);
          const res = sellFishQty(group.items[0].fishId, n);
          if (res.ok) {
            $('shop-coins').textContent = coins();
            feedback(fbEl, t('shop_sold', fishName, res.sold, res.earned), true);
            render({ translate, getInventory, isProtected, getBaits, getEquip, getOwnedEquip, catalog, baitCatalog, defaults, sellAll, sellFishQty, sellBaits, sellEquip, coins, feedback });
          }
        });
        fishList.appendChild(li);
      });
    }
    const baits = getBaits();
    const baitList = $('sell-baits-list');
    const baitEmpty = $('sell-baits-empty');
    baitList.innerHTML = '';
    const baitEntries = Object.entries(baits).filter(function(e) { return e[1] > 0; });
    if (baitEntries.length === 0) {
      baitEmpty.classList.remove('hidden');
    } else {
      baitEmpty.classList.add('hidden');
      baitEntries.forEach(function(entry) {
        const baitId = entry[0], qty = entry[1];
        const def = baitCatalog[baitId] || { emoji: '?', nameKey: baitId };
        const shopItem = catalog.find(function(i) { return i.type === 'bait' && i.id === baitId; });
        const unitSell = shopItem ? Math.max(1, Math.floor((shopItem.price / (shopItem.qty || 1)) * 0.5)) : 1;
        const baitName = t(def.nameKey) || baitId;
        const li = document.createElement('li'); li.className = 'inv-item';
        li.innerHTML = '<span class="inv-item-icon" aria-hidden="true">' + (def.sprite ? Visuals.iconMarkup(def.sprite, 'bb-svg-icon bb-svg-icon--small') : def.emoji) + '</span>' + '<div class="inv-item-info"><span class="inv-item-name">' + baitName + '</span><span class="inv-item-detail">' + t('shop_sell_in_stock', qty) + ' · ' + t('shop_sell_unit', unitSell) + '</span></div>' + '<div class="inv-item-actions sell-row"><label class="shop-qty-label"><span>' + t('shop_sell_qty_label') + '</span><input class="shop-qty-input" type="number" min="1" max="' + qty + '" value="1" aria-label="Qtd de ' + baitName + ' para vender"></label><div class="shop-total-preview">' + t('shop_sell_total_fish', 1, unitSell, unitSell) + '</div><button class="btn-sell-bait btn-secondary" data-bait-id="' + baitId + '" data-unit-sell="' + unitSell + '" data-max="' + qty + '">' + t('shop_sell_confirm') + '</button></div>';
        const input = li.querySelector('.shop-qty-input');
        const preview = li.querySelector('.shop-total-preview');
        const sellBtn = li.querySelector('.btn-sell-bait');
        input.addEventListener('input', function() {
          const n = Math.min(Math.max(1, parseInt(this.value) || 1), qty);
          preview.textContent = t('shop_sell_total_fish', n, unitSell, n * unitSell);
        });
        sellBtn.addEventListener('click', function() {
          const n = Math.min(parseInt(input.value) || 1, qty);
          const res = sellBaits(baitId, n);
          if (res.ok) {
            $('shop-coins').textContent = coins();
            feedback(fbEl, t('shop_sold', baitName, res.sold, res.earned), true);
            render({ translate, getInventory, isProtected, getBaits, getEquip, getOwnedEquip, catalog, baitCatalog, defaults, sellAll, sellFishQty, sellBaits, sellEquip, coins, feedback });
          }
        });
        baitList.appendChild(li);
      });
    }
    const equipList = $('sell-equip-list');
    const equipEmpty = $('sell-equip-empty');
    equipList.innerHTML = '';
    const sellable = owned.filter(function(id) { return !defaults.includes(id) && !Object.values(equip).includes(id) && !isProtected(id); });
    if (sellable.length === 0) {
      equipEmpty.classList.remove('hidden');
    } else {
      equipEmpty.classList.add('hidden');
      sellable.forEach(function(itemId) {
        const shopItem = catalog.find(function(i) { return i.id === itemId; });
        if (!shopItem) return;
        const sellPrice = Math.max(1, Math.floor(shopItem.price * 0.5));
        const equipName = t(shopItem.nameKey) || itemId;
        const li = document.createElement('li'); li.className = 'inv-item';
        li.innerHTML = '<span class="inv-item-icon" aria-hidden="true">' + (shopItem.sprite ? Visuals.iconMarkup(shopItem.sprite, 'bb-svg-icon bb-svg-icon--small') : shopItem.emoji) + '</span><div class="inv-item-info"><span class="inv-item-name">' + equipName + '</span><span class="inv-item-detail">' + t('shop_sell_unit', sellPrice) + '</span></div><div class="inv-item-actions"><button class="btn-sell-equip btn-secondary" data-item-id="' + itemId + '" data-sell-price="' + sellPrice + '">' + t('shop_sell_confirm') + ' · ' + sellPrice + ' 🪙</button></div>';
        li.querySelector('.btn-sell-equip').addEventListener('click', function() {
          const id = this.dataset.itemId;
          const val = parseInt(this.dataset.sellPrice);
          const res = sellEquip(id);
          if (res.ok) {
            $('shop-coins').textContent = coins();
            feedback(fbEl, t('shop_sold', equipName, 1, res.earned), true);
            render({ translate, getInventory, isProtected, getBaits, getEquip, getOwnedEquip, catalog, baitCatalog, defaults, sellAll, sellFishQty, sellBaits, sellEquip, coins, feedback });
          }
        });
        equipList.appendChild(li);
      });
    }
  }

  return { render };
})();
