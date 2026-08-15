/** house-view.js — presentation and actions for the house screen. */
const HouseView = (() => {
  const $ = id => document.getElementById(id);

  function render({ translate, getHouseLevel, getNextHouseLevel, getLevel, getNextLevel, coins, getOwnedEquip, spendCoins, upgradeHouse, rerender }) {
    const t = translate;
    const levelIdx = getLevel();
    const current = getHouseLevel(levelIdx);
    const next = getNextHouseLevel(levelIdx);
    const currentCoins = coins();
    const currentCard = $('house-current-card');
    const upgradeCard = $('house-upgrade-card');
    const upgradeSec = $('house-upgrade-section');
    const maxedMsg = $('house-maxed-msg');
    const ownedBoats = getOwnedEquip();
    const storedDesc = current.boatTypes.length === 0
      ? t('house_storage_none') || 'Sem armazenamento para barcos'
      : `${t('house_storage_boats') || 'Barcos guardados'}: ${current.boatSlots === 99
          ? t('house_storage_unlimited') || 'Ilimitado'
          : current.boatSlots} · ${current.boatTypes.map(type => t('boat_cat_' + type) || type).join(', ')}`;

    currentCard.innerHTML =
      `<div class="house-card-info">
         <span class="house-card-icon">${current.emoji}</span>
         <div>
           <span class="house-card-name">${t(current.nameKey) || current.id}</span>
           <span class="house-card-desc">${t(current.descKey) || ''}</span>
           <span class="house-card-storage">${storedDesc}</span>
         </div>
       </div>`;

    if (next) {
      maxedMsg.hidden = true;
      upgradeSec.hidden = false;
      const canAfford = currentCoins >= next.price;
      const nextStorage = next.boatTypes.length === 0
        ? t('house_storage_none') || 'Sem armazenamento'
        : `${t('house_storage_boats') || 'Barcos'}: ${next.boatSlots === 99
            ? t('house_storage_unlimited') || 'Ilimitado'
            : next.boatSlots} · ${next.boatTypes.map(type => t('boat_cat_' + type) || type).join(', ')}`;
      upgradeCard.innerHTML =
        `<div class="house-card-info">
           <span class="house-card-icon">${next.emoji}</span>
           <div>
             <span class="house-card-name">${t(next.nameKey) || next.id}</span>
             <span class="house-card-desc">${t(next.descKey) || ''}</span>
             <span class="house-card-storage">${nextStorage}</span>
             <span class="house-card-price">${next.price} 🪙</span>
           </div>
         </div>
         <button id="btn-house-upgrade" class="btn-primary"
                 ${canAfford ? '' : 'disabled'}
                 aria-label="${t('house_btn_upgrade') || 'Melhorar'} — ${t(next.nameKey) || next.id}">
           ${canAfford
             ? (t('house_btn_upgrade') || 'Melhorar')
             : (t('vessel_no_coins') || 'Moedas insuficientes')}
         </button>`;
      $('btn-house-upgrade').onclick = () => {
        if (!spendCoins(next.price)) return;
        upgradeHouse();
        rerender();
      };
    } else {
      upgradeSec.hidden = true;
      maxedMsg.hidden = false;
    }
  }

  return { render };
})();
