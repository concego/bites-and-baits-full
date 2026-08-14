/* character-avatar.js — Bites & Baits
 * Avatar SVG modular, local e complementar ao texto acessível.
 * Não usa CDN, não cria áudio e não participa do gameplay.
 */
const CharacterAvatar = (() => {
  const SKIN = ['#f6d2b8', '#eab18b', '#c9855b', '#8f573b', '#593323'];
  const EYES = ['#3b2418', '#8a572f', '#3f7844', '#3b78b5', '#70757a'];
  const HAIR = ['#17120f', '#3a2117', '#8a5634', '#d8b26b', '#9b3f2e'];
  const CLOTHES = {
    feminine: ['#e9a6bd', '#c8759c', '#d99b72', '#9b7ac4', '#d46f83'],
    masculine: ['#4b83a8', '#315d78', '#6a8c62', '#8b6b4e', '#45536f'],
    neutral: ['#6f8fa3', '#6e7f70', '#89779d', '#718b8e', '#7c765f'],
  };
  const BOOTS = { feminine: '#65433b', masculine: '#3d3029', neutral: '#51483f' };

  function _index(value) {
    const match = String(value || '').match(/-(\d+)$/);
    const index = match ? Number(match[1]) : 1;
    return Math.max(1, Math.min(5, Number.isFinite(index) ? index : 1));
  }

  function _pathForHair(style, profile, color) {
    const index = _index(style);
    if (index === 5 && profile !== 'feminine') return `<path d="M24 28 Q40 12 56 28 L55 39 Q40 31 25 39Z" fill="${color}"/>`;
    if (index === 4 && profile === 'feminine') return `<path d="M20 34 Q19 11 40 10 Q61 11 60 34 L55 60 Q49 44 40 42 Q31 44 25 60Z" fill="${color}"/>`;
    if (index === 3) return `<path d="M21 34 Q22 11 40 11 Q58 11 59 34 L54 48 Q51 27 40 27 Q29 27 26 48Z" fill="${color}"/>`;
    if (index === 2) return `<path d="M22 34 Q23 12 40 12 Q57 12 58 34 Q51 25 40 25 Q29 25 22 34Z" fill="${color}"/>`;
    return `<path d="M23 34 Q24 12 40 12 Q56 12 57 34 Q49 27 40 27 Q31 27 23 34Z" fill="${color}"/>`;
  }

  function _bodyPath(profile, bodyIndex, clothes) {
    const widths = profile === 'feminine'
      ? [15, 17, 19, 23, 21]
      : profile === 'masculine'
        ? [18, 17, 20, 24, 25]
        : [17, 17, 20, 22, 21];
    const width = widths[Math.max(0, bodyIndex - 1)];
    return `<path d="M40 48 C${40 - width} 48 ${40 - width - 2} 66 ${40 - width + 1} 76 L${40 + width - 1} 76 C${40 + width + 2} 66 ${40 + width} 48 40 48Z" fill="${clothes}"/>`;
  }

  function _facialHair(profile, facialHair, skin) {
    const index = _index(facialHair);
    if (profile === 'feminine' && index === 1) return '<path d="M30 49 Q40 53 50 49 Q48 55 40 56 Q32 55 30 49Z" fill="#d9a27f" opacity=".35"/>';
    if (profile === 'feminine') return '';
    if (index === 1) return '';
    if (index === 2 || index === 3) return '<path d="M29 49 Q40 55 51 49 L49 58 Q40 63 31 58Z" fill="#3b2418" opacity=".9"/>';
    if (index === 4) return '<path d="M28 48 Q40 55 52 48 L50 64 Q40 70 30 64Z" fill="#3b2418" opacity=".92"/>';
    return '<path d="M34 51 Q40 55 46 51 L45 63 L40 67 L35 63Z" fill="#3b2418" opacity=".9"/>';
  }

  function render(target, character) {
    if (!target) return;
    const current = character || {};
    const profile = ['feminine', 'masculine', 'neutral'].includes(current.genderProfile) ? current.genderProfile : 'neutral';
    const appearance = current.appearance || {};
    const skin = SKIN[_index(appearance.skinTone) - 1];
    const eye = EYES[_index(appearance.eyeColor) - 1];
    const hair = HAIR[_index(appearance.hairColor) - 1];
    const clothes = CLOTHES[profile][_index(appearance.arrivalOutfit) - 1];
    const boot = BOOTS[profile];
    const faceIndex = _index(appearance.faceShape);
    const faceRx = faceIndex === 3 ? 17 : faceIndex === 4 ? 14 : faceIndex === 5 ? 16 : 18;
    const faceRy = faceIndex === 4 ? 22 : 20;
    const eyeDetails = _index(appearance.eyeDetails);
    const eyeY = eyeDetails === 5 ? 39 : 37;
    const heightScale = 0.9 + (_index(appearance.height) - 1) * 0.04;
    const body = _bodyPath(profile, _index(appearance.bodyShape), clothes);
    const hairMarkup = _pathForHair(appearance.hairStyle, profile, hair);
    const facialHair = _facialHair(profile, appearance.facialHair, skin);
    const headCovering = _index(appearance.headCovering);
    const covering = headCovering === 2 ? '<path d="M20 29 Q40 8 60 29 L58 34 Q40 26 22 34Z" fill="#2e5f7d"/>'
      : headCovering === 3 ? '<path d="M18 29 Q40 5 62 29 L57 33 Q40 26 23 33Z" fill="#8b6b4e"/>'
        : headCovering === 4 ? '<path d="M23 26 Q40 10 57 26 L55 40 Q40 34 25 40Z" fill="#75658c"/>'
          : headCovering === 5 ? '<path d="M23 28 Q40 10 57 28 L55 39 Q40 33 25 39Z" fill="#c27f58"/>' : '';
    const accessory = _index(appearance.accessories) === 2 ? '<path d="M27 37h9m8 0h9M36 37h8" stroke="#262626" stroke-width="2" fill="none"/>'
      : _index(appearance.accessories) >= 3 ? '<circle cx="48" cy="56" r="3" fill="#f0c85a"/>' : '';
    const eyeShape = eyeDetails === 2 ? '1.4' : eyeDetails === 4 ? '2.2' : '1.8';

    target.innerHTML = `<svg class="character-avatar-svg" viewBox="0 0 80 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g transform="translate(40 0) scale(${heightScale}) translate(-40 0)">
        <ellipse cx="40" cy="94" rx="22" ry="4" fill="#000" opacity=".18"/>
        <path d="M32 74 L31 91 L38 91 L40 75 L42 91 L49 91 L48 74Z" fill="#4c5964"/>
        <path d="M28 89h12v5H27Q25 92 28 89Zm12 0h12q3 3 1 5H40Z" fill="${boot}"/>
        ${body}
        <path d="M24 55 Q18 59 22 68 M56 55 Q62 59 58 68" stroke="${skin}" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="40" cy="31" rx="${faceRx}" ry="${faceRy}" fill="${skin}"/>
        ${hairMarkup}
        <ellipse cx="32" cy="${eyeY}" rx="${eyeShape}" ry="2.2" fill="${eye}"/>
        <ellipse cx="48" cy="${eyeY}" rx="${eyeShape}" ry="2.2" fill="${eye}"/>
        <path d="M35 48 Q40 51 45 48" stroke="#633d32" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        ${facialHair}
        ${covering}
        ${accessory}
      </g>
    </svg>`;
  }

  return { render };
})();
