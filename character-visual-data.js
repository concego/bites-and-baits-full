/* character-visual-data.js — Bites & Baits
 * A aparência segue o perfil escolhido na identidade:
 * feminine, masculine ou neutral (apresentação andrógina).
 * Nada aqui altera atributos ou regras do jogo.
 */
const CHARACTER_VISUAL_PROFILES = ['feminine', 'masculine', 'neutral'];

function _visualTriple(pt, en, hu) {
  return { pt, en, hu };
}

function _visualOptions(categoryKey, labelsByProfile) {
  const result = {};
  CHARACTER_VISUAL_PROFILES.forEach(profile => {
    result[profile] = labelsByProfile[profile].map((labels, index) => ({
      value: `${profile}-${categoryKey}-${index + 1}`,
      labels,
    }));
  });
  return result;
}

function _visualCategory(key, labels, labelsByProfile) {
  return { key, labels, optionsByProfile: _visualOptions(key, labelsByProfile) };
}

const CHARACTER_VISUAL_CATEGORY_DEFINITIONS = [
  _visualCategory('skinTone', _visualTriple('Tom de pele', 'Skin tone', 'Bőrtónus'), {
    feminine: [
      _visualTriple('Pele muito clara', 'Very light skin', 'Nagyon világos bőr'),
      _visualTriple('Pele clara quente', 'Warm light skin', 'Meleg világos bőr'),
      _visualTriple('Pele média', 'Medium skin', 'Közepes bőrtónus'),
      _visualTriple('Pele castanha', 'Brown skin', 'Barna bőr'),
      _visualTriple('Pele escura', 'Dark skin', 'Sötét bőr'),
    ],
    masculine: [
      _visualTriple('Pele muito clara', 'Very light skin', 'Nagyon világos bőr'),
      _visualTriple('Pele clara quente', 'Warm light skin', 'Meleg világos bőr'),
      _visualTriple('Pele média', 'Medium skin', 'Közepes bőrtónus'),
      _visualTriple('Pele castanha', 'Brown skin', 'Barna bőr'),
      _visualTriple('Pele escura', 'Dark skin', 'Sötét bőr'),
    ],
    neutral: [
      _visualTriple('Pele muito clara', 'Very light skin', 'Nagyon világos bőr'),
      _visualTriple('Pele clara quente', 'Warm light skin', 'Meleg világos bőr'),
      _visualTriple('Pele média', 'Medium skin', 'Közepes bőrtónus'),
      _visualTriple('Pele castanha', 'Brown skin', 'Barna bőr'),
      _visualTriple('Pele escura', 'Dark skin', 'Sötét bőr'),
    ],
  }),
  _visualCategory('bodyShape', _visualTriple('Forma do corpo', 'Body shape', 'Testalkat'), {
    feminine: [
      _visualTriple('Delicado', 'Delicate', 'Finom testalkatú'),
      _visualTriple('Esguio', 'Slender', 'Karcsú'),
      _visualTriple('Médio', 'Average', 'Átlagos'),
      _visualTriple('Curvilíneo', 'Curvy', 'Kerekded'),
      _visualTriple('Atlético', 'Athletic', 'Sportos'),
    ],
    masculine: [
      _visualTriple('Compacto', 'Compact', 'Zömök'),
      _visualTriple('Esbelto', 'Slender', 'Karcsú'),
      _visualTriple('Médio', 'Average', 'Átlagos'),
      _visualTriple('Largo', 'Broad', 'Széles'),
      _visualTriple('Robusto', 'Robust', 'Erőteljes'),
    ],
    neutral: [
      _visualTriple('Suave', 'Soft', 'Lágy'),
      _visualTriple('Esguio', 'Slender', 'Karcsú'),
      _visualTriple('Médio', 'Average', 'Átlagos'),
      _visualTriple('Andrógino', 'Androgynous', 'Androgün'),
      _visualTriple('Equilibrado', 'Balanced', 'Kiegyensúlyozott'),
    ],
  }),
  _visualCategory('height', _visualTriple('Altura', 'Height', 'Magasság'), {
    feminine: [
      _visualTriple('Baixa', 'Short', 'Alacsony'),
      _visualTriple('Média-baixa', 'Medium-short', 'Közepesen alacsony'),
      _visualTriple('Média', 'Medium', 'Közepes'),
      _visualTriple('Média-alta', 'Medium-tall', 'Közepesen magas'),
      _visualTriple('Alta', 'Tall', 'Magas'),
    ],
    masculine: [
      _visualTriple('Baixa', 'Short', 'Alacsony'),
      _visualTriple('Média-baixa', 'Medium-short', 'Közepesen alacsony'),
      _visualTriple('Média', 'Medium', 'Közepes'),
      _visualTriple('Média-alta', 'Medium-tall', 'Közepesen magas'),
      _visualTriple('Alta', 'Tall', 'Magas'),
    ],
    neutral: [
      _visualTriple('Baixa', 'Short', 'Alacsony'),
      _visualTriple('Média-baixa', 'Medium-short', 'Közepesen alacsony'),
      _visualTriple('Média', 'Medium', 'Közepes'),
      _visualTriple('Média-alta', 'Medium-tall', 'Közepesen magas'),
      _visualTriple('Alta', 'Tall', 'Magas'),
    ],
  }),
  _visualCategory('faceShape', _visualTriple('Formato do rosto', 'Face shape', 'Arcforma'), {
    feminine: [
      _visualTriple('Oval delicado', 'Soft oval', 'Finom ovális'),
      _visualTriple('Redondo suave', 'Soft round', 'Lágyan kerek'),
      _visualTriple('Angular', 'Angular', 'Szögletes'),
      _visualTriple('Alongado', 'Oblong', 'Hosszúkás'),
      _visualTriple('Coração', 'Heart-shaped', 'Szív alakú'),
    ],
    masculine: [
      _visualTriple('Oval', 'Oval', 'Ovális'),
      _visualTriple('Redondo', 'Round', 'Kerek'),
      _visualTriple('Quadrado', 'Square', 'Szögletes'),
      _visualTriple('Alongado', 'Oblong', 'Hosszúkás'),
      _visualTriple('Triangular', 'Triangular', 'Háromszögletű'),
    ],
    neutral: [
      _visualTriple('Oval', 'Oval', 'Ovális'),
      _visualTriple('Redondo suave', 'Soft round', 'Lágyan kerek'),
      _visualTriple('Angular suave', 'Soft angular', 'Lágyan szögletes'),
      _visualTriple('Alongado', 'Oblong', 'Hosszúkás'),
      _visualTriple('Andrógino', 'Androgynous', 'Androgün'),
    ],
  }),
  _visualCategory('eyeDetails', _visualTriple('Olhos e detalhes faciais', 'Eyes and facial details', 'Szemek és arcvonások'), {
    feminine: [
      _visualTriple('Olhar aberto', 'Open gaze', 'Nyílt tekintet'),
      _visualTriple('Olhar suave', 'Soft gaze', 'Szelíd tekintet'),
      _visualTriple('Olhar atento', 'Attentive gaze', 'Figyelmes tekintet'),
      _visualTriple('Olhar expressivo', 'Expressive gaze', 'Kifejező tekintet'),
      _visualTriple('Olhar curioso', 'Curious gaze', 'Kíváncsi tekintet'),
    ],
    masculine: [
      _visualTriple('Olhar aberto', 'Open gaze', 'Nyílt tekintet'),
      _visualTriple('Olhar firme', 'Steady gaze', 'Határozott tekintet'),
      _visualTriple('Olhar atento', 'Attentive gaze', 'Figyelmes tekintet'),
      _visualTriple('Olhar curioso', 'Curious gaze', 'Kíváncsi tekintet'),
      _visualTriple('Olhar tranquilo', 'Calm gaze', 'Nyugodt tekintet'),
    ],
    neutral: [
      _visualTriple('Olhar aberto', 'Open gaze', 'Nyílt tekintet'),
      _visualTriple('Olhar suave', 'Soft gaze', 'Szelíd tekintet'),
      _visualTriple('Olhar atento', 'Attentive gaze', 'Figyelmes tekintet'),
      _visualTriple('Olhar curioso', 'Curious gaze', 'Kíváncsi tekintet'),
      _visualTriple('Olhar tranquilo', 'Calm gaze', 'Nyugodt tekintet'),
    ],
  }),
  _visualCategory('eyeColor', _visualTriple('Cor dos olhos', 'Eye color', 'Szemszín'), {
    feminine: [
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Verde', 'Green', 'Zöld'),
      _visualTriple('Azul', 'Blue', 'Kék'),
      _visualTriple('Cinza', 'Gray', 'Szürke'),
      _visualTriple('Preto', 'Black', 'Fekete'),
    ],
    masculine: [
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Verde', 'Green', 'Zöld'),
      _visualTriple('Azul', 'Blue', 'Kék'),
      _visualTriple('Cinza', 'Gray', 'Szürke'),
      _visualTriple('Preto', 'Black', 'Fekete'),
    ],
    neutral: [
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Verde', 'Green', 'Zöld'),
      _visualTriple('Azul', 'Blue', 'Kék'),
      _visualTriple('Cinza', 'Gray', 'Szürke'),
      _visualTriple('Preto', 'Black', 'Fekete'),
    ],
  }),
  _visualCategory('hairStyle', _visualTriple('Cabelo', 'Hair', 'Haj'), {
    feminine: [
      _visualTriple('Curto liso', 'Short straight', 'Rövid, egyenes'),
      _visualTriple('Curto cacheado', 'Short curly', 'Rövid, göndör'),
      _visualTriple('Médio ondulado', 'Medium wavy', 'Középhosszú, hullámos'),
      _visualTriple('Longo solto', 'Long and loose', 'Hosszú, kibontott'),
      _visualTriple('Longo preso', 'Long tied back', 'Hosszú, összefogott'),
      _visualTriple('Longo ondulado', 'Long wavy', 'Hosszú, hullámos'),
    ],
    masculine: [
      _visualTriple('Curto liso', 'Short straight', 'Rövid, egyenes'),
      _visualTriple('Curto cacheado', 'Short curly', 'Rövid, göndör'),
      _visualTriple('Médio ondulado', 'Medium wavy', 'Középhosszú, hullámos'),
      _visualTriple('Longo preso', 'Long tied back', 'Hosszú, összefogott'),
      _visualTriple('Sem cabelo', 'No hair', 'Haj nélkül'),
      _visualTriple('Longo ondulado', 'Long wavy', 'Hosszú, hullámos'),
    ],
    neutral: [
      _visualTriple('Curto liso', 'Short straight', 'Rövid, egyenes'),
      _visualTriple('Curto cacheado', 'Short curly', 'Rövid, göndör'),
      _visualTriple('Médio ondulado', 'Medium wavy', 'Középhosszú, hullámos'),
      _visualTriple('Longo preso', 'Long tied back', 'Hosszú, összefogott'),
      _visualTriple('Sem cabelo', 'No hair', 'Haj nélkül'),
      _visualTriple('Longo ondulado', 'Long wavy', 'Hosszú, hullámos'),
    ],
  }),
  _visualCategory('hairColor', _visualTriple('Cor do cabelo', 'Hair color', 'Hajszín'), {
    feminine: [
      _visualTriple('Preto', 'Black', 'Fekete'),
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Loiro', 'Blond', 'Szőke'),
      _visualTriple('Ruivo', 'Red', 'Vörös'),
    ],
    masculine: [
      _visualTriple('Preto', 'Black', 'Fekete'),
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Loiro', 'Blond', 'Szőke'),
      _visualTriple('Ruivo', 'Red', 'Vörös'),
    ],
    neutral: [
      _visualTriple('Preto', 'Black', 'Fekete'),
      _visualTriple('Castanho escuro', 'Dark brown', 'Sötétbarna'),
      _visualTriple('Castanho claro', 'Light brown', 'Világosbarna'),
      _visualTriple('Loiro', 'Blond', 'Szőke'),
      _visualTriple('Ruivo', 'Red', 'Vörös'),
    ],
  }),
  _visualCategory('headCovering', _visualTriple('Cobertura de cabeça', 'Head covering', 'Fejfedő'), {
    feminine: [
      _visualTriple('Nenhuma cobertura', 'No covering', 'Nincs fejfedő'),
      _visualTriple('Boné', 'Cap', 'Sapka'),
      _visualTriple('Chapéu', 'Hat', 'Kalap'),
      _visualTriple('Faixa de cabelo', 'Hair band', 'Hajpánt'),
      _visualTriple('Lenço', 'Scarf', 'Sál'),
      _visualTriple('Tiara', 'Tiara', 'Tiara'),
      _visualTriple('Arquinho', 'Headband', 'Hajpánt'),
    ],
    masculine: [
      _visualTriple('Nenhuma cobertura', 'No covering', 'Nincs fejfedő'),
      _visualTriple('Boné', 'Cap', 'Sapka'),
      _visualTriple('Chapéu', 'Hat', 'Kalap'),
      _visualTriple('Gorro', 'Beanie', 'Kötött sapka'),
      _visualTriple('Lenço', 'Scarf', 'Sál'),
      _visualTriple('Tiara', 'Tiara', 'Tiara'),
      _visualTriple('Arquinho', 'Headband', 'Hajpánt'),
    ],
    neutral: [
      _visualTriple('Nenhuma cobertura', 'No covering', 'Nincs fejfedő'),
      _visualTriple('Boné', 'Cap', 'Sapka'),
      _visualTriple('Chapéu', 'Hat', 'Kalap'),
      _visualTriple('Gorro', 'Beanie', 'Kötött sapka'),
      _visualTriple('Lenço ou cobertura culturalmente apropriada', 'Scarf or culturally appropriate covering', 'Sál vagy kulturálisan megfelelő fejfedő'),
      _visualTriple('Tiara', 'Tiara', 'Tiara'),
      _visualTriple('Arquinho', 'Headband', 'Hajpánt'),
    ],
  }),
  _visualCategory('facialHair', _visualTriple('Pelos faciais', 'Facial hair', 'Arcszőrzet'), {
    feminine: [
      _visualTriple('Sem pelos faciais', 'No facial hair', 'Nincs arcszőrzet'),
      _visualTriple('Penugem suave', 'Soft peach fuzz', 'Finom pihék'),
      _visualTriple('Sardas', 'Freckles', 'Szeplők'),
      _visualTriple('Marcas de expressão', 'Expression marks', 'Arcvonások'),
      _visualTriple('Pele lisa', 'Smooth skin', 'Sima bőr'),
    ],
    masculine: [
      _visualTriple('Sem pelos faciais', 'No facial hair', 'Nincs arcszőrzet'),
      _visualTriple('Bigode', 'Mustache', 'Bajusz'),
      _visualTriple('Barba curta', 'Short beard', 'Rövid szakáll'),
      _visualTriple('Barba cheia', 'Full beard', 'Teljes szakáll'),
      _visualTriple('Cavanhaque', 'Goatee', 'Kecskeszakáll'),
    ],
    neutral: [
      _visualTriple('Sem pelos faciais', 'No facial hair', 'Nincs arcszőrzet'),
      _visualTriple('Penugem suave', 'Soft peach fuzz', 'Finom pihék'),
      _visualTriple('Bigode discreto', 'Subtle mustache', 'Diszkrét bajusz'),
      _visualTriple('Barba curta', 'Short beard', 'Rövid szakáll'),
      _visualTriple('Sardas', 'Freckles', 'Szeplők'),
    ],
  }),
  _visualCategory('arrivalOutfit', _visualTriple('Roupa de chegada', 'Arrival outfit', 'Érkezési öltözet'), {
    feminine: [
      _visualTriple('Casual claro', 'Light casual', 'Világos hétköznapi'),
      _visualTriple('Casual escuro', 'Dark casual', 'Sötét hétköznapi'),
      _visualTriple('Confortável', 'Comfortable', 'Kényelmes'),
      _visualTriple('Urbano', 'Urban', 'Városi'),
      _visualTriple('Prático', 'Practical', 'Praktikus'),
    ],
    masculine: [
      _visualTriple('Casual claro', 'Light casual', 'Világos hétköznapi'),
      _visualTriple('Casual escuro', 'Dark casual', 'Sötét hétköznapi'),
      _visualTriple('Confortável', 'Comfortable', 'Kényelmes'),
      _visualTriple('Urbano', 'Urban', 'Városi'),
      _visualTriple('Prático', 'Practical', 'Praktikus'),
    ],
    neutral: [
      _visualTriple('Casual claro', 'Light casual', 'Világos hétköznapi'),
      _visualTriple('Casual escuro', 'Dark casual', 'Sötét hétköznapi'),
      _visualTriple('Confortável', 'Comfortable', 'Kényelmes'),
      _visualTriple('Urbano', 'Urban', 'Városi'),
      _visualTriple('Prático', 'Practical', 'Praktikus'),
    ],
  }),
  _visualCategory('fishingOutfit', _visualTriple('Roupa de pesca', 'Fishing outfit', 'Horgászöltözet'), {
    feminine: [
      _visualTriple('Pescadora clássica', 'Classic angler', 'Klasszikus horgász'),
      _visualTriple('Rio', 'River', 'Folyóparti'),
      _visualTriple('Lago', 'Lake', 'Tavi'),
      _visualTriple('Chuva', 'Rain', 'Esős időre való'),
      _visualTriple('Trabalho pesado', 'Heavy work', 'Nehéz munkához való'),
    ],
    masculine: [
      _visualTriple('Pescador clássico', 'Classic angler', 'Klasszikus horgász'),
      _visualTriple('Rio', 'River', 'Folyóparti'),
      _visualTriple('Lago', 'Lake', 'Tavi'),
      _visualTriple('Chuva', 'Rain', 'Esős időre való'),
      _visualTriple('Trabalho pesado', 'Heavy work', 'Nehéz munkához való'),
    ],
    neutral: [
      _visualTriple('Pessoa pescadora clássica', 'Classic angler', 'Klasszikus horgász'),
      _visualTriple('Rio', 'River', 'Folyóparti'),
      _visualTriple('Lago', 'Lake', 'Tavi'),
      _visualTriple('Chuva', 'Rain', 'Esős időre való'),
      _visualTriple('Trabalho pesado', 'Heavy work', 'Nehéz munkához való'),
    ],
  }),
  _visualCategory('footwear', _visualTriple('Calçados', 'Footwear', 'Lábbeli'), {
    feminine: [
      _visualTriple('Tênis simples', 'Simple sneakers', 'Egyszerű sportcipő'),
      _visualTriple('Bota curta', 'Short boots', 'Rövid csizma'),
      _visualTriple('Bota alta', 'High boots', 'Magas szárú csizma'),
      _visualTriple('Sandália resistente', 'Sturdy sandals', 'Strapabíró szandál'),
      _visualTriple('Calçado impermeável', 'Waterproof footwear', 'Vízálló lábbeli'),
    ],
    masculine: [
      _visualTriple('Tênis simples', 'Simple sneakers', 'Egyszerű sportcipő'),
      _visualTriple('Bota curta', 'Short boots', 'Rövid csizma'),
      _visualTriple('Bota alta', 'High boots', 'Magas szárú csizma'),
      _visualTriple('Sandália resistente', 'Sturdy sandals', 'Strapabíró szandál'),
      _visualTriple('Calçado impermeável', 'Waterproof footwear', 'Vízálló lábbeli'),
    ],
    neutral: [
      _visualTriple('Tênis simples', 'Simple sneakers', 'Egyszerű sportcipő'),
      _visualTriple('Bota curta', 'Short boots', 'Rövid csizma'),
      _visualTriple('Bota alta', 'High boots', 'Magas szárú csizma'),
      _visualTriple('Sandália resistente', 'Sturdy sandals', 'Strapabíró szandál'),
      _visualTriple('Calçado impermeável', 'Waterproof footwear', 'Vízálló lábbeli'),
    ],
  }),
  _visualCategory('accessories', _visualTriple('Acessórios', 'Accessories', 'Kiegészítők'), {
    feminine: [
      _visualTriple('Nenhum acessório', 'No accessories', 'Nincsenek kiegészítők'),
      _visualTriple('Óculos', 'Glasses', 'Szemüveg'),
      _visualTriple('Relógio ou pulseira', 'Watch or bracelet', 'Óra vagy karkötő'),
      _visualTriple('Colar', 'Necklace', 'Nyaklánc'),
      _visualTriple('Pingente de pesca', 'Fishing pendant', 'Horgászmedál'),
    ],
    masculine: [
      _visualTriple('Nenhum acessório', 'No accessories', 'Nincsenek kiegészítők'),
      _visualTriple('Óculos', 'Glasses', 'Szemüveg'),
      _visualTriple('Relógio ou pulseira', 'Watch or bracelet', 'Óra vagy karkötő'),
      _visualTriple('Colar', 'Necklace', 'Nyaklánc'),
      _visualTriple('Pingente de pesca', 'Fishing pendant', 'Horgászmedál'),
    ],
    neutral: [
      _visualTriple('Nenhum acessório', 'No accessories', 'Nincsenek kiegészítők'),
      _visualTriple('Óculos', 'Glasses', 'Szemüveg'),
      _visualTriple('Relógio ou pulseira', 'Watch or bracelet', 'Óra vagy karkötő'),
      _visualTriple('Colar', 'Necklace', 'Nyaklánc'),
      _visualTriple('Pingente de pesca', 'Fishing pendant', 'Horgászmedál'),
    ],
  }),
];

