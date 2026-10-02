/** clothing-stock.js — daily color rotation for Marta's shop. */
const ClothingStock = (() => {
  function daySerial(date) {
    const safe = date || (typeof GameTime !== 'undefined' ? GameTime.load() : null) || {};
    const year = Math.max(1, Number(safe.year) || 1);
    const month = Math.max(1, Math.min(12, Number(safe.month) || 1));
    const day = Math.max(1, Math.min(30, Number(safe.day) || 1));
    return (year - 1) * 360 + (month - 1) * 30 + day - 1;
  }

  function _styleOffset(styleId, count) {
    let hash = 0;
    for (let i = 0; i < styleId.length; i++) hash = (hash * 31 + styleId.charCodeAt(i)) >>> 0;
    return count ? hash % count : 0;
  }

  /** One color per clothing model is offered on a given in-game day. */
  function getAvailableItems(mode, date) {
    const dailyItems = CLOTHING_CATALOG.filter(item => !item.giftOnly && item.modes.includes(mode));
    const groups = new Map();
    dailyItems.forEach(item => {
      const key = item.styleId || item.id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    const serial = daySerial(date);
    const availableIds = new Set();
    groups.forEach((items, styleId) => {
      const ordered = items.slice().sort((a, b) => a.id.localeCompare(b.id));
      const index = (serial + _styleOffset(styleId, ordered.length)) % ordered.length;
      availableIds.add(ordered[index].id);
    });
    return dailyItems.filter(item => availableIds.has(item.id));
  }

  return { getAvailableItems, daySerial };
})();
