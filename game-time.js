/**
 * game-time.js — Bites & Baits
 * Sistema de tempo diegético.
 *
 * Armazena e avança um calendário in-game independente do relógio real.
 * O tempo só avança quando o jogador executa ações (pescar, conversar, etc.)
 *
 * Estrutura salva em localStorage ('bb_time'):
 * {
 *   year:   number,   // ano in-game (começa em 1)
 *   month:  number,   // 1–12
 *   day:    number,   // 1–30
 *   hour:   number,   // 0–23 (múltiplos de 0.5)
 *   minute: number    // 0 ou 30
 * }
 *
 * Estações (hemisf. sul — Brasil):
 *   Seca:    Abril–Setembro   (meses 4–9)
 *   Chuvosa: Outubro–Março    (meses 10–12, 1–3)
 */

const GameTime = (() => {
  const KEY      = 'bb_time';
  const DAYS_IN_MONTH = 30;
  const MONTHS        = 12;

  const MONTH_NAMES_PT = [
    '', 'Jan','Fev','Mar','Abr','Mai','Jun',
    'Jul','Ago','Set','Out','Nov','Dez'
  ];
  const MONTH_NAMES_EN = [
    '', 'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  const DAY_NAMES_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const DAY_NAMES_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Custo de tempo por ação (em horas)
  const ACTION_COST = {
    fish:      3.0,
    shop:      0.5,
    talk:      1.0,
    travel_near: 1.0,
    travel_far:  4.0,
    sleep:     null,   // null = avança até 06h do dia seguinte
  };

  function _default() {
    return { year: 1, month: 3, day: 1, hour: 8, minute: 0 };
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || _default();
    } catch { return _default(); }
  }

  function save(t) {
    localStorage.setItem(KEY, JSON.stringify(t));
  }

  /** Avança o tempo por uma ação predefinida */
  function advance(action) {
    const t    = load();
    const cost = ACTION_COST[action];
    if (cost === null) {
      // Dormir: avança para 06h do dia seguinte
      t.hour   = 6;
      t.minute = 0;
      _advanceDays(t, 1);
    } else if (cost != null) {
      _advanceHours(t, cost);
    }
    save(t);
    return t;
  }

  /** Avança N horas (incluindo frações de 0.5) */
  function _advanceHours(t, hours) {
    const total = t.hour * 60 + t.minute + Math.round(hours * 60);
    t.hour   = Math.floor(total / 60) % 24;
    t.minute = total % 60 >= 30 ? 30 : 0;
    const daysOver = Math.floor((t.hour * 60 + total % 60) / (24 * 60));
    if (total >= 24 * 60) _advanceDays(t, Math.floor(total / (24 * 60)));
  }

  function _advanceDays(t, n) {
    t.day += n;
    while (t.day > DAYS_IN_MONTH) {
      t.day -= DAYS_IN_MONTH;
      t.month += 1;
      if (t.month > MONTHS) { t.month = 1; t.year += 1; }
    }
  }

  /** Período do dia para uso nos pools de pesca */
  function period() {
    const h = load().hour;
    if (h >= 0  && h < 6)  return 'dawn';
    if (h >= 6  && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
  }

  /** Estação atual */
  function season() {
    const m = load().month;
    return (m >= 4 && m <= 9) ? 'dry' : 'rainy';
  }

  /** Número do dia da semana (0=Dom…6=Sáb) baseado em epoch simples */
  function _weekday(t) {
    const totalDays = (t.year - 1) * MONTHS * DAYS_IN_MONTH
                    + (t.month - 1) * DAYS_IN_MONTH
                    + (t.day - 1);
    return totalDays % 7;
  }

  /** String formatada para o HUD: "Seg, 03 Mar  08:00" */
  function formatHUD(lang) {
    const t    = load();
    const lang_= lang || (typeof I18n !== 'undefined' ? I18n.lang() : 'pt');
    const names = lang_ === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_PT;
    const dnames= lang_ === 'en' ? DAY_NAMES_EN   : DAY_NAMES_PT;
    const wd   = dnames[_weekday(t)];
    const dd   = String(t.day).padStart(2,'0');
    const mm   = names[t.month];
    const hh   = String(t.hour).padStart(2,'0');
    const min  = String(t.minute).padStart(2,'0');
    return { date: `${wd}, ${dd} ${mm}`, time: `${hh}:${min}`, season: season(), period: period() };
  }

  return { load, save, advance, period, season, formatHUD, ACTION_COST };
})();
