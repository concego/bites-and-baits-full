/** vessel-view.js — presentation and actions for the shipyard screen. */
const VesselView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, ownedEquip, activeBoat, coins, vessels, getVessel, spendCoins, addEquip, getActiveBoat, setActiveBoat, refreshHubHUD, rerender }) {
    const t = translate;
    const owned = ownedEquip();
    const active = activeBoat();
    const currentCoins = coins();
    const buyList = $('vessel-buy-list');
    const ownedList = $('vessel-owned-list');
    const ownedSec = $('vessel-owned-section');
    buyList.innerHTML = '';
    ownedList.innerHTML = '';
    const toBuy = vessels.filter(v => !owned.includes(v.id));
    const toShow = vessels.filter(v => owned.includes(v.id));

    toBuy.forEach(v => {
      const canAfford = currentCoins >= v.price;
      const li = document.createElement('li');
      li.className = 'vessel-card';
      li.setAttribute('role', 'listitem');
      li.innerHTML =
        `<div class="vessel-card-info">
           <span class="vessel-card-visual" aria-hidden="true">${Visuals.boatMarkup(v.sprite)}</span>
           <span class="vessel-card-name">${t('boat_' + v.id) || v.id}</span>
           <span class="vessel-card-desc">${t(v.descKey) || ''}</span>
           <span class="vessel-card-price">${v.price} 🪙 · Porão: ${v.holdCap} peixes</span>
         </div>
         <div class="vessel-card-actions">
           <button class="btn-primary btn-buy-vessel"
                   data-vessel-id="${v.id}"
                   ${canAfford ? '' : 'disabled'}
                   aria-label="${t('vessel_btn_buy') || 'Comprar'} ${t('boat_' + v.id) || v.id}">
             ${canAfford ? t('vessel_btn_buy') || 'Comprar' : t('vessel_no_coins') || 'Sem moedas'}
           </button>
         </div>`;
      buyList.appendChild(li);
    });
    if (toBuy.length === 0) {
      const li = document.createElement('li');
      li.textContent = t('vessel_owned_title') || '';
      buyList.appendChild(li);
    }

    if (toShow.length > 0) {
      ownedSec.hidden = false;
      toShow.forEach(v => {
        const isActive = v.id === active;
        const li = document.createElement('li');
        li.className = 'vessel-card';
        li.setAttribute('role', 'listitem');
        li.innerHTML =
          `<div class="vessel-card-info">
             <span class="vessel-card-visual" aria-hidden="true">${Visuals.boatMarkup(v.sprite)}</span>
             <span class="vessel-card-name">${t('boat_' + v.id) || v.id}</span>
             <span class="vessel-card-desc">${t(v.descKey) || ''}</span>
             <span class="vessel-card-price">Porão: ${v.holdCap} peixes</span>
           </div>
           <div class="vessel-card-actions">
             ${isActive
               ? `<span class="vessel-equipped-badge">${t('vessel_equipped_label') || '✅ Em uso'}</span>`
               : `<button class="btn-secondary btn-equip-vessel"
                          data-vessel-id="${v.id}"
                          aria-label="${t('vessel_equip') || 'Usar'} ${t('boat_' + v.id) || v.id}">
                    ${t('vessel_equip') || 'Usar este barco'}
                  </button>`}
           </div>`;
        ownedList.appendChild(li);
      });
    } else {
      ownedSec.hidden = true;
    }

    buyList.onclick = e => {
      const btn = e.target.closest('.btn-buy-vessel');
      if (!btn || btn.disabled) return;
      const vid = btn.dataset.vesselId;
      const v = getVessel(vid);
      if (!v) return;
      if (!spendCoins(v.price)) return;
      addEquip(v.id);
      if (!getActiveBoat()) setActiveBoat(v.id);
      rerender();
      if (typeof refreshHubHUD === 'function') refreshHubHUD();
    };
    ownedList.onclick = e => {
      const btn = e.target.closest('.btn-equip-vessel');
      if (!btn) return;
      setActiveBoat(btn.dataset.vesselId);
      rerender();
    };
  }

  return { render };
})();
