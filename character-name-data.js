/* character-name-data.js — Bites & Baits
 * Pools curados para o botão de nome aleatório.
 * O nome é apenas identidade narrativa; não altera aparência, atributos ou regras.
 */
const CHARACTER_RANDOM_NAMES = Object.freeze({
  feminine: Object.freeze([
    'Alice', 'Ana', 'Beatriz', 'Camila', 'Clara', 'Elisa', 'Helena',
    'Júlia', 'Laura', 'Lívia', 'Manuela', 'Marina', 'Nina', 'Sofia',
    'Valentina', 'Yasmin',
  ]),
  masculine: Object.freeze([
    'André', 'Caio', 'Daniel', 'Davi', 'Felipe', 'Gabriel', 'Heitor',
    'João', 'Lucas', 'Miguel', 'Rafael', 'Theo', 'Tomás', 'Victor',
    'Yuri', 'Mateus',
  ]),
  neutral: Object.freeze([
    'Alex', 'Ariel', 'Casey', 'Charlie', 'Dani', 'Eden', 'Kai', 'Luca',
    'Morgan', 'Niko', 'Noa', 'Quinn', 'Rio', 'Robin', 'Sam', 'Sasha',
  ]),
});

function getCharacterRandomNames(profile) {
  return CHARACTER_RANDOM_NAMES[String(profile || '')] || [];
}
