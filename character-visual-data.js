/* character-visual-data.js — Bites & Baits
 * Catálogo textual da aparência inicial. A aparência é independente
 * do gênero/forma textual e não altera qualquer regra do jogo.
 */
const CHARACTER_VISUAL_CATEGORIES = [
  { key: 'skinTone', labels: { pt: 'Tom de pele', en: 'Skin tone', hu: 'Bőrtónus' }, options: [
    { value: 'very-light', labels: { pt: 'Pele muito clara', en: 'Very light skin', hu: 'Nagyon világos bőr' } },
    { value: 'warm-light', labels: { pt: 'Pele clara quente', en: 'Warm light skin', hu: 'Meleg világos bőr' } },
    { value: 'medium', labels: { pt: 'Pele média', en: 'Medium skin', hu: 'Közepes bőrtónus' } },
    { value: 'brown', labels: { pt: 'Pele castanha', en: 'Brown skin', hu: 'Barna bőr' } },
    { value: 'dark', labels: { pt: 'Pele escura', en: 'Dark skin', hu: 'Sötét bőr' } },
  ] },
  { key: 'bodyShape', labels: { pt: 'Forma do corpo', en: 'Body shape', hu: 'Testalkat' }, options: [
    { value: 'compact', labels: { pt: 'Compacto', en: 'Compact', hu: 'Zömök' } },
    { value: 'slender', labels: { pt: 'Esbelto', en: 'Slender', hu: 'Karcsú' } },
    { value: 'average', labels: { pt: 'Médio', en: 'Average', hu: 'Átlagos' } },
    { value: 'broad', labels: { pt: 'Largo', en: 'Broad', hu: 'Széles' } },
    { value: 'full', labels: { pt: 'Encorpado', en: 'Fuller', hu: 'Testesebb' } },
  ] },
  { key: 'height', labels: { pt: 'Altura', en: 'Height', hu: 'Magasság' }, options: [
    { value: 'short', labels: { pt: 'Baixa', en: 'Short', hu: 'Alacsony' } },
    { value: 'medium-short', labels: { pt: 'Média-baixa', en: 'Medium-short', hu: 'Közepesen alacsony' } },
    { value: 'medium', labels: { pt: 'Média', en: 'Medium', hu: 'Közepes' } },
    { value: 'medium-tall', labels: { pt: 'Média-alta', en: 'Medium-tall', hu: 'Közepesen magas' } },
    { value: 'tall', labels: { pt: 'Alta', en: 'Tall', hu: 'Magas' } },
  ] },
  { key: 'faceShape', labels: { pt: 'Formato do rosto', en: 'Face shape', hu: 'Arcforma' }, options: [
    { value: 'oval', labels: { pt: 'Oval', en: 'Oval', hu: 'Ovális' } },
    { value: 'round', labels: { pt: 'Redondo', en: 'Round', hu: 'Kerek' } },
    { value: 'square', labels: { pt: 'Quadrado', en: 'Square', hu: 'Szögletes' } },
    { value: 'long', labels: { pt: 'Alongado', en: 'Oblong', hu: 'Hosszúkás' } },
    { value: 'triangular', labels: { pt: 'Triangular', en: 'Triangular', hu: 'Háromszögletű' } },
  ] },
  { key: 'eyeDetails', labels: { pt: 'Olhos e detalhes faciais', en: 'Eyes and facial details', hu: 'Szemek és arcvonások' }, options: [
    { value: 'open', labels: { pt: 'Olhar aberto', en: 'Open gaze', hu: 'Nyílt tekintet' } },
    { value: 'soft', labels: { pt: 'Olhar suave', en: 'Soft gaze', hu: 'Szelíd tekintet' } },
    { value: 'attentive', labels: { pt: 'Olhar atento', en: 'Attentive gaze', hu: 'Figyelmes tekintet' } },
    { value: 'curious', labels: { pt: 'Olhar curioso', en: 'Curious gaze', hu: 'Kíváncsi tekintet' } },
    { value: 'calm', labels: { pt: 'Olhar tranquilo', en: 'Calm gaze', hu: 'Nyugodt tekintet' } },
  ] },
  { key: 'eyeColor', labels: { pt: 'Cor dos olhos', en: 'Eye color', hu: 'Szemszín' }, options: [
    { value: 'dark-brown', labels: { pt: 'Castanho escuro', en: 'Dark brown', hu: 'Sötétbarna' } },
    { value: 'light-brown', labels: { pt: 'Castanho claro', en: 'Light brown', hu: 'Világosbarna' } },
    { value: 'green', labels: { pt: 'Verde', en: 'Green', hu: 'Zöld' } },
    { value: 'blue', labels: { pt: 'Azul', en: 'Blue', hu: 'Kék' } },
    { value: 'gray', labels: { pt: 'Cinza', en: 'Gray', hu: 'Szürke' } },
  ] },
  { key: 'hairStyle', labels: { pt: 'Cabelo', en: 'Hair', hu: 'Haj' }, options: [
    { value: 'short-straight', labels: { pt: 'Curto liso', en: 'Short straight', hu: 'Rövid, egyenes' } },
    { value: 'short-curly', labels: { pt: 'Curto cacheado', en: 'Short curly', hu: 'Rövid, göndör' } },
    { value: 'medium-wavy', labels: { pt: 'Médio ondulado', en: 'Medium wavy', hu: 'Középhosszú, hullámos' } },
    { value: 'long-tied', labels: { pt: 'Longo preso', en: 'Long tied back', hu: 'Hosszú, összefogott' } },
    { value: 'none', labels: { pt: 'Sem cabelo', en: 'No hair', hu: 'Haj nélkül' } },
  ] },
  { key: 'hairColor', labels: { pt: 'Cor do cabelo', en: 'Hair color', hu: 'Hajszín' }, options: [
    { value: 'black', labels: { pt: 'Preto', en: 'Black', hu: 'Fekete' } },
    { value: 'dark-brown', labels: { pt: 'Castanho escuro', en: 'Dark brown', hu: 'Sötétbarna' } },
    { value: 'light-brown', labels: { pt: 'Castanho claro', en: 'Light brown', hu: 'Világosbarna' } },
    { value: 'blond', labels: { pt: 'Loiro', en: 'Blond', hu: 'Szőke' } },
    { value: 'red', labels: { pt: 'Ruivo', en: 'Red', hu: 'Vörös' } },
  ] },
  { key: 'headCovering', labels: { pt: 'Cobertura de cabeça', en: 'Head covering', hu: 'Fejfedő' }, options: [
    { value: 'none', labels: { pt: 'Nenhuma cobertura', en: 'No covering', hu: 'Nincs fejfedő' } },
    { value: 'cap', labels: { pt: 'Boné', en: 'Cap', hu: 'Sapka' } },
    { value: 'hat', labels: { pt: 'Chapéu', en: 'Hat', hu: 'Kalap' } },
    { value: 'beanie', labels: { pt: 'Gorro', en: 'Beanie', hu: 'Kötött sapka' } },
    { value: 'scarf-cultural', labels: { pt: 'Lenço ou cobertura culturalmente apropriada', en: 'Scarf or culturally appropriate covering', hu: 'Sál vagy kulturálisan megfelelő fejfedő' } },
  ] },
  { key: 'facialHair', labels: { pt: 'Pelos faciais', en: 'Facial hair', hu: 'Arcszőrzet' }, options: [
    { value: 'none', labels: { pt: 'Sem pelos faciais', en: 'No facial hair', hu: 'Nincs arcszőrzet' } },
    { value: 'mustache', labels: { pt: 'Bigode', en: 'Mustache', hu: 'Bajusz' } },
    { value: 'short-beard', labels: { pt: 'Barba curta', en: 'Short beard', hu: 'Rövid szakáll' } },
    { value: 'full-beard', labels: { pt: 'Barba cheia', en: 'Full beard', hu: 'Teljes szakáll' } },
    { value: 'goatee', labels: { pt: 'Cavanhaque', en: 'Goatee', hu: 'Kecskeszakáll' } },
  ] },
  { key: 'arrivalOutfit', labels: { pt: 'Roupa de chegada', en: 'Arrival outfit', hu: 'Érkezési öltözet' }, options: [
    { value: 'light-casual', labels: { pt: 'Casual claro', en: 'Light casual', hu: 'Világos hétköznapi' } },
    { value: 'dark-casual', labels: { pt: 'Casual escuro', en: 'Dark casual', hu: 'Sötét hétköznapi' } },
    { value: 'comfortable', labels: { pt: 'Confortável', en: 'Comfortable', hu: 'Kényelmes' } },
    { value: 'urban', labels: { pt: 'Urbano', en: 'Urban', hu: 'Városi' } },
    { value: 'practical', labels: { pt: 'Prático', en: 'Practical', hu: 'Praktikus' } },
  ] },
  { key: 'fishingOutfit', labels: { pt: 'Roupa de pesca', en: 'Fishing outfit', hu: 'Horgászöltözet' }, options: [
    { value: 'classic', labels: { pt: 'Pescador clássico', en: 'Classic angler', hu: 'Klasszikus horgász' } },
    { value: 'river', labels: { pt: 'Rio', en: 'River', hu: 'Folyóparti' } },
    { value: 'lake', labels: { pt: 'Lago', en: 'Lake', hu: 'Tavi' } },
    { value: 'rain', labels: { pt: 'Chuva', en: 'Rain', hu: 'Esős időre való' } },
    { value: 'heavy-work', labels: { pt: 'Trabalho pesado', en: 'Heavy work', hu: 'Nehéz munkához való' } },
  ] },
  { key: 'footwear', labels: { pt: 'Calçados', en: 'Footwear', hu: 'Lábbeli' }, options: [
    { value: 'simple-sneakers', labels: { pt: 'Tênis simples', en: 'Simple sneakers', hu: 'Egyszerű sportcipő' } },
    { value: 'short-boots', labels: { pt: 'Bota curta', en: 'Short boots', hu: 'Rövid csizma' } },
    { value: 'high-boots', labels: { pt: 'Bota alta', en: 'High boots', hu: 'Magas szárú csizma' } },
    { value: 'resistant-sandals', labels: { pt: 'Sandália resistente', en: 'Sturdy sandals', hu: 'Strapabíró szandál' } },
    { value: 'waterproof', labels: { pt: 'Calçado impermeável', en: 'Waterproof footwear', hu: 'Vízálló lábbeli' } },
  ] },
  { key: 'accessories', labels: { pt: 'Acessórios', en: 'Accessories', hu: 'Kiegészítők' }, options: [
    { value: 'none', labels: { pt: 'Nenhum acessório', en: 'No accessories', hu: 'Nincsenek kiegészítők' } },
    { value: 'glasses', labels: { pt: 'Óculos', en: 'Glasses', hu: 'Szemüveg' } },
    { value: 'watch-bracelet', labels: { pt: 'Relógio ou pulseira', en: 'Watch or bracelet', hu: 'Óra vagy karkötő' } },
    { value: 'necklace', labels: { pt: 'Colar', en: 'Necklace', hu: 'Nyaklánc' } },
    { value: 'fishing-pendant', labels: { pt: 'Pingente de pesca', en: 'Fishing pendant', hu: 'Horgászmedál' } },
  ] },
];

function characterVisualLabel(item, lang) {
  return (item.labels && (item.labels[lang] || item.labels.pt)) || '';
}
