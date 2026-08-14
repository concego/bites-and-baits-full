/**
 * fishing-hud-view.js — Bites & Baits
 *
 * Atualiza os indicadores visuais da cena de pesca e os números do HUD,
 * sem assumir o estado interno do Game.
 */

const FishingHudView = (() => {
  const $ = id => document.getElementById(id);

  function renderGearVisuals() {
    const equip = Inventory.getEquip();
    const rod = getShopItem(equip.rod);
    const bait = BAIT_CATALOG[equip.bait];
    const rodEl = $('rod');
    const lureEl = $('lure');

    if (rodEl) {
      rodEl.innerHTML = rod?.sprite
        ? Visuals.iconMarkup(rod.sprite, 'rod-scene-svg') : '';
    }
    if (lureEl) {
      lureEl.innerHTML = bait?.sprite
        ? Visuals.iconMarkup(bait.sprite, 'lure-svg') : '';
      lureEl.classList.toggle('lure-svg-active', !!bait?.sprite);
    }
  }

  function refreshBait({ mode }) {
    renderGearVisuals();
    if (mode !== 'normal') return;

    const equip = Inventory.getEquip();
    const baitId = equip.bait;
    const bait = BAIT_CATALOG[baitId];
    const qty = Inventory.baitCount(baitId);
    const emojiEl = $('bait-active-emoji');
    const nameEl = $('bait-active-name');
    const qtyEl = $('bait-active-qty');

    if (emojiEl) emojiEl.innerHTML = bait
      ? Visuals.iconMarkup(bait.sprite, 'bb-svg-icon bb-svg-icon--hud') : '?';
    if (nameEl) nameEl.textContent = bait ? I18n.t(bait.nameKey) : baitId;
    if (qtyEl) qtyEl.textContent = `×${qty}`;
  }

  function refreshHold({ mode, getCapacityBoat, getContainerName }) {
    if (mode !== 'normal') return;

    const used = Inventory.holdUsed();
    const boat = getCapacityBoat();
    const capacity = Inventory.holdCapacity(boat);
    const containerName = getContainerName(boat);
    const indicator = $('hold-indicator');

    const countEl = $('hold-active-count');
    if (countEl) countEl.textContent = `${used}/${capacity}`;
    if (indicator) {
      indicator.classList.toggle('hold-full', used >= capacity);
      indicator.setAttribute('aria-label',
        `${I18n.t('hold_title') || 'Carga'}: ${used} de ${capacity} peixes. ${containerName}.`);
    }
  }

  return { renderGearVisuals, refreshBait, refreshHold };
})();
