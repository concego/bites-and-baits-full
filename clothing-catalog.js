/* clothing-catalog.js — Bites & Baits
 * Models describe the garment's cut/appearance; products are color variants.
 * In-game descriptions avoid references to character-creator outfits.
 * Prototype prices remain provisional and subject to balance.
 */
const CLOTHING_STYLES = Object.freeze({
  basic_tshirt: {
    name:{pt:'Camiseta básica lisa',en:'Plain basic T-shirt',hu:'Egyszerű egyszínű póló'},
    description:{pt:'Gola redonda, mangas curtas e tecido sem estampa.',en:'Crew neck, short sleeves, and plain fabric.',hu:'Kerek nyakkivágás, rövid ujjak és mintátlan anyag.'},
  },
  straight_trousers: {
    name:{pt:'Calça reta básica',en:'Basic straight-leg trousers',hu:'Egyszerű egyenes szárú nadrág'},
    description:{pt:'Corte reto, cintura regular e bolsos laterais.',en:'Straight cut, regular waist, and side pockets.',hu:'Egyenes szabás, normál derék és oldalzsebek.'},
  },
  relaxed_blouse: {
    name:{pt:'Blusa ampla de manga curta',en:'Relaxed short-sleeve blouse',hu:'Laza, rövid ujjú felső'},
    description:{pt:'Caimento solto, mangas curtas e barra simples.',en:'Loose fit, short sleeves, and a plain hem.',hu:'Laza szabás, rövid ujjak és egyszerű szegély.'},
  },
  comfort_trousers: {
    name:{pt:'Calça confortável',en:'Comfort-fit trousers',hu:'Kényelmes szabású nadrág'},
    description:{pt:'Cós confortável e corte que facilita os movimentos.',en:'Comfortable waistband and a cut made for easy movement.',hu:'Kényelmes derékrész és szabad mozgást engedő szabás.'},
  },
  button_shirt: {
    name:{pt:'Camisa casual de botões',en:'Casual button-up shirt',hu:'Hétköznapi gombos ing'},
    description:{pt:'Gola clássica, abertura frontal com botões e mangas longas.',en:'Classic collar, button front, and long sleeves.',hu:'Klasszikus gallér, gombos eleje és hosszú ujjak.'},
  },
  light_jacket: {
    name:{pt:'Jaqueta leve com zíper',en:'Light zip-front jacket',hu:'Könnyű, cipzáras dzseki'},
    description:{pt:'Tecido leve, fechamento frontal e gola baixa.',en:'Lightweight fabric, front closure, and a low collar.',hu:'Könnyű anyag, elülső záródás és alacsony gallér.'},
  },
  work_shirt: {
    name:{pt:'Camisa de trabalho',en:'Work shirt',hu:'Munkásing'},
    description:{pt:'Mangas curtas, tecido encorpado e bolso frontal.',en:'Short sleeves, sturdy fabric, and a front pocket.',hu:'Rövid ujjak, erősebb anyag és elülső zseb.'},
  },
  utility_trousers: {
    name:{pt:'Calça utilitária',en:'Utility trousers',hu:'Praktikus nadrág'},
    description:{pt:'Corte reto e bolsos laterais espaçosos.',en:'Straight cut with roomy side pockets.',hu:'Egyenes szabás és tágas oldalzsebek.'},
  },
  fishing_shirt: {
    name:{pt:'Camisa de pesca com bolso',en:'Pocket fishing shirt',hu:'Zsebes horgászing'},
    description:{pt:'Mangas curtas, abertura frontal e bolso no peito.',en:'Short sleeves, front opening, and a chest pocket.',hu:'Rövid ujjak, elülső nyílás és mellzseb.'},
  },
  fishing_vest: {
    name:{pt:'Colete de pesca com bolsos',en:'Pocket fishing vest',hu:'Zsebes horgászmellény'},
    description:{pt:'Colete leve com bolsos frontais e ajuste lateral.',en:'Light vest with front pockets and side adjustment.',hu:'Könnyű mellény elülső zsebekkel és oldalsó állítással.'},
  },
  sun_hat: {
    name:{pt:'Chapéu de aba curva',en:'Curved-brim hat',hu:'Hajlított karimájú kalap'},
    description:{pt:'Aba curva e copa baixa para uma cobertura ampla.',en:'Curved brim and a low crown for broad coverage.',hu:'Hajlított karima és alacsony korona a szélesebb takarásért.'},
  },
  rain_cape: {
    name:{pt:'Capa de chuva leve',en:'Light rain cape',hu:'Könnyű esőköpeny'},
    description:{pt:'Corte amplo, comprimento até o quadril e abertura frontal.',en:'Roomy cut, hip length, and a front opening.',hu:'Bő szabás, csípőig érő hossz és elülső nyílás.'},
  },
  waterproof_top: {
    name:{pt:'Blusa impermeável',en:'Waterproof top',hu:'Vízálló felső'},
    description:{pt:'Mangas compridas, fechamento frontal e punhos ajustados.',en:'Long sleeves, front closure, and adjustable cuffs.',hu:'Hosszú ujjak, elülső záródás és állítható mandzsetta.'},
  },
  waterproof_trousers: {
    name:{pt:'Calça impermeável',en:'Waterproof trousers',hu:'Vízálló nadrág'},
    description:{pt:'Corte reto, cintura ajustável e tecido impermeável.',en:'Straight cut, adjustable waist, and waterproof fabric.',hu:'Egyenes szabás, állítható derék és vízálló anyag.'},
  },
  reinforced_vest: {
    name:{pt:'Colete reforçado',en:'Reinforced vest',hu:'Megerősített mellény'},
    description:{pt:'Estrutura reforçada, fechamento frontal e bolsos amplos.',en:'Reinforced structure, front closure, and roomy pockets.',hu:'Megerősített szerkezet, elülső záródás és tágas zsebek.'},
  },
  fishing_gloves: {
    name:{pt:'Luvas de pesca',en:'Fishing gloves',hu:'Horgászkesztyű'},
    description:{pt:'Modelo curto com reforço visual na palma.',en:'Short-cut design with a reinforced palm.',hu:'Rövid fazon, megerősített tenyérrésszel.'},
  },
});

