/* character-avatar.js — Bites & Baits
 * Avatar SVG modular, local e complementar ao texto acessível.
 * Esta é a camada visual do produto: mais detalhes, volume e variações
 * sem depender de imagens externas, CDN, áudio ou gameplay.
 */
const CharacterAvatar = (() => {
  const SKIN = ['#f6d2b8', '#eab18b', '#c9855b', '#8f573b', '#593323'];
  const SKIN_SHADOW = ['#d99d7c', '#c9825e', '#9f5f40', '#673c2c', '#3b2118'];
  const EYES = ['#3b2418', '#8a572f', '#3f7844', '#3b78b5', '#70757a'];
  const HAIR = ['#17120f', '#3a2117', '#8a5634', '#d8b26b', '#9b3f2e'];
  const PANTS = { feminine: '#665773', masculine: '#3e5263', neutral: '#4d5f63' };
  const BOOTS = { feminine: '#65433b', masculine: '#3d3029', neutral: '#51483f' };
  const ARRIVAL = {
    feminine: ['#e9a6bd', '#c8759c', '#d99b72', '#9b7ac4', '#d46f83'],
    masculine: ['#4b83a8', '#315d78', '#6a8c62', '#8b6b4e', '#45536f'],
    neutral: ['#6f8fa3', '#6e7f70', '#89779d', '#718b8e', '#7c765f'],
  };
  const FISHING = {
    feminine: ['#b86d86', '#4d7890', '#6b8c67', '#4e6f86', '#7b654a'],
    masculine: ['#3d6f8b', '#5f755d', '#4c6c82', '#6f604f', '#385a68'],
    neutral: ['#5e7d86', '#657b67', '#596e82', '#746c58', '#526d67'],
  };

  function _index(value) {
    const match = String(value || '').match(/-(\d+)$/);
    const n = match ? Number(match[1]) : 1;
    return Math.max(1, Math.min(5, Number.isFinite(n) ? n : 1));
  }

  function _profileData(profile, bodyIndex) {
    const i = Math.max(1, Math.min(5, bodyIndex));
    const bodies = {
      feminine: [
        { shoulder: 23, waist: 16, hip: 23 }, { shoulder: 24, waist: 15, hip: 21 },
        { shoulder: 26, waist: 17, hip: 25 }, { shoulder: 27, waist: 16, hip: 29 },
        { shoulder: 29, waist: 20, hip: 28 },
      ],
      masculine: [
        { shoulder: 27, waist: 23, hip: 22 }, { shoulder: 26, waist: 20, hip: 20 },
        { shoulder: 29, waist: 23, hip: 24 }, { shoulder: 32, waist: 25, hip: 27 },
        { shoulder: 34, waist: 28, hip: 30 },
      ],
      neutral: [
        { shoulder: 25, waist: 19, hip: 22 }, { shoulder: 25, waist: 18, hip: 20 },
        { shoulder: 27, waist: 21, hip: 24 }, { shoulder: 29, waist: 21, hip: 26 },
        { shoulder: 30, waist: 24, hip: 27 },
      ],
    };
    return bodies[profile][i - 1];
  }

  function _torso(profile, bodyIndex, shirt, shirtDark, fishing) {
    const b = _profileData(profile, bodyIndex);
    const y = fishing ? 91 : 88;
    const hem = fishing ? 139 : 136;
    return `<path d="M70 ${y}
      C${70 - b.shoulder} ${y - 2} ${70 - b.shoulder - 3} ${y + 12} ${70 - b.waist} ${y + 25}
      L${70 - b.hip} ${hem} L${70 + b.hip} ${hem}
      L${70 + b.waist} ${y + 25}
      C${70 + b.shoulder + 3} ${y + 12} ${70 + b.shoulder} ${y - 2} 70 ${y}Z"
      fill="${shirt}" stroke="${shirtDark}" stroke-width="1.4"/>
      <path d="M${70 - b.waist} ${y + 25} L${70 - b.hip} ${hem} M${70 + b.waist} ${y + 25} L${70 + b.hip} ${hem}"
      stroke="${shirtDark}" stroke-width="1" opacity=".6"/>`;
  }

  function _shirtDetails(profile, bodyIndex, shirt, shirtDark, fishing, outfitIndex) {
    const b = _profileData(profile, bodyIndex);
    const y = fishing ? 91 : 88;
    if (!fishing) {
      return `<path d="M70 ${y + 8} L70 ${y + 48}" stroke="${shirtDark}" stroke-width="1.4" opacity=".6"/>
        <path d="M${70 - b.waist + 3} ${y + 35} Q70 ${y + 42} ${70 + b.waist - 3} ${y + 35}" stroke="${shirtDark}" fill="none" stroke-width="1"/>`;
    }
    const pocketX = 70 + (outfitIndex % 2 ? 9 : -25);
    return `<path d="M70 ${y + 5} L70 ${y + 47}" stroke="${shirtDark}" stroke-width="1.5"/>
      <path d="M${pocketX} ${y + 29} h16 v13 h-16z" fill="${shirtDark}" opacity=".5" stroke="${shirtDark}"/>
      <path d="M${70 - b.shoulder + 5} ${y + 11} Q70 ${y + 20} ${70 + b.shoulder - 5} ${y + 11}" stroke="#d9c28b" stroke-width="1.2" fill="none"/>
      <circle cx="70" cy="${y + 24}" r="1.6" fill="#e8d58f"/><circle cx="70" cy="${y + 34}" r="1.6" fill="#e8d58f"/>`;
  }

  function _hair(style, profile, color, shadow) {
    const i = _index(style);
    const back = i === 4 && profile === 'feminine'
      ? `<path d="M43 55 Q35 24 50 15 Q70 3 91 17 Q105 29 96 72 Q92 55 82 46 Q67 36 50 48Z" fill="${shadow}"/>`
      : `<path d="M45 52 Q40 24 55 16 Q71 7 88 17 Q101 27 96 54 Q88 38 70 37 Q53 38 45 52Z" fill="${shadow}"/>`;
    let front;
    if (i === 5 && profile !== 'feminine') front = `<path d="M48 39 Q51 12 70 12 Q89 12 94 39 Q85 31 70 31 Q56 31 48 39Z" fill="${color}"/>`;
    else if (i === 4 && profile === 'feminine') front = `<path d="M43 42 Q42 10 70 10 Q99 10 97 43 Q88 31 70 29 Q53 31 43 42Z" fill="${color}"/>`;
    else if (i === 3) front = `<path d="M45 40 Q45 11 70 11 Q95 11 96 40 Q87 28 70 28 Q53 28 45 40Z" fill="${color}"/>`;
    else front = `<path d="M47 39 Q47 12 70 12 Q93 12 94 39 Q85 28 70 27 Q55 28 47 39Z" fill="${color}"/>`;
    return `${back}${front}`;
  }

  function _headCover(index) {
    if (index === 2) return '<path d="M43 35 Q70 8 97 35 L94 42 Q70 32 46 42Z" fill="#2e5f7d" stroke="#23485e" stroke-width="1.5"/><path d="M83 34 Q100 34 105 39 Q93 43 82 41Z" fill="#23485e"/>';
    if (index === 3) return '<path d="M40 35 Q70 7 100 35 L94 41 Q70 32 46 41Z" fill="#8b6b4e" stroke="#624b38" stroke-width="1.5"/><path d="M42 36 Q70 29 98 36" stroke="#d8b17c" stroke-width="2"/>';
    if (index === 4) return '<path d="M46 28 Q70 9 94 28 L93 49 Q70 40 47 49Z" fill="#75658c"/><path d="M48 32 Q70 25 92 32" stroke="#a898c1" stroke-width="2"/>';
    if (index === 5) return '<path d="M46 30 Q70 11 94 30 L92 50 Q70 42 48 50Z" fill="#c27f58"/><path d="M50 29 Q70 23 90 29" stroke="#e4b083" stroke-width="2"/>';
    return '';
  }

  function _face(faceIndex, skin, shadow, eye, eyeY, eyeSize, expressive) {
    const rx = faceIndex === 3 ? 25 : faceIndex === 4 ? 21 : faceIndex === 5 ? 23 : 27;
    const ry = faceIndex === 4 ? 31 : 29;
    const browY = eyeY - 9;
    const mouth = expressive ? 'M62 67 Q70 73 78 67' : 'M63 69 Q70 71 77 69';
    return `<ellipse cx="70" cy="45" rx="${rx}" ry="${ry}" fill="${skin}" stroke="${shadow}" stroke-width="1.2"/>
      <path d="M${70 - rx + 1} 43 Q${70 - rx - 5} 47 ${70 - rx + 1} 53 M${70 + rx - 1} 43 Q${70 + rx + 5} 47 ${70 + rx - 1} 53" fill="${skin}" stroke="${shadow}" stroke-width="1"/>
      <path d="M55 ${browY} Q61 ${browY - 3} 66 ${browY}" stroke="${shadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M74 ${browY} Q80 ${browY - 3} 85 ${browY}" stroke="${shadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="61" cy="${eyeY}" rx="${eyeSize + 3}" ry="${eyeSize}" fill="#fff"/>
      <ellipse cx="79" cy="${eyeY}" rx="${eyeSize + 3}" ry="${eyeSize}" fill="#fff"/>
      <circle cx="61" cy="${eyeY}" r="${eyeSize - .2}" fill="${eye}"/><circle cx="79" cy="${eyeY}" r="${eyeSize - .2}" fill="${eye}"/>
      <circle cx="60.4" cy="${eyeY - .7}" r=".8" fill="#fff"/><circle cx="78.4" cy="${eyeY - .7}" r=".8" fill="#fff"/>
      <path d="M70 48 Q66 58 70 60 Q74 60 74 58" stroke="${shadow}" stroke-width="1.2" fill="none"/>
      <path d="${mouth}" stroke="#713f42" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  }

  function _facialHair(profile, index, shadow) {
    if (profile === 'feminine' && index === 1) return '<path d="M58 59 Q70 64 82 59 Q80 66 70 67 Q60 66 58 59Z" fill="none" stroke="#b87862" stroke-width="1" opacity=".5"/>';
    if (profile === 'feminine') return '';
    if (index === 2) return `<path d="M58 56 Q70 60 82 56" stroke="${shadow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (index === 3) return `<path d="M57 58 Q70 66 83 58 L80 70 Q70 76 60 70Z" fill="${shadow}" opacity=".9"/>`;
    if (index === 4) return `<path d="M56 56 Q70 65 84 56 L82 76 Q70 85 58 76Z" fill="${shadow}" opacity=".94"/>`;
    if (index === 5) return `<path d="M64 60 Q70 65 76 60 L76 75 L70 80 L64 75Z" fill="${shadow}" opacity=".9"/>`;
    return '';
  }

  function _accessory(index, skin) {
    if (index === 2) return '<path d="M52 45h16m4 0h16M68 45h4" stroke="#252525" stroke-width="2" fill="none"/><circle cx="55" cy="45" r="5.5" fill="none" stroke="#252525" stroke-width="1.3"/><circle cx="85" cy="45" r="5.5" fill="none" stroke="#252525" stroke-width="1.3"/>';
    if (index === 3) return `<path d="M72 76 Q83 79 86 91" stroke="#e6c56d" stroke-width="2" fill="none"/><circle cx="86" cy="92" r="3" fill="#f0c85a" stroke="#8d6926"/>`;
    if (index === 4) return '<path d="M70 75 Q58 86 70 94 Q82 86 70 75Z" fill="none" stroke="#f0c85a" stroke-width="2"/>';
    if (index === 5) return '<path d="M70 76 Q58 89 70 98 Q82 89 70 76Z" fill="#f0c85a" stroke="#8d6926" stroke-width="1.5"/><path d="M65 88 Q70 82 75 88" stroke="#fff1a8" stroke-width="1.2" fill="none"/>';
    return '';
  }

  function _hands(skin, shadow) {
    return `<circle cx="43" cy="136" r="5" fill="${skin}" stroke="${shadow}" stroke-width="1"/><circle cx="97" cy="136" r="5" fill="${skin}" stroke="${shadow}" stroke-width="1"/>`;
  }

  function _legs(profile, pants, boot) {
    return `<path d="M${profile === 'feminine' ? 57 : 55} 136 L${profile === 'feminine' ? 63 : 65} 174 L${profile === 'feminine' ? 70 : 69} 174 L70 138Z" fill="${pants}" stroke="#303b45" stroke-width="1.2"/>
      <path d="M70 138 L${profile === 'masculine' ? 85 : 83} 174 L${profile === 'masculine' ? 91 : 88} 174 L82 136Z" fill="${pants}" stroke="#303b45" stroke-width="1.2"/>
      <path d="M54 171h16v9H51Q48 176 54 171Zm28 0h9q7 5 3 9H82Z" fill="${boot}" stroke="#2b2522" stroke-width="1.2"/>
      <path d="M54 176h14m18 0h8" stroke="#d0b8a0" stroke-width="1" opacity=".65"/>`;
  }

  function render(target, character, options) {
    if (!target) return;
    const current = character || {};
    const profile = ['feminine', 'masculine', 'neutral'].includes(current.genderProfile) ? current.genderProfile : 'neutral';
    const appearance = current.appearance || {};
    const mode = options && options.outfit === 'fishing' ? 'fishing' : 'arrival';
    const skin = SKIN[_index(appearance.skinTone) - 1];
    const shadow = SKIN_SHADOW[_index(appearance.skinTone) - 1];
    const eye = EYES[_index(appearance.eyeColor) - 1];
    const hair = HAIR[_index(appearance.hairColor) - 1];
    const hairShadow = hair === '#17120f' ? '#090706' : '#24130f';
    const outfitIndex = _index(mode === 'fishing' ? appearance.fishingOutfit : appearance.arrivalOutfit);
    const outfitPalette = mode === 'fishing' ? FISHING : ARRIVAL;
    const shirt = outfitPalette[profile][outfitIndex - 1];
    const shirtDark = mode === 'fishing' ? '#253d46' : '#4b3b55';
    const pants = PANTS[profile];
    const boots = BOOTS[profile];
    const faceIndex = _index(appearance.faceShape);
    const eyeDetails = _index(appearance.eyeDetails);
    const eyeY = eyeDetails === 5 ? 46 : eyeDetails === 2 ? 44 : 45;
    const eyeSize = eyeDetails === 4 ? 3.2 : 2.8;
    const expressive = eyeDetails === 4;
    const heightScale = 0.91 + (_index(appearance.height) - 1) * 0.035;
    const bodyIndex = _index(appearance.bodyShape);
    const torso = _torso(profile, bodyIndex, shirt, shirtDark, mode === 'fishing');
    const shirtDetails = _shirtDetails(profile, bodyIndex, shirt, shirtDark, mode === 'fishing', outfitIndex);
    const hairMarkup = _hair(appearance.hairStyle, profile, hair, hairShadow);
    const covering = _headCover(_index(appearance.headCovering));
    const beard = _facialHair(profile, _index(appearance.facialHair), shadow);
    const accessory = _accessory(_index(appearance.accessories), skin);
    const fishingBadge = mode === 'fishing' ? '<path d="M57 111h26v13H57Z" fill="#e8c76a" stroke="#7f6625"/><path d="M61 117h18" stroke="#7f6625" stroke-width="1.4"/>' : '';

    target.innerHTML = `<svg class="character-avatar-svg" viewBox="0 0 140 190" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g transform="translate(70 0) scale(${heightScale}) translate(-70 0)">
        <ellipse cx="70" cy="181" rx="38" ry="6" fill="#000" opacity=".18"/>
        ${_legs(profile, pants, boots)}
        ${torso}
        ${shirtDetails}
        ${fishingBadge}
        <path d="M${70 - _profileData(profile, bodyIndex).shoulder + 2} 101 Q${70 - _profileData(profile, bodyIndex).shoulder - 7} 112 43 136" stroke="${shirtDark}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M${70 + _profileData(profile, bodyIndex).shoulder - 2} 101 Q${70 + _profileData(profile, bodyIndex).shoulder + 7} 112 97 136" stroke="${shirtDark}" stroke-width="10" fill="none" stroke-linecap="round"/>
        ${_hands(skin, shadow)}
        <path d="M62 87 Q70 96 78 87 L78 101 Q70 108 62 101Z" fill="${skin}" stroke="${shadow}" stroke-width="1.1"/>
        ${_face(faceIndex, skin, shadow, eye, eyeY, eyeSize, expressive)}
        ${hairMarkup}
        ${beard}
        ${covering}
        ${accessory}
      </g>
    </svg>`;
  }

  return { render };
})();