const CHARACTER_VISUAL_OPTION_DESCRIPTIONS = {
  arrivalOutfit: [
    _visualTriple('Camiseta clara, calça simples e cores leves.', 'Light shirt, simple trousers and soft colors.', 'Világos felső, egyszerű nadrág és lágy színek.'),
    _visualTriple('Camiseta escura, calça simples e contraste moderado.', 'Dark shirt, simple trousers and moderate contrast.', 'Sötét felső, egyszerű nadrág és mérsékelt kontraszt.'),
    _visualTriple('Blusa solta, calça confortável e tons suaves.', 'Loose top, comfortable trousers and soft tones.', 'Laza felső, kényelmes nadrág és lágy árnyalatok.'),
    _visualTriple('Camisa ou jaqueta leve e combinação contrastante.', 'Light shirt or jacket with a contrasting combination.', 'Könnyű ing vagy dzseki kontrasztos összeállításban.'),
    _visualTriple('Roupa simples e resistente, adequada para carregar malas.', 'Simple, sturdy clothes suitable for carrying luggage.', 'Egyszerű, strapabíró öltözet, amely alkalmas csomagok cipelésére.'),
  ],
  fishingOutfit: [
    _visualTriple('Camisa leve, calça resistente e colete simples.', 'Light shirt, sturdy trousers and a simple vest.', 'Könnyű felső, strapabíró nadrág és egyszerű mellény.'),
    _visualTriple('Tons azuis e terrosos com proteção leve.', 'Blue and earth tones with light protection.', 'Kékes és földszínek könnyű védelemmel.'),
    _visualTriple('Tons verdes e proteção visual contra o sol.', 'Green tones with visual protection from the sun.', 'Zöld árnyalatok nap elleni vizuális védelemmel.'),
    _visualTriple('Capa leve e peças visualmente impermeáveis.', 'Light rain cape and visibly waterproof pieces.', 'Könnyű esőköpeny és láthatóan vízálló darabok.'),
    _visualTriple('Colete reforçado, calça resistente e luvas visuais.', 'Reinforced vest, sturdy trousers and visual gloves.', 'Megerősített mellény, strapabíró nadrág és látható kesztyű.'),
  ],
};

function getCharacterVisualCategories(profile) {
  const selectedProfile = CHARACTER_VISUAL_PROFILES.includes(profile) ? profile : 'neutral';
  return CHARACTER_VISUAL_CATEGORY_DEFINITIONS.map(category => ({
    key: category.key,
    labels: category.labels,
    options: category.optionsByProfile[selectedProfile].map((option, index) => ({
      ...option,
      description: CHARACTER_VISUAL_OPTION_DESCRIPTIONS[category.key]?.[index] || null,
    })),
  }));
}

// Compatibilidade para código/QA que ainda consulta o catálogo sem perfil.
const CHARACTER_VISUAL_CATEGORIES = getCharacterVisualCategories('neutral');

function characterVisualLabel(item, lang) {
  return (item.labels && (item.labels[lang] || item.labels.pt)) || '';
}
