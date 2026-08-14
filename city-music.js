/**
 * city-music.js — Bites & Baits
 *
 * Inicia a trilha adequada para cada tela da cidade e invalida pedidos
 * anteriores quando o jogador troca rapidamente de tela.
 */

const CityMusic = (() => {
  let requestId = 0;

  function start(screen) {
    const request = ++requestId;
    if (!A11y.get('sound')) {
      Audio.stopCityMusic();
      return;
    }

    const starters = {
      city:   () => Audio.startCityMusic(),
      house:  () => Audio.startHouseMusic(),
      shop:   () => Audio.startShopMusic(),
      travel: () => Audio.startTravelMusic(),
      vessel: () => Audio.startVesselMusic(),
    };
    const play = starters[screen] || starters.city;
    Audio.init().then(() => {
      if (request === requestId) play();
    }).catch(() => {});
  }

  return { start };
})();
