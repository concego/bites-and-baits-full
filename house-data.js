/**
 * house-data.js — Bites & Baits
 * Níveis de upgrades da casa do jogador.
 *
 * Cada nível define:
 *   id          — chave única
 *   nameKey     — chave i18n do nome
 *   descKey     — chave i18n da descrição
 *   emoji       — ícone do nível
 *   price       — custo de upgrade (0 = nível inicial, grátis)
 *   boatSlots   — quantos barcos cabem guardados sem taxa
 *   boatTypes   — quais categorias cabem: 'portable' | 'garage' | 'dock'
 *   storageSlots — slots extras de inventário (futuro)
 *
 * Taxa de estaleiro (quando barco não cabe na casa):
 *   portable sem slot livre → 30 moedas/viagem
 *   garage   sem slot livre → 80 moedas/viagem
 *   dock     sem slot livre → taxa do próprio barco (VESSELS_CATALOG[].dockFee)
 */

const HOUSE_LEVELS = [
  {
    id:          'barraco',
    nameKey:     'house_level_0',
    descKey:     'house_desc_0',
    emoji:       '🛖',
    price:       0,
    boatSlots:   0,
    boatTypes:   [],
  },
  {
    id:          'casa_simples',
    nameKey:     'house_level_1',
    descKey:     'house_desc_1',
    emoji:       '🏠',
    price:       500,
    boatSlots:   1,
    boatTypes:   ['portable'],
  },
  {
    id:          'casa_garagem',
    nameKey:     'house_level_2',
    descKey:     'house_desc_2',
    emoji:       '🏡',
    price:       2000,
    boatSlots:   2,
    boatTypes:   ['portable', 'garage'],
  },
  {
    id:          'casa_doca',
    nameKey:     'house_level_3',
    descKey:     'house_desc_3',
    emoji:       '🏘️',
    price:       8000,
    boatSlots:   99,
    boatTypes:   ['portable', 'garage', 'dock'],
  },
];

/** Taxa fixa de estaleiro por categoria quando a casa não tem espaço */
const BOATYARD_FEE = {
  portable: 30,
  garage:   80,
};
// dock usa o dockFee do próprio barco em VESSELS_CATALOG

function getHouseLevel(level) {
  return HOUSE_LEVELS[level] ?? HOUSE_LEVELS[0];
}

function getNextHouseLevel(level) {
  return HOUSE_LEVELS[level + 1] ?? null;
}
