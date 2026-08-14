/* visuals.js — Bites & Baits
 * Camada visual independente dos atributos e da lógica do jogo.
 * Os SVGs são decorativos: nomes, descrições e estados continuam no HTML.
 */
const Visuals = (() => {
  const files = {
    gear: 'assets/art/gear-symbols.svg?v=c303350',
    boat: 'assets/art/boat-symbols.svg?v=6deb4aa',
  };

  function fileFor(sprite) {
    return String(sprite || '').startsWith('boat-') ? files.boat : files.gear;
  }

  function iconMarkup(sprite, className = 'bb-svg-icon', label = '') {
    if (!sprite) return '';
    const safeClass = String(className).replace(/[^a-zA-Z0-9 _-]/g, '');
    const safeLabel = String(label).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
    const a11y = safeLabel ? ` role="img" aria-label="${safeLabel}"` : ' aria-hidden="true"';
    return `<svg class="${safeClass}" viewBox="0 0 96 96" focusable="false"${a11y}><use href="${fileFor(sprite)}#${sprite}"></use></svg>`;
  }

  function boatMarkup(sprite, className = 'bb-boat-icon') {
    if (!sprite) return '';
    const safeClass = String(className).replace(/[^a-zA-Z0-9 _-]/g, '');
    return `<svg class="${safeClass}" viewBox="0 0 240 120" focusable="false" aria-hidden="true"><use href="${files.boat}#${sprite}"></use></svg>`;
  }

  return { iconMarkup, boatMarkup };
})();
