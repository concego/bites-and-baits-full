/** travel-view.js — presentation and actions for travel destinations. */
const TravelView = (() => {
  const $ = id => document.getElementById(id);
  function render({ translate, getActiveMap, ownedEquip, equipped, maps, vesselCatalog, hasMapBoatAccess, mapBoatId, mapAllowedBoats, mapBoatLabel, speak, startGame, setActiveMap, showScreen, calcBoatFee, getActiveBoat, setActiveBoat, coins, spendCoins, refreshHubHUD }) {
    const t = translate;
    if (typeof refreshHubHUD === 'function') refreshHubHUD();
    const map = getActiveMap();
    const nameEl = $('travel-current-name');
    const emojiEl = $('travel-current-emoji');
    if (nameEl) nameEl.textContent = t(map.nameKey) || map.id;
    if (emojiEl) emojiEl.textContent = map.emoji || '🏞️';
    const list = $('travel-dest-list');
    if (!list) return;
    list.innerHTML = '';
    const owned = ownedEquip();
    const equip = equipped();
    maps.forEach(m => {
      const isActive = m.id === map.id;
      const hasBoat = hasMapBoatAccess(m, owned);
      const hasRod = (function() {
        if (!m?.requiredRod) return true;
        const required = SHOP_CATALOG.find(item => item.id === m.requiredRod);
        const equippedRod = SHOP_CATALOG.find(item => item.id === equip?.rod);
        return !!required && !!equippedRod && (equippedRod.tier || 0) >= (required.tier || 0);
      })();
      const li = document.createElement('li');
      li.className = 'travel-item' + (isActive ? ' travel-item--active' : '');
      const travelBoatId = mapBoatId(m, owned) || mapAllowedBoats(m)[0] || null;
      const travelBoat = travelBoatId ? vesselCatalog.find(v => v.id === travelBoatId) : null;
      let actionsHtml;
      if (isActive && !hasBoat) {
        const lockMsg = `🚣 ${t('travel_need_boat') || 'Precisa de barco'}: ${mapBoatLabel(m)}`;
        actionsHtml = `<span class="travel-locked" aria-label="${lockMsg}">${lockMsg}</span>`;
      } else if (isActive && !hasRod) {
        const isRiver = ['margem_rio_doce', 'rio_doce'].includes(m.id);
        const lockMsg = `🎋 ${isRiver ? t('river_need_zeca') : t('travel_need_rod')}`;
        actionsHtml = `<span class="travel-locked" aria-label="${lockMsg}">${lockMsg}</span>`;
      } else if (isActive) {
        actionsHtml = `<button class="btn-primary btn-sm travel-btn-fish" data-map-id="${m.id}" aria-label="${t('travel_fish_here')} — ${t(m.nameKey) || m.id}">${t('travel_fish_here')}</button>`;
      } else if (hasBoat) {
        actionsHtml = `<button class="btn-secondary btn-sm travel-btn-go" data-map-id="${m.id}" aria-label="${t('travel_go_to') || 'Ir para'} ${t(m.nameKey) || m.id}">🗺️ ${t('travel_go') || 'Ir'}</button>`;
      } else {
        const lockMsg = mapAllowedBoats(m).length ? `🚣 ${t('travel_need_boat') || 'Precisa de barco'}: ${mapBoatLabel(m)}` : t('travel_locked') || '🔒';
        actionsHtml = `<span class="travel-locked" aria-label="${lockMsg}">${lockMsg}</span>`;
      }
      li.innerHTML = `<span class="travel-item-emoji" aria-hidden="true">${m.emoji || '🏞️'}</span><div class="travel-item-info"><span class="travel-item-name">${t(m.nameKey) || m.id}</span>${travelBoat?.sprite ? Visuals.boatMarkup(travelBoat.sprite, 'travel-item-vessel-svg') : ''}</div><div class="travel-item-actions">${actionsHtml}</div>`;
      li.querySelector('.travel-btn-fish')?.addEventListener('click', () => startGame('normal'));
      li.querySelector('.travel-btn-go')?.addEventListener('click', e => {
        const destId = e.currentTarget.dataset.mapId;
        const destMap = MAP_CATALOG[destId];
        const boatId = mapBoatId(destMap, owned);
        if (mapAllowedBoats(destMap).length && !boatId) {
          speak(`${t('travel_need_boat') || 'Precisa de barco'}: ${mapBoatLabel(destMap)}`);
          return;
        }
        if (boatId && boatId !== getActiveBoat()) setActiveBoat(boatId);
        const fee = calcBoatFee(boatId);
        if (fee > 0) {
          if (coins() < fee) {
            speak(`${t('vessel_no_coins') || 'Moedas insuficientes'} — ${t('house_dock_fee') || 'Taxa'}: ${fee} 🪙`);
            return;
          }
          spendCoins(fee);
          speak(`${t('house_fee_paid') || 'Taxa paga'}: ${fee} 🪙`);
        }
        setActiveMap(destId);
        showScreen('game');
        startGame('normal');
      });
      list.appendChild(li);
    });
  }
  return { render };
})();
