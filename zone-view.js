/** zone-view.js — presentation and actions for the fishing-zone modal. */
const ZoneView = (() => {
  const $ = id => document.getElementById(id);
  function open({ activeMap, activeZone, getKnownZones, setActiveZone, getSound, playTransition, initAudio, startAmbient, ambientProfileKey, close, updateHud }) {
    const modal = $('zone-modal');
    const list = $('zone-modal-list');
    if (!modal || !list) return;
    const map = activeMap();
    if (!map || !map.zones) return;
    list.innerHTML = '';
    const known = getKnownZones(map.id);
    map.zones.forEach(zone => {
      if (zone.hidden && !known.includes(zone.id)) return;
      if (!known.includes(zone.id)) return;
      const isCurrent = zone.id === activeZone();
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      const btn = document.createElement('button');
      btn.className = 'btn-zone-select' + (isCurrent ? ' btn-zone-select--active' : '');
      btn.setAttribute('aria-pressed', String(isCurrent));
      if (isCurrent) btn.setAttribute('disabled', '');
      btn.innerHTML = `<span aria-hidden="true">${zone.emoji || '🎣'}</span> ${I18n.t(zone.nameKey) || zone.id}`;
      btn.addEventListener('click', () => {
        setActiveZone(zone.id);
        if (getSound()) {
          playTransition();
          initAudio().then(() => startAmbient(ambientProfileKey())).catch(() => {});
        }
        close();
        const ann = $('announcer');
        if (ann) ann.textContent = (I18n.t('zone_changed') || 'Zona alterada para') + ': ' + (I18n.t(zone.nameKey) || zone.id);
        updateHud();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    modal.classList.remove('hidden');
    modal.removeAttribute('inert');
    list.querySelector('button:not([disabled])')?.focus();
  }
  return { open };
})();
