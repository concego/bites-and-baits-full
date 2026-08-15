/** result-view.js — presentation of the result screen. */
const ResultView = (() => {
  const $ = id => document.getElementById(id);
  function render({ caught, currentFish, lastCaughtItem, score, best, translate, fishName, coins }) {
    const t = translate;
    $('result-score').textContent = score;
    $('result-best').textContent = best;
    if (caught && currentFish) {
      const useEl = $('result-fish-use');
      if (useEl) useEl.setAttribute('href', `#${currentFish.sprite}`);
      $('result-fish-svg').style.display = '';
      $('result-title').textContent = t('result_caught');
      if (lastCaughtItem) {
        $('result-desc').textContent = t('result_caught_weight', fishName(currentFish), lastCaughtItem.weight, lastCaughtItem.value, coins());
      } else {
        $('result-desc').textContent = t('result_caught_desc', fishName(currentFish));
      }
    } else {
      $('result-fish-svg').style.display = 'none';
      $('result-icon').innerHTML = '<span style="font-size:80px">💔</span>';
      $('result-title').textContent = t('result_snapped');
      $('result-desc').textContent = t('result_snapped_desc');
    }
  }
  return { render };
})();