function _clothingProduct(id, styleId, slot, modes, price, color, colorName, layer) {
  const style = CLOTHING_STYLES[styleId];
  return Object.freeze({ id, styleId, slot, modes, price, color, colorName, layer:layer || null,
    name:style.name, description:style.description });
}

const CLOTHING_CATALOG = Object.freeze([
  // Camiseta básica lisa: o modelo é o mesmo; a cor identifica cada variante.
  _clothingProduct('top_light_casual','basic_tshirt','top',['arrival'],10,'#d9e7e8',{pt:'Off-white',en:'Off-white',hu:'Törtfehér'}),
  _clothingProduct('top_dark_casual','basic_tshirt','top',['arrival'],10,'#355b70',{pt:'Azul-petróleo',en:'Petrol blue',hu:'Olajkék'}),
  _clothingProduct('top_basic_tee_navy','basic_tshirt','top',['arrival'],10,'#26384d',{pt:'Azul-marinho',en:'Navy',hu:'Sötétkék'}),
  _clothingProduct('top_basic_tee_olive','basic_tshirt','top',['arrival'],10,'#66734f',{pt:'Verde-oliva',en:'Olive green',hu:'Olívazöld'}),
  Object.freeze({
    ..._clothingProduct('top_marta_courtesy','basic_tshirt','top',['arrival'],0,'#849579',
      {pt:'Verde-sálvia',en:'Sage green',hu:'Zsályazöld'}),
    giftOnly: true,
  }),

  // Calças de corte reto em variações de cor.
  _clothingProduct('bottom_simple','straight_trousers','bottom',['arrival','fishing'],10,'#596570',{pt:'Grafite',en:'Graphite',hu:'Grafitszürke'}),
  _clothingProduct('bottom_simple_navy','straight_trousers','bottom',['arrival','fishing'],10,'#354b62',{pt:'Azul-marinho',en:'Navy',hu:'Sötétkék'}),
  _clothingProduct('bottom_simple_brown','straight_trousers','bottom',['arrival','fishing'],10,'#705640',{pt:'Marrom',en:'Brown',hu:'Barna'}),

  _clothingProduct('top_loose_comfort','relaxed_blouse','top',['arrival'],12,'#c9977c',{pt:'Terracota',en:'Terracotta',hu:'Terrakotta'}),
  _clothingProduct('top_loose_sage','relaxed_blouse','top',['arrival'],12,'#8e9c7a',{pt:'Verde-sálvia',en:'Sage green',hu:'Zsályazöld'}),
  _clothingProduct('bottom_comfort','comfort_trousers','bottom',['arrival'],12,'#857b70',{pt:'Taupe',en:'Taupe',hu:'Szürkésbarna'}),
  _clothingProduct('bottom_comfort_navy','comfort_trousers','bottom',['arrival'],12,'#45566b',{pt:'Azul-ardósia',en:'Slate blue',hu:'Palakék'}),

  _clothingProduct('top_urban','button_shirt','top',['arrival'],14,'#8174a0',{pt:'Malva',en:'Mauve',hu:'Mályva'}),
  _clothingProduct('top_button_shirt_ivory','button_shirt','top',['arrival'],14,'#d9cfb9',{pt:'Marfim',en:'Ivory',hu:'Elefántcsont'}),
  _clothingProduct('jacket_light','light_jacket','outerwear',['arrival'],20,'#59647d',{pt:'Azul-ardósia',en:'Slate blue',hu:'Palakék'},'jacket'),
  _clothingProduct('jacket_light_olive','light_jacket','outerwear',['arrival'],20,'#677350',{pt:'Verde-oliva',en:'Olive green',hu:'Olívazöld'},'jacket'),

  _clothingProduct('top_sturdy','work_shirt','top',['arrival','fishing'],14,'#80664d',{pt:'Marrom',en:'Brown',hu:'Barna'}),
  _clothingProduct('top_work_shirt_olive','work_shirt','top',['arrival','fishing'],14,'#55684d',{pt:'Verde-floresta',en:'Forest green',hu:'Erdőzöld'}),
  _clothingProduct('bottom_sturdy','utility_trousers','bottom',['arrival','fishing'],14,'#4c4d4c',{pt:'Chumbo',en:'Charcoal',hu:'Antracitszürke'}),
  _clothingProduct('bottom_utility_olive','utility_trousers','bottom',['arrival','fishing'],14,'#62694c',{pt:'Oliva escuro',en:'Dark olive',hu:'Sötét olíva'}),

  // Camisa de pesca: mesmo modelo, cores que variam na vitrine.
  _clothingProduct('top_fishing_light','fishing_shirt','top',['fishing'],12,'#45778c',{pt:'Azul-oceano',en:'Ocean blue',hu:'Óceánkék'}),
  _clothingProduct('top_river','fishing_shirt','top',['fishing'],12,'#547b83',{pt:'Azul-esverdeado',en:'Blue teal',hu:'Kékeszöld'}),
  _clothingProduct('top_lake','fishing_shirt','top',['fishing'],12,'#67885d',{pt:'Verde-folha',en:'Leaf green',hu:'Levélzöld'}),
  _clothingProduct('top_fishing_burgundy','fishing_shirt','top',['fishing'],12,'#764e55',{pt:'Vinho',en:'Burgundy',hu:'Bordó'}),

  _clothingProduct('vest_simple','fishing_vest','outerwear',['fishing'],16,'#c3a46c',{pt:'Areia',en:'Sand',hu:'Homokszín'},'vest'),
  _clothingProduct('vest_light','fishing_vest','outerwear',['fishing'],16,'#8b806b',{pt:'Caqui',en:'Khaki',hu:'Khaki'},'vest'),
  _clothingProduct('vest_fishing_olive','fishing_vest','outerwear',['fishing'],16,'#65704e',{pt:'Verde-oliva',en:'Olive green',hu:'Olívazöld'},'vest'),

  _clothingProduct('sun_hat','sun_hat','headwear',['fishing'],14,'#b38b4f',{pt:'Palha',en:'Straw',hu:'Szalmaszín'}),
  _clothingProduct('sun_hat_olive','sun_hat','headwear',['fishing'],14,'#63714d',{pt:'Verde-oliva',en:'Olive green',hu:'Olívazöld'}),

  _clothingProduct('rain_cape','rain_cape','outerwear',['fishing'],22,'#5d7a90',{pt:'Azul-ardósia',en:'Slate blue',hu:'Palakék'},'cape'),
  _clothingProduct('rain_cape_yellow','rain_cape','outerwear',['fishing'],22,'#b69a49',{pt:'Mostarda',en:'Mustard',hu:'Mustársárga'},'cape'),
  _clothingProduct('top_waterproof','waterproof_top','top',['fishing'],18,'#416b7f',{pt:'Azul-petróleo',en:'Petrol blue',hu:'Olajkék'}),
  _clothingProduct('top_waterproof_olive','waterproof_top','top',['fishing'],18,'#59694e',{pt:'Verde-musgo',en:'Moss green',hu:'Mohazöld'}),
  _clothingProduct('bottom_waterproof','waterproof_trousers','bottom',['fishing'],18,'#455c67',{pt:'Chumbo azulado',en:'Blue charcoal',hu:'Kékes antracit'}),
  _clothingProduct('bottom_waterproof_dark','waterproof_trousers','bottom',['fishing'],18,'#333b41',{pt:'Carvão',en:'Coal',hu:'Szénfekete'}),
  _clothingProduct('vest_reinforced','reinforced_vest','outerwear',['fishing'],22,'#66513f',{pt:'Castanho',en:'Chestnut',hu:'Gesztenyebarna'},'vest'),
  _clothingProduct('vest_reinforced_gray','reinforced_vest','outerwear',['fishing'],22,'#62605a',{pt:'Cinza-escuro',en:'Dark gray',hu:'Sötétszürke'},'vest'),
  _clothingProduct('fishing_gloves','fishing_gloves','gloves',['fishing'],8,'#655e50',{pt:'Oliva',en:'Olive',hu:'Olíva'}),
  _clothingProduct('fishing_gloves_sand','fishing_gloves','gloves',['fishing'],8,'#b29c78',{pt:'Areia',en:'Sand',hu:'Homokszín'}),
]);

// Mapeia a roupa selecionada na criação do personagem para peças grátis iniciais.
const CLOTHING_STARTER_SETS = Object.freeze({
  arrival: Object.freeze({
    1: { top:'top_light_casual', bottom:'bottom_simple' },
    2: { top:'top_dark_casual', bottom:'bottom_simple' },
    3: { top:'top_loose_comfort', bottom:'bottom_comfort' },
    4: { top:'top_urban', bottom:'bottom_simple' },
    5: { top:'top_sturdy', bottom:'bottom_sturdy' },
  }),
  fishing: Object.freeze({
    1: { top:'top_fishing_light', bottom:'bottom_sturdy', outerwear:'vest_simple' },
    2: { top:'top_river', bottom:'bottom_sturdy', outerwear:'vest_light' },
    3: { top:'top_lake', bottom:'bottom_sturdy', headwear:'sun_hat' },
    4: { top:'top_waterproof', bottom:'bottom_waterproof', outerwear:'rain_cape' },
    5: { top:'top_sturdy', bottom:'bottom_sturdy', outerwear:'vest_reinforced', gloves:'fishing_gloves' },
  }),
});

function getClothingItem(id) {
  return CLOTHING_CATALOG.find(item => item.id === id) || null;
}
